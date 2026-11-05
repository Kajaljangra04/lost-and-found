-- Add sample-data flags to lost and found items.
-- Existing records default to false.

ALTER TABLE "lostItems"
ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "foundItems"
ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN NOT NULL DEFAULT FALSE;
