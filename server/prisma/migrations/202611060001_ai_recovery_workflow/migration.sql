-- Additive Findora recovery workflow migration.
-- Existing users, lostItems, foundItems, claims and categories are preserved.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';

ALTER TABLE "lostItems"
  ADD COLUMN IF NOT EXISTS "contactName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "contactPhone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "contactPhoneHash" TEXT NOT NULL DEFAULT '';

ALTER TABLE "foundItems"
  ADD COLUMN IF NOT EXISTS "contactName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "contactPhone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "contactPhoneHash" TEXT NOT NULL DEFAULT '';

DO $$ BEGIN
  CREATE TYPE "RecoveryStatus" AS ENUM (
    'LOST', 'FOUND', 'POTENTIAL_MATCH', 'VERIFICATION_PENDING', 'MATCHED', 'HANDOVER_PENDING', 'RECEIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "lostItems" ADD COLUMN IF NOT EXISTS "status" "RecoveryStatus" NOT NULL DEFAULT 'LOST';
ALTER TABLE "foundItems" ADD COLUMN IF NOT EXISTS "status" "RecoveryStatus" NOT NULL DEFAULT 'FOUND';

DO $$ BEGIN
  CREATE TYPE "MatchStatus" AS ENUM (
    'POTENTIAL_MATCH',
    'VERIFICATION_PENDING',
    'MATCHED',
    'HANDOVER_PENDING',
    'RECEIVED',
    'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "matchCandidates" (
  "id" TEXT NOT NULL,
  "lostItemId" TEXT NOT NULL,
  "foundItemId" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "confidence" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "status" "MatchStatus" NOT NULL DEFAULT 'POTENTIAL_MATCH',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "matchCandidates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "matchCandidates_lostItemId_fkey"
    FOREIGN KEY ("lostItemId") REFERENCES "lostItems"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "matchCandidates_foundItemId_fkey"
    FOREIGN KEY ("foundItemId") REFERENCES "foundItems"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "matchCandidates_lostItemId_foundItemId_key"
  ON "matchCandidates"("lostItemId", "foundItemId");
CREATE INDEX IF NOT EXISTS "matchCandidates_lostItemId_score_idx"
  ON "matchCandidates"("lostItemId", "score");
CREATE INDEX IF NOT EXISTS "matchCandidates_foundItemId_score_idx"
  ON "matchCandidates"("foundItemId", "score");

CREATE TABLE IF NOT EXISTS "ownershipSecrets" (
  "id" TEXT NOT NULL,
  "lostItemId" TEXT NOT NULL,
  "question1" TEXT NOT NULL,
  "question2" TEXT NOT NULL,
  "question3" TEXT NOT NULL,
  "answerHash1" TEXT NOT NULL,
  "answerHash2" TEXT NOT NULL,
  "answerHash3" TEXT NOT NULL,
  "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ownershipSecrets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ownershipSecrets_lostItemId_fkey"
    FOREIGN KEY ("lostItemId") REFERENCES "lostItems"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ownershipSecrets_lostItemId_key"
  ON "ownershipSecrets"("lostItemId");

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'INFO',
  "metadata" JSONB,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx"
  ON "notifications"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "handovers" (
  "id" TEXT NOT NULL,
  "matchCandidateId" TEXT NOT NULL,
  "otpHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  CONSTRAINT "handovers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "handovers_matchCandidateId_fkey"
    FOREIGN KEY ("matchCandidateId") REFERENCES "matchCandidates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "handovers_matchCandidateId_key"
  ON "handovers"("matchCandidateId");
