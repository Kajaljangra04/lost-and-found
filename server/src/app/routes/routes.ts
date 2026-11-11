import { aiMatchesController } from "../modules/aiMatches/aiMatches.controller";
import express from "express";
import { userController } from "../modules/user/user.controllers";
import { authController } from "../auth/auth.controller";
import { itemcategoryController } from "../modules/itemCategory/itemcategory.controller";
import auth from "../midddlewares/auth";
import adminAuth from "../midddlewares/adminAuth";
import { uploadItemImage } from "../midddlewares/itemImageUpload";
import { foundItemController } from "../modules/foundItems/foundItem.controller";
import { claimsController } from "../modules/claim/claim.controller";
import validateRequest from "../midddlewares/validate";
import { UserSchema } from "../modules/user/user.validate";
import { FoundItemCategorySchema } from "../modules/itemCategory/itemCategory.validate";
import { FoundItemSchema } from "../modules/foundItems/foundItems.validate";
import { ItemClaimSchema } from "../modules/claim/claim.validate";
import { lostItemController } from "../modules/lostItem/lost.controller";
import { LostItemSchema } from "../modules/lostItem/lostItem.validate";
import { utils } from "../utils/utils";
import { adminStats } from "../utils/adminStats";
import { aiSearchController } from "../modules/aiSearch/aiSearch.controller";
import { aiSearchValidation } from "../modules/aiSearch/aiSearch.validate";
import { recentActivity } from "../utils/recentActivity";
import prisma from "../config/prisma";
import { uploadCsv } from "../midddlewares/csvUpload";
import { bulkImport } from "../modules/admin/bulkImport.controller";
import {
  registerLimiter,
  loginLimiter,
  verifyEmailLimiter,
  resendVerificationLimiter,
  startHandoverLimiter,
  confirmHandoverLimiter,
} from "../midddlewares/rateLimiters";

const router = express.Router();
////////////////////////////////////////////////// user //////////////////////////////////////////////
// user registraion
router.post(
  "/register",
  registerLimiter,
  validateRequest(UserSchema.userRegisterSchema),
  userController.registerUser
);

// Email verification
router.post(
  "/verify-email",
  verifyEmailLimiter,
  validateRequest(UserSchema.verifyEmailSchema),
  userController.verifyEmail
);

router.post(
  "/resend-verification",
  resendVerificationLimiter,
  validateRequest(UserSchema.resendVerificationSchema),
  userController.resendVerification
);

//get users
router.get(
  "/users",
  auth(),
  adminAuth,
  userController.allUsers
);

// user login
router.post(
  "/login",
  loginLimiter,
  validateRequest(UserSchema.userLoginSchema),
  authController.login
);
///////////////////////////////////////////////////profile //////////////////////////////////////////////
// change password
router.post(
  "/change-password",
  auth(),
  validateRequest(UserSchema.changePasswordSchema),
  authController.newPasswords
);
// change email
router.post(
  "/change-email",
  auth(),
  validateRequest(UserSchema.changeEmailSchema),
  authController.changeEmail
);
// change username
router.post(
  "/change-username",
  auth(),
  validateRequest(UserSchema.changeUsernameSchema),
  authController.changeUsername
);
///////////////////////////////////////////////////found item//////////////////////////////////////////////
// category create
router.post(
  "/item-categories",
  validateRequest(FoundItemCategorySchema.createFoundItemCategory),
  auth(),
  adminAuth,
  itemcategoryController.createItemCategory
);

// category get
router.get(
  "/item-categories",
  itemcategoryController.getItemCategory
);

// category update
router.put(
  "/item-categories/:id",
  validateRequest(FoundItemCategorySchema.createFoundItemCategory),
  auth(),
  adminAuth,
  itemcategoryController.updateItemCategory
);

// category delete
router.delete(
  "/item-categories/:id",
  auth(),
  adminAuth,
  itemcategoryController.deleteItemCategory
);
// found item create
router.post(
  "/found-items",
  auth(),
  uploadItemImage,
  validateRequest(FoundItemSchema.createFoundItem),
  foundItemController.createFoundItem
);
// found item get
router.get("/found-items", foundItemController.getFoundItem);
// single found item get
router.get("/found-item/:id", foundItemController.getSingleFoundItem);
///////////////////////////////////////////////////claim//////////////////////////////////////////////
// claim create
router.post(
  "/claims",
  validateRequest(ItemClaimSchema.createClaim),
  auth(),
  claimsController.createClaim
);

// claims get all
router.get("/claims", auth(), adminAuth, claimsController.getClaim);

// my claims get
router.get("/my/claims", auth(), claimsController.getMyClaim);

// claims update
router.put(
  "/claims/:claimId",
  validateRequest(ItemClaimSchema.updateClaim),
  auth(),
  adminAuth,
  claimsController.updateClaimStatus
);
///////////////////////////////////////////////////lost item//////////////////////////////////////////////

// lost item mark as found
router.put("/found-lost", auth(), lostItemController.toggleFoundStatus);
// create lost item
router.post(
  "/lostItem",
  auth(),
  uploadItemImage,
  validateRequest(LostItemSchema.createLostItem),
  lostItemController.createLostItem
);
// get lost item
router.get("/lostItem", lostItemController.getLostItem);
// get single lost item
router.get("/lostItem/:id", lostItemController.getSingleLostItem);
// get my lost item
router.get("/my/lostItem",auth(), lostItemController.getMyLostItem);
// get my found item
router.get("/my/foundItem",auth(), foundItemController.getMyFoundItem);

// my lost item edit
router.put("/my/lostItem",auth(), lostItemController.editMyLostItem);
// my found item edit
router.put("/my/foundItem",auth(), foundItemController.editMyFoundItem);

// delete my lost item
router.delete("/my/lostItem/:id",auth(), lostItemController.deleteMyLostItem);
// delete my found item
router.delete("/my/foundItem/:id",auth(), foundItemController.deleteMyFoundItem);


// get stats for admin
router.get("/admin/stats", auth(), adminAuth, adminStats);

// block a user
router.put("/block/user/:id", auth(), adminAuth, userController.blockUser);

// change user role
router.put("/change-role/:id", auth(), adminAuth, userController.changeUserRole);

// soft delete user
router.delete("/delete-user/:id", auth(), adminAuth, userController.softDeleteUser);

// AI search
router.post(
  "/ai-search",
  validateRequest(aiSearchValidation.aiSearchSchema),
  aiSearchController.aiSearch
);

// recent activity (admin dashboard feed)
router.get("/recent-activity", auth(), adminAuth, recentActivity);


// AI-ranked candidates; this endpoint does not approve or claim items.
router.get("/ai-matches", auth(), aiMatchesController.getMyMatches);
router.get("/ai-matches/lost/:id", auth(), aiMatchesController.aiMatches);
router.get("/ai-matches/found/:id", auth(), aiMatchesController.aiMatchesForFound);
router.get("/ai-matches/:matchId/challenge", auth(), aiMatchesController.getChallenge);
router.post("/ai-matches/:matchId/verify", auth(), aiMatchesController.verifyOwnership);
router.post("/ai-matches/:matchId/handover", startHandoverLimiter, auth(), aiMatchesController.startHandover);
router.post("/ai-matches/:matchId/received", confirmHandoverLimiter, auth(), aiMatchesController.confirmHandover);

// Admin-only CSV bulk import (XLSX requires an additional parser dependency).
router.post("/admin/bulk-import", auth(), adminAuth, uploadCsv, bulkImport);

// Public recovered-item stories; contact details and private answers are excluded.
router.get("/recovered-items", async (_req, res) => {
  const items = await prisma.matchCandidate.findMany({
    where: { status: "RECEIVED" },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      id: true,
      updatedAt: true,
      lostItem: { select: { lostItemName: true, img: true, location: true } },
      foundItem: { select: { foundItemName: true, img: true, location: true } },
    },
  });
  res.json({ success: true, data: items });
});

// Public aggregate counts; no user or contact data is returned.
router.get("/public/stats", async (_req, res) => {
  const [lost, found, matches, received] = await Promise.all([
    prisma.lostItem.count({ where: { isDeleted: false, isFound: false } }),
    prisma.foundItem.count({ where: { isDeleted: false, isClaimed: false } }),
    prisma.matchCandidate.count({ where: { status: "POTENTIAL_MATCH" } }),
    prisma.matchCandidate.count({ where: { status: "RECEIVED" } }),
  ]);
  res.json({ success: true, data: { lost, found, matches, received } });
});

// Private notifications for the signed-in account.
router.get("/notifications", auth(), async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ success: true, data: notifications });
});
router.put("/notifications/:id/read", auth(), async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { readAt: new Date() },
  });
  res.json({ success: true, data: { updated: result.count } });
});

export default router;
