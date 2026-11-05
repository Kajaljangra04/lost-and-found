import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { matchingService } from "./matching.service";

const aiMatches = async (req: Request, res: Response) => {
  try {
    const lostItemId = String(req.params.id || "");
    const lost = await prisma.lostItem.findFirst({
      where: { id: lostItemId, userId: req.user.id, isDeleted: false },
      select: { id: true, lostItemName: true },
    });
    if (!lost) return res.status(404).json({ success: false, message: "Lost item not found." });

    await matchingService.forLostItem(lostItemId);
    const candidates = await prisma.matchCandidate.findMany({
      where: { lostItemId },
      include: {
        foundItem: {
          select: {
            id: true, foundItemName: true, description: true, img: true,
            location: true, date: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { score: "desc" },
      take: 10,
    });
    const safeCandidates = candidates;
    return res.json({
      success: true,
      message: "Potential matches ranked. Ownership is not confirmed.",
      data: { lostItem: lost, count: safeCandidates.length, candidates: safeCandidates },
      disclaimer: "AI and text similarity scores are ranking signals, never proof of ownership.",
    });
  } catch (error) {
    console.error("AI matching failed:", error);
    return res.status(503).json({ success: false, message: "Matching is temporarily unavailable." });
  }
};


const aiMatchesForFound = async (req: Request, res: Response) => {
  try {
    const foundItemId = String(req.params.id || "");
    const found = await prisma.foundItem.findFirst({
      where: { id: foundItemId, userId: req.user.id, isDeleted: false },
      select: { id: true, foundItemName: true },
    });
    if (!found) return res.status(404).json({ success: false, message: "Found item not found." });
    await matchingService.forFoundItem(foundItemId);
    const candidates = await prisma.matchCandidate.findMany({
      where: { foundItemId },
      include: {
        lostItem: {
          select: {
            id: true, lostItemName: true, description: true, img: true,
            location: true, date: true, category: { select: { name: true } },
          },
        },
      },
      orderBy: { score: "desc" },
      take: 10,
    });
    return res.json({
      success: true,
      message: "Potential lost-item candidates ranked.",
      data: { foundItem: found, count: candidates.length, candidates },
      disclaimer: "A ranking score is not proof of ownership.",
    });
  } catch (error) {
    console.error("Found-item matching failed:", error);
    return res.status(503).json({ success: false, message: "Matching is temporarily unavailable." });
  }
};

const getChallenge = async (req: Request, res: Response) => {
  const candidate = await prisma.matchCandidate.findUnique({
    where: { id: req.params.matchId },
    include: { foundItem: { select: { userId: true } }, lostItem: true },
  });
  if (!candidate) return res.status(404).json({ success: false, message: "Match not found." });
  if (candidate.foundItem.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: "Only the finder can complete this verification." });
  }
  if (candidate.score < 55 || !["POTENTIAL_MATCH", "VERIFICATION_PENDING"].includes(candidate.status)) {
    return res.status(409).json({ success: false, message: "This candidate is not eligible for verification." });
  }
  const secret = await prisma.ownershipSecret.findUnique({
    where: { lostItemId: candidate.lostItemId },
    select: { question1: true, question2: true, question3: true, lockedUntil: true },
  });
  if (!secret) return res.status(404).json({ success: false, message: "The reporter did not provide ownership questions." });
  if (secret.lockedUntil && secret.lockedUntil > new Date()) {
    return res.status(429).json({ success: false, message: "Verification is temporarily locked. Try again later." });
  }
  if (["POTENTIAL_MATCH", "VERIFICATION_PENDING"].includes(candidate.status)) {
    await prisma.$transaction([
      prisma.matchCandidate.update({ where: { id: candidate.id }, data: { status: "VERIFICATION_PENDING" } }),
      prisma.lostItem.update({ where: { id: candidate.lostItemId }, data: { status: "VERIFICATION_PENDING" } }),
      prisma.foundItem.update({ where: { id: candidate.foundItemId }, data: { status: "VERIFICATION_PENDING" } }),
    ]);
  }
  return res.json({ success: true, data: { questions: [secret.question1, secret.question2, secret.question3] } });
};

const verifyOwnership = async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.matchCandidate.findUnique({
      where: { id: req.params.matchId },
      include: { foundItem: true, lostItem: true },
    });
    if (!candidate) return res.status(404).json({ success: false, message: "Match not found." });
    if (candidate.foundItem.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the finder can submit ownership verification." });
    }
    if (!["POTENTIAL_MATCH", "VERIFICATION_PENDING"].includes(candidate.status)) {
      return res.status(409).json({ success: false, message: "This match is not awaiting ownership verification." });
    }
    if (!Array.isArray(req.body.answers) || req.body.answers.length !== 3 ||
        req.body.answers.some((answer: unknown) => typeof answer !== "string" || !answer.trim())) {
      return res.status(400).json({ success: false, message: "Submit all three ownership answers." });
    }
    const secret = await prisma.ownershipSecret.findUnique({ where: { lostItemId: candidate.lostItemId } });
    if (!secret) return res.status(404).json({ success: false, message: "Ownership questions are unavailable." });
    if (secret.lockedUntil && secret.lockedUntil > new Date()) {
      return res.status(429).json({ success: false, message: "Verification is temporarily locked." });
    }

    const hashes = [secret.answerHash1, secret.answerHash2, secret.answerHash3];
    const checks = await Promise.all(req.body.answers.map((answer: string, index: number) =>
      bcrypt.compare(answer.trim().toLowerCase(), hashes[index])
    ));
    if (!checks.every(Boolean)) {
      const attempts = secret.verificationAttempts + 1;
      await prisma.ownershipSecret.update({
        where: { id: secret.id },
        data: {
          verificationAttempts: attempts >= 5 ? 0 : attempts,
          lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      return res.status(400).json({
        success: false,
        message: attempts >= 5 ? "Too many incorrect attempts. Verification is locked for 15 minutes." : "One or more answers did not match. Please try again.",
      });
    }

    await prisma.$transaction([
      prisma.matchCandidate.update({
        where: { id: candidate.id },
        data: { status: "MATCHED" },
      }),
      prisma.lostItem.update({ where: { id: candidate.lostItemId }, data: { status: "MATCHED" } }),
      prisma.foundItem.update({ where: { id: candidate.foundItemId }, data: { status: "MATCHED" } }),
      prisma.matchCandidate.updateMany({
        where: { lostItemId: candidate.lostItemId, id: { not: candidate.id }, status: { in: ["POTENTIAL_MATCH", "VERIFICATION_PENDING"] } },
        data: { status: "REJECTED" },
      }),
      prisma.ownershipSecret.update({
        where: { id: secret.id },
        data: { verificationAttempts: 0, lockedUntil: null },
      }),
      prisma.notification.create({
        data: {
          userId: candidate.lostItem.userId,
          title: "Your item has been verified",
          message: `The finder passed the private ownership check for "${candidate.lostItem.lostItemName}". Arrange a safe handover.`,
          type: "MATCHED",
          metadata: { matchId: candidate.id },
        },
      }),
      prisma.notification.create({
        data: {
          userId: candidate.foundItem.userId,
          title: "Ownership verified",
          message: `The private ownership check for "${candidate.foundItem.foundItemName}" passed. You can now arrange a handover.`,
          type: "MATCHED",
          metadata: { matchId: candidate.id },
        },
      }),
    ]);
    return res.json({ success: true, message: "Ownership verified. The item is matched and ready for handover.", data: { status: "MATCHED" } });
  } catch (error) {
    console.error("Ownership verification failed:", error);
    return res.status(500).json({ success: false, message: "Ownership verification failed." });
  }
};

const startHandover = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      return res.status(503).json({ success: false, message: "Handover email is not configured. Set RESEND_API_KEY and EMAIL_FROM." });
    }
    const candidate = await prisma.matchCandidate.findUnique({
      where: { id: req.params.matchId },
      include: {
        lostItem: { include: { user: { select: { email: true, name: true } } } },
        foundItem: { include: { user: { select: { id: true } } } },
        handover: true,
      },
    });
    if (!candidate) return res.status(404).json({ success: false, message: "Match not found." });
    if (candidate.foundItem.user.id !== req.user.id) return res.status(403).json({ success: false, message: "Only the finder can initiate handover." });
    if (!["MATCHED", "HANDOVER_PENDING"].includes(candidate.status)) return res.status(409).json({ success: false, message: "Ownership must be verified before handover." });
    if (candidate.status === "HANDOVER_PENDING" && candidate.handover && Date.now() - candidate.handover.sentAt.getTime() < 60_000) {
      return res.status(429).json({ success: false, message: "A handover code was sent recently. Wait one minute before requesting another." });
    }

    const otp = String(randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 12);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    const mail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [candidate.lostItem.user.email],
        subject: "Findora handover verification code",
        html: `<p>Your Findora handover code is <strong>${otp}</strong>.</p><p>Share it with the finder only when you are physically receiving your item. It expires in 10 minutes.</p>`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!mail.ok) {
      console.error("Resend handover email failed:", mail.status, await mail.text());
      return res.status(502).json({ success: false, message: "Could not deliver the handover code. Please try again." });
    }

    await prisma.$transaction([
      prisma.handover.upsert({
        where: { matchCandidateId: candidate.id },
        create: { matchCandidateId: candidate.id, otpHash, expiresAt: expiry, attempts: 0 },
        update: { otpHash, expiresAt: expiry, attempts: 0, verifiedAt: null, receivedAt: null, sentAt: new Date() },
      }),
      prisma.matchCandidate.update({ where: { id: candidate.id }, data: { status: "HANDOVER_PENDING" } }),
      prisma.lostItem.update({ where: { id: candidate.lostItemId }, data: { status: "HANDOVER_PENDING" } }),
      prisma.foundItem.update({ where: { id: candidate.foundItemId }, data: { status: "HANDOVER_PENDING" } }),
    ]);
    return res.json({ success: true, message: "A one-time handover code was emailed to the item reporter. It expires in 10 minutes." });
  } catch (error) {
    console.error("Handover initiation failed:", error);
    return res.status(500).json({ success: false, message: "Could not start the handover." });
  }
};

const confirmHandover = async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.matchCandidate.findUnique({
      where: { id: req.params.matchId },
      include: { foundItem: true, lostItem: true, handover: true },
    });
    if (!candidate) return res.status(404).json({ success: false, message: "Match not found." });
    if (candidate.foundItem.userId !== req.user.id) return res.status(403).json({ success: false, message: "Only the finder can confirm receipt." });
    if (candidate.status !== "HANDOVER_PENDING" || !candidate.handover) return res.status(409).json({ success: false, message: "No active handover exists." });
    if (candidate.handover.expiresAt < new Date()) return res.status(410).json({ success: false, message: "The handover code has expired." });
    if (candidate.handover.attempts >= 5) return res.status(429).json({ success: false, message: "Too many incorrect attempts." });
    const code = String(req.body.otp || "").trim();
    if (!/^\d{6}$/.test(code) || !(await bcrypt.compare(code, candidate.handover.otpHash))) {
      await prisma.handover.update({ where: { id: candidate.handover.id }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ success: false, message: "Invalid handover code." });
    }
    await prisma.$transaction([
      prisma.handover.update({ where: { id: candidate.handover.id }, data: { verifiedAt: new Date(), receivedAt: new Date() } }),
      prisma.matchCandidate.update({ where: { id: candidate.id }, data: { status: "RECEIVED" } }),
      prisma.lostItem.update({ where: { id: candidate.lostItemId }, data: { isFound: true, status: "RECEIVED" } }),
      prisma.foundItem.update({ where: { id: candidate.foundItemId }, data: { isClaimed: true, status: "RECEIVED" } }),
      prisma.notification.create({
        data: {
          userId: candidate.lostItem.userId,
          title: "Item successfully returned",
          message: `Receipt of "${candidate.lostItem.lostItemName}" has been confirmed.`,
          type: "RECEIVED",
          metadata: { matchId: candidate.id },
        },
      }),
      prisma.notification.create({
        data: {
          userId: candidate.foundItem.userId,
          title: "Handover completed",
          message: `The handover for "${candidate.foundItem.foundItemName}" has been confirmed. Thank you for helping return it.`,
          type: "RECEIVED",
          metadata: { matchId: candidate.id },
        },
      }),
    ]);
    return res.json({ success: true, message: "Handover confirmed. The item is marked as received.", data: { status: "RECEIVED" } });
  } catch (error) {
    console.error("Handover confirmation failed:", error);
    return res.status(500).json({ success: false, message: "Could not confirm handover." });
  }
};

export const aiMatchesController = { aiMatches, aiMatchesForFound, getChallenge, verifyOwnership, startHandover, confirmHandover };
