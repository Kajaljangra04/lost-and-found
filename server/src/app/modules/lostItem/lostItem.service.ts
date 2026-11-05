import bcrypt from "bcrypt";
import { hashPhone } from "../../utils/phoneHash";
import { normalizeDate } from "../../utils/normalizeDate";
import { LostItem } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../config/prisma";

const toggleFoundStatus = async (id: string, userId: string) => {
  // First get the current item to check its status
  const currentItem = await prisma.lostItem.findUnique({
    where: { id, userId, isDeleted: false },
    select: { isFound: true },
  });

  if (!currentItem) {
    throw new Error("Item not found");
  }

  // Toggle the found status
  const result = await prisma.lostItem.update({
    where: {
      id,
      userId,
    },
    data: {
      isFound: !currentItem.isFound,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
    },
  });
  return result;
};

const createLostItem = async (userId: string, item: any) => {
  let ownershipSecret: any = undefined;
  if (item.ownershipQuestions || item.ownershipAnswers) {
    const questions = typeof item.ownershipQuestions === "string"
      ? JSON.parse(item.ownershipQuestions)
      : item.ownershipQuestions;
    const answers = typeof item.ownershipAnswers === "string"
      ? JSON.parse(item.ownershipAnswers)
      : item.ownershipAnswers;
    if (!Array.isArray(questions) || !Array.isArray(answers) ||
        questions.length !== 3 || answers.length !== 3 ||
        questions.some((value: unknown) => typeof value !== "string" || !value.trim()) ||
        answers.some((value: unknown) => typeof value !== "string" || !value.trim())) {
      throw new Error("Provide three ownership questions and three answers.");
    }
    const hashes = await Promise.all(answers.map((answer: string) =>
      bcrypt.hash(answer.trim().toLowerCase(), 12)
    ));
    ownershipSecret = {
      create: {
        question1: questions[0].trim(),
        question2: questions[1].trim(),
        question3: questions[2].trim(),
        answerHash1: hashes[0],
        answerHash2: hashes[1],
        answerHash3: hashes[2],
      },
    };
  }

  const result = await prisma.lostItem.create({
    data: {
      lostItemName: item.lostItemName,
      description: item.description,
      categoryId: item.categoryId,
      img: item.img,
      location: item.location,
      date: normalizeDate(item.date),
      contactName: item.contactName || "",
      contactPhone: item.contactPhone || "",
      contactPhoneHash: hashPhone(item.contactPhone),
      userId,
      ...(ownershipSecret ? { ownershipSecret } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
    },
  });
  return result;
};

const getLostItem = async () => {
  const result = await prisma.lostItem.findMany({
    where: {
      isDeleted: false, 
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
    },
  });
  return result.map(({ contactName, contactPhone, contactPhoneHash, ...item }: any) => item);
};

// get single lost item
const getSingleLostItem = async (singleId: string) => {
  const result = await prisma.lostItem.findFirst({
    where: {
      id: singleId,
      isDeleted: false, // Only get non-deleted items
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
    },
  });
  if (!result) return result;
  const { contactName, contactPhone, contactPhoneHash, ...publicItem } = result as any;
  return publicItem;
};
// get my lost item
const getMyLostItem = async (user: JwtPayload) => {
  const result = await prisma.lostItem.findMany({
    where: {
      userId: user.id,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
    },
  });
  return result;
};

const editMyLostItem = async (data: any, user?: JwtPayload) => {
  const updateData: any = {};

  if (data?.lostItemName) {
    updateData.lostItemName = data.lostItemName;
  }
  if (data?.location) {
    updateData.location = data.location;
  }
  if (data?.date) {
    updateData.date = data.date;
  }
  if (data?.description) {
    updateData.description = data.description;
  }
  if (data?.categoryId) {
    updateData.categoryId = data.categoryId;
  }
  if (data?.img) {
    updateData.img = data.img;
  }

  // If user is provided, ensure they can only edit their own items
  const whereClause: any = { id: data.id };
  if (user) {
    whereClause.userId = user.id;
  }

  const result = await prisma.lostItem.update({
    where: whereClause,
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
    },
  });
  return result;
};
const deleteMyLostItem = async (id: string, userId: string) => {
  const result = await prisma.lostItem.update({
    where: {
      id,
      userId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
    },
  });
  return result;
};
export const lostTItemServices = {
  toggleFoundStatus,
  createLostItem,
  getLostItem,
  getSingleLostItem,
  getMyLostItem,
  editMyLostItem,
  deleteMyLostItem,
};
