import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { StatusCodes } from "http-status-codes";
import prisma from "../../config/prisma";
import AppError from "../../global/error";
import { deliverOtp } from "../../utils/otpDelivery";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const issueEmailVerificationOtp = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { emailVerificationOtp: true },
  });

  if (!user || user.isDeleted || !user.activated) {
    throw new AppError(StatusCodes.NOT_FOUND, "Account not found.");
  }

  if (user.emailVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email is already verified.");
  }

  const existingOtp = user.emailVerificationOtp;

  if (
    existingOtp &&
    Date.now() - existingOtp.sentAt.getTime() < RESEND_COOLDOWN_MS
  ) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Please wait 60 seconds before requesting another code."
    );
  }

  const otp = String(randomInt(100000, 1000000));
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.emailVerificationOtp.upsert({
    where: { userId },
    create: {
      userId,
      otpHash,
      expiresAt,
      attempts: 0,
      sentAt: new Date(),
    },
    update: {
      otpHash,
      expiresAt,
      attempts: 0,
      sentAt: new Date(),
    },
  });

  try {
    await deliverOtp({
      to: user.email,
      otp,
      subject: "Verify your Findora account",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2>Verify your Findora account</h2>
          <p>Use the following one-time code to verify your email address:</p>
          <h1 style="letter-spacing:8px">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not create this account, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    await prisma.emailVerificationOtp.deleteMany({
      where: { userId, otpHash },
    });
    throw error;
  }

  return {
    email: user.email,
    message: "A verification code has been issued. It expires in 10 minutes.",
  };
};

const verifyEmailOtp = async (email: string, otp: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^\d{6}$/.test(otp)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Enter a valid six-digit code.");
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { emailVerificationOtp: true },
  });

  if (!user || user.isDeleted || !user.activated) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid email or verification code.");
  }

  if (user.emailVerified) {
    return { emailVerified: true, message: "Email is already verified." };
  }

  const record = user.emailVerificationOtp;

  if (!record) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No active verification code. Please request a new one."
    );
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Maximum verification attempts reached. Request a new code."
    );
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Verification code expired. Please request a new one."
    );
  }

  const matches = await bcrypt.compare(otp, record.otpHash);

  if (!matches) {
    await prisma.emailVerificationOtp.update({
      where: { userId: user.id },
      data: { attempts: { increment: 1 } },
    });

    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Incorrect verification code."
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationOtp.delete({
      where: { userId: user.id },
    }),
  ]);

  return {
    emailVerified: true,
    message: "Email verified successfully. You can now log in.",
  };
};

const resendEmailVerificationOtp = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.isDeleted || !user.activated) {
    // Do not disclose whether an account exists.
    return {
      message: "If the account is eligible, a verification code will be issued.",
    };
  }

  if (user.emailVerified) {
    return {
      message: "If the account is eligible, a verification code will be issued.",
    };
  }

  await issueEmailVerificationOtp(user.id);

  return {
    message: "If the account is eligible, a verification code will be issued.",
  };
};

export const emailVerificationService = {
  issueEmailVerificationOtp,
  verifyEmailOtp,
  resendEmailVerificationOtp,
};
