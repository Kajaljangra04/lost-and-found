import { status } from "../../global/globalValues";
import { z } from "zod";
const createClaim = z.object({
  body: z.object({
    foundItemId: z.string({
      error: (issue) => issue.input === undefined ? "Claim item id field is required" : undefined,
    }),
    distinguishingFeatures: z.string({
      error: (issue) => issue.input === undefined ? "Distinguishing features of claim item field is required" : undefined,
    }),
    lostDate: z.string({
      error: (issue) => issue.input === undefined ? "Lost date of claim item field is required" : undefined,
    }),
  }),
});
const updateClaim = z.object({
  body: z.object({
    foundItemId: z.string().optional(),
    distinguishingFeatures: z.string().optional(),
    lostDate: z.string().optional(),
    status: z
      .enum([status.approved, status.pending, status.rejected])
      .optional(),
  },{message:"Invalid input"}),
});

export const ItemClaimSchema = {
  createClaim,
  updateClaim,
};
