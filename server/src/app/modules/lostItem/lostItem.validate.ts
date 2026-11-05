import { z } from "zod";

const createLostItem = z.object({
  body: z.object({
    lostItemName: z.string().trim().min(2).max(120),
    description: z.string().trim().min(5).max(3000),
    categoryId: z.string().uuid(),
    img: z.string().url(),
    location: z.string().trim().min(2).max(300),
    date: z.string().min(1),
    contactName: z.string().trim().min(2).max(100).optional(),
    contactPhone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/).optional(),
    ownershipQuestions: z.string().optional(),
    ownershipAnswers: z.string().optional(),
  }),
});

export const LostItemSchema = { createLostItem };
