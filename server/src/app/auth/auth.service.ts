import { emailVerificationService } from "../modules/user/emailVerification.service";
import { utils } from "../utils/utils";
import AppError from "../global/error";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../config/prisma";

const loginUser = async (data: any) => {
  const { password, username: loginUsername, email: loginEmail } = data;
  const userNameEmail = loginUsername?.trim() || loginEmail?.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: userNameEmail,
        },
        {
          email: userNameEmail,
        },
      ],
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User does not exist");
  }

  if (typeof password !== "string" || password.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is required");
  }

  if (!(await utils.comparePasswords(password, user.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  if (!user.emailVerified) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Please verify your email before logging in."
    );
  }

  if (!user.activated || user.isDeleted) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Account is inactive or unavailable");
  }

  const { id, name, email, role, userImg, username } = user;
  const accessToken = utils.createToken({ id, name, email, username, role, userImg });

  return {
    id: user.id,
    name: name || "User",
    username: user.username,
    email: user.email,
    role,
    token: accessToken,
  };
};

const newPasswords = async (data: any, user: JwtPayload) => {
  if (data.currentPassword === data.newPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is same");
  }
  const existedUser = await prisma.user.findFirst({
    where: {
      username: user.username,
    },
  });
  // console.log(user)
  if (
    data.currentPassword &&
    existedUser &&
    !(await utils.comparePasswords(data.currentPassword, existedUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is incorrect");
  }

  const newHashPassword = await utils.passwordHash(data.newPassword);
  await prisma.user.update({
    where: {
      email: existedUser?.email,
    },
    data: {
      password: newHashPassword,
    },
  });
};

const changeEmail = async (email: string, user: JwtPayload) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email is required.");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!currentUser || currentUser.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser && existingUser.id !== currentUser.id) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Email already exists. Try another email."
    );
  }

  if (currentUser.email === normalizedEmail && currentUser.emailVerified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This email is already verified."
    );
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      email: normalizedEmail,
      emailVerified: false,
    },
  });

  try {
    await emailVerificationService.issueEmailVerificationOtp(currentUser.id);
  } catch (error) {
    // Restore the original account email if OTP delivery or issuance fails.
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
      },
    });

    throw error;
  }

  return {
    email: normalizedEmail,
    emailVerified: false,
    message: "Email updated. Please verify your new email address.",
  };
};

const changeUsername = async (username: object, user: JwtPayload) => {
  const existedUser = await prisma.user.findFirst({
    where: username,
  });
  if (existedUser) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Username already exists. Try new one!"
    );
  }

  // console.log(user);
  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: username,
  });
};

export const authServices = {
  loginUser,
  newPasswords,
  changeEmail,
  changeUsername,
};
