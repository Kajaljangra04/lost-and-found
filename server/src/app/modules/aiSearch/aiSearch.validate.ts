import { z } from "zod";

const aiSearchSchema = z.object({
  body: z.object({
    query: z.string({ required_error: "Search query is required" }).trim().min(1).max(500),
    type: z.enum(["ALL", "LOST", "FOUND"]).optional(),
    location: z.string().max(200).optional(),
    category: z.string().max(100).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export const aiSearchValidation = { aiSearchSchema };
