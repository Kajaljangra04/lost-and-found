import { User } from "@prisma/client";
import { utils } from "../../utils/utils";
import AppError from "../../global/error";
import prisma from "../../config/prisma";

const registerUser = async (user: User) => {
  const normalizedEmail = user.email.trim().toLowerCase();
  const normalizedUsername = user.username.trim();

  const existedUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: normalizedUsername },
        { email: normalizedEmail },
      ],
    },
  });

  if (existedUser) {
    throw new AppError(400, "Username or email already exists.");
  }

  const hashedPassword = await utils.passwordHash(user.password);

  const createdUser = await prisma.user.create({
    data: {
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      userImg: user.userImg,
      emailVerified: false,
    },
    select: {
      id: true,
      userImg: true,
      username: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return createdUser;
};

const allUsers = async () => {
  const result = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true, name: true, username: true, email: true, role: true,
      activated: true, userImg: true, createdAt: true, updatedAt: true,
    },
    orderBy: {
      activated: "desc",
    },
  });
  return result;
};

const blockUser = async (id: string) => {
  const users = await prisma.user.findFirst({
    where: {
      AND: [{ id }, { activated: true }],
    },
  });

  if (users) {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        activated: false,
      },
    });
    return "block";
  } else {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        activated: true,
      },
    });
    return "active";
  }
};

const changeUserRole = async (id: string, role: string) => {
  if (role !== "ADMIN" && role !== "USER") {
    throw new Error("Invalid user role.");
  }
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      role: role as any,
    },
  });

  return {
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
    activated: updatedUser.activated,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
};

const softDeleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isDeleted) {
    throw new AppError(400, "User is already deleted");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      activated: false,
    },
  });

  return {
    id: updatedUser.id,
    username: user.username,
    email: user.email,
    deleted: true,
    deletedAt: updatedUser.deletedAt,
  };
};

export const userService = {
  registerUser,
  allUsers,
  blockUser,
  changeUserRole,
  softDeleteUser,
};
