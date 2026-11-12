import bcrypt from "bcrypt";
import { createHash, randomBytes, randomInt } from "crypto";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/prisma";
import AppError from "../global/error";
import { utils } from "../utils/utils";
import { deliverOtp } from "../utils/otpDelivery";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const GENERIC_MESSAGE =
  "If an eligible account exists for that email, a password reset code will be sent.";

const hashResetToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const requestPasswordReset = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { passwordResetOtp: true },
  });

  if (!user || user.isDeleted || !user.activated || !user.emailVerified) {
    return { message: GENERIC_MESSAGE };
  }

  const existing = user.passwordResetOtp;

  if (
    existing &&
    Date.now() - existing.sentAt.getTime() < RESEND_COOLDOWN_MS
  ) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Please wait 60 seconds before requesting another reset code."
    );
  }

  const otp = String(randomInt(100000, 1000000));
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.passwordResetOtp.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      otpHash,
      expiresAt,
      attempts: 0,
      sentAt: new Date(),
    },
    update: {
      otpHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      expiresAt,
      attempts: 0,
      sentAt: new Date(),
    },
  });

  try {
    await deliverOtp({
      to: user.email,
      otp,
      subject: "Reset your Findora password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2>Reset your Findora password</h2>
          <p>Use this one-time code to continue resetting your password:</p>
          <h1 style="letter-spacing:8px">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request a password reset, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    await prisma.passwordResetOtp.deleteMany({
      where: { userId: user.id, otpHash },
    });
    throw error;
  }

  return { message: GENERIC_MESSAGE };
};

const verifyPasswordResetOtp = async (email: string, otp: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^\d{6}$/.test(otp)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Enter a valid six-digit code."
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { passwordResetOtp: true },
  });

  const record = user?.passwordResetOtp;

  if (
    !user ||
    user.isDeleted ||
    !user.activated ||
    !user.emailVerified ||
    !record ||
    !record.otpHash
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid or expired reset code."
    );
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Maximum attempts reached. Request a new reset code."
    );
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Reset code expired. Request a new one."
    );
  }

  const matches = await bcrypt.compare(otp, record.otpHash);

  if (!matches) {
    await prisma.passwordResetOtp.update({
      where: { userId: user.id },
      data: { attempts: { increment: 1 } },
    });

    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Incorrect reset code."
    );
  }

  const resetToken = randomBytes(32).toString("hex");

  await prisma.passwordResetOtp.update({
    where: { userId: user.id },
    data: {
      otpHash: null,
      resetTokenHash: hashResetToken(resetToken),
      resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
      expiresAt: new Date(),
      attempts: 0,
    },
  });

  return {
    resetToken,
    expiresIn: RESET_TOKEN_EXPIRY_MS / 1000,
    message: "Code verified. You can now reset your password.",
  };
};

const resetPassword = async (
  resetToken: string,
  newPassword: string
) => {
  if (!resetToken || !/^[a-f0-9]{64}$/i.test(resetToken)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid or expired password reset session."
    );
  }

  const resetTokenHash = hashResetToken(resetToken);

  const record = await prisma.passwordResetOtp.findFirst({
    where: {
      resetTokenHash,
      resetTokenExpiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (
    !record ||
    !record.user ||
    record.user.isDeleted ||
    !record.user.activated
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid or expired password reset session."
    );
  }

  const passwordHash = await utils.passwordHash(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: passwordHash },
    }),
    prisma.passwordResetOtp.delete({
      where: { userId: record.userId },
    }),
  ]);

  return {
    message:
      "Password reset successfully. You can now log in with your new password.",
  };
};

export const passwordRecoveryService = {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
};
