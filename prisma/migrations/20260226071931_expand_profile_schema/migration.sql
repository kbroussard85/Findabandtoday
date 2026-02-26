-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "availability" JSONB,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "media" JSONB,
ADD COLUMN     "negotiationPrefs" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionStatus" TEXT;

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "availability" JSONB,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "media" JSONB,
ADD COLUMN     "negotiationPrefs" JSONB;
