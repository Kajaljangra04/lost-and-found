import { z } from "zod";
const createFoundItemCategory = z.object({
  body: z.object({
    name: z.string({
      error: (issue) => issue.input === undefined ? "Category name field is required" : undefined,
    }),
  }),
});

export const FoundItemCategorySchema = {
  createFoundItemCategory,
};
