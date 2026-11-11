import { z } from "zod";
const createFoundItem = z.object({
  body: z.object({
    foundItemName: z.string({
      error: (issue) => issue.input === undefined ? "Item name field is required" : undefined,
    }).trim().min(2).max(120),
    categoryId: z.string().uuid(),
    contactName: z.string().trim().min(2).max(100).optional(),
    contactPhone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/).optional(),
    location: z.string({
      error: (issue) => issue.input === undefined ? "Location of item field is required" : undefined,
    }).trim().min(2).max(300),
    description: z.string({
      error: (issue) => issue.input === undefined ? "Description of item field is required" : undefined,
    }).trim().min(5).max(3000),
    img: z.string({
      error: (issue) => issue.input === undefined ? "Image of item field is required" : undefined,
    }),
    claimProcess: z.string({
      error: (issue) => issue.input === undefined ? "Claim Process of item field is required" : undefined,
    }),
    date: z.string({
      error: (issue) => issue.input === undefined ? "Date of item field is required" : undefined,
    }),
  }),
});

export const FoundItemSchema = {
  createFoundItem,
};
