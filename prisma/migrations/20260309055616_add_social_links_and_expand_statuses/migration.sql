/*
  Warnings:

  - You are about to drop the column `stripeConnectAccountId` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GigStatus" ADD VALUE 'SUBMISSION';
ALTER TYPE "GigStatus" ADD VALUE 'REQUEST';
ALTER TYPE "GigStatus" ADD VALUE 'PENDING_APPROVAL';

-- DropIndex
DROP INDEX "User_stripeConnectAccountId_key";

-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "socialLinks" JSONB DEFAULT '{"instagram": "", "spotify": "", "youtube": ""}';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeConnectAccountId",
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "socialLinks" JSONB DEFAULT '{"instagram": "", "spotify": "", "youtube": ""}';
