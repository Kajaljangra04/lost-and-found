import { z } from "zod";
const createFoundItem = z.object({
  body: z.object({
    foundItemName: z.string({
      required_error: "Item name field is required",
    }).trim().min(2).max(120),
    categoryId: z.string().uuid(),
    contactName: z.string().trim().min(2).max(100).optional(),
    contactPhone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/).optional(),
    location: z.string({
      required_error: "Location of item field is required",
    }).trim().min(2).max(300),
    description: z.string({
      required_error: "Description of item field is required",
    }).trim().min(5).max(3000),
    img: z.string({
      required_error: "Image of item field is required",
    }),
    claimProcess: z.string({
      required_error: "Claim Process of item field is required",
    }),
    date: z.string({
      required_error: "Date of item field is required",
    }),
  }),
});

export const FoundItemSchema = {
  createFoundItem,
};
