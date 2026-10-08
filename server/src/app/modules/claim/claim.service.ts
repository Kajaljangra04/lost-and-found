import { Claim, status } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../config/prisma";

const createClaim = async (item: Claim, user: JwtPayload) => {
  const result = await prisma.claim.create({
    data: {
      foundItemId: item.foundItemId,
      distinguishingFeatures: item.distinguishingFeatures,
      lostDate: new Date(item.lostDate),
      userId: user.id,
    },
  });
  return result;
};
const getClaim = async () => {
  const result = await prisma.claim.findMany({
    where: {
      isDeleted: false,
      foundItem: {
        isDeleted: false,
      },
    },
    include: {
      foundItem: {
        include: {
          category: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });
  return result;
};
const getMyClaim = async (user: JwtPayload) => {
  const result = await prisma.claim.findMany({
    where: {
      userId: user.id,
      foundItem: {
        isDeleted: false, // Only get claims for non-deleted found items
      },
    },
    include: {
      foundItem: {
        include: {
          category: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
  return result;
};

const updateClaimStatus = async (claimId: string, data: Partial<Claim>) => {
  // Start a transaction to ensure all updates happen together
  const result = await prisma.$transaction(async (tx) => {
    // Update the claim status
    const updatedClaim = await tx.claim.update({
      where: {
        id: claimId,
      },
      data,
      include: {
        foundItem: true,
      },
    });

    // If the claim is being approved
    if (data.status === "APPROVED") {
      // Mark the found item as claimed
      await tx.foundItem.update({
        where: {
          id: updatedClaim.foundItemId,
        },
        data: {
          isClaimed: true,
        },
      });

      // Reject all other pending claims for the same found item
      await tx.claim.updateMany({
        where: {
          foundItemId: updatedClaim.foundItemId,
          id: {
            not: claimId, // Exclude the current claim
          },
          status: "PENDING",
        },
        data: {
          status: "REJECTED",
        },
      });
    }

    // If the claim is being rejected, check if there are any other approved claims
    if (data.status === "REJECTED") {
      const approvedClaims = await tx.claim.findMany({
        where: {
          foundItemId: updatedClaim.foundItemId,
          status: "APPROVED",
        },
      });

      // If no approved claims exist, mark the item as available
      if (approvedClaims.length === 0) {
        await tx.foundItem.update({
          where: {
            id: updatedClaim.foundItemId,
          },
          data: {
            isClaimed: false,
          },
        });
      }
    }

    return updatedClaim;
  });

  return result;
};

export const claimsService = {
  createClaim,
  getClaim,
  updateClaimStatus,
  getMyClaim,
};
