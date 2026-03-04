/*
  Warnings:

  - You are about to drop the column `payout` on the `Gig` table. All the data in the column will be lost.
  - The `status` column on the `Gig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Gig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Gig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Gig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Gig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Gig` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MANAGER', 'MEMBER', 'GUEST');

-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('DRAFT', 'OFFER_SENT', 'COUNTER_OFFER', 'ACCEPTED', 'REJECTED', 'BOOKED', 'COMPLETED', 'CANCELLED', 'ESCROW_HOLD', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('FABT_PAY', 'CASH_DOS');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('GUARANTEE', 'SPLIT', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('NOT_APPLICABLE', 'HELD_IN_ESCROW', 'RELEASED_TO_BAND', 'REFUNDED_TO_VENUE');

-- AlterTable
ALTER TABLE "Gig" DROP COLUMN "payout",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "depositPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "holdExpiresAt" TIMESTAMP(3),
ADD COLUMN     "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "GigStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "BandMember" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BandMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueMember" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAgreement" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "payoutType" "PayoutType" NOT NULL DEFAULT 'CASH_DOS',
    "dealStructure" "DealType" NOT NULL DEFAULT 'GUARANTEE',
    "amount" DOUBLE PRECISION NOT NULL,
    "loadInTime" TEXT NOT NULL,
    "soundCheckTime" TEXT NOT NULL,
    "setStartTime" TEXT NOT NULL,
    "setDuration" INTEGER NOT NULL,
    "venueAccepted" BOOLEAN NOT NULL DEFAULT false,
    "bandAccepted" BOOLEAN NOT NULL DEFAULT false,
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "stagePlotSnapshot" TEXT,
    "i9Snapshot" TEXT,

    CONSTRAINT "BookingAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferHistory" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "fromStatus" "GigStatus" NOT NULL,
    "toStatus" "GigStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BandMember_bandId_userId_key" ON "BandMember"("bandId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueMember_venueId_userId_key" ON "VenueMember"("venueId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAgreement_gigId_key" ON "BookingAgreement"("gigId");

-- CreateIndex
CREATE INDEX "OfferHistory_gigId_createdAt_idx" ON "OfferHistory"("gigId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Gig_stripePaymentIntentId_key" ON "Gig"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "BandMember" ADD CONSTRAINT "BandMember_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BandMember" ADD CONSTRAINT "BandMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMember" ADD CONSTRAINT "VenueMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMember" ADD CONSTRAINT "VenueMember_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAgreement" ADD CONSTRAINT "BookingAgreement_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferHistory" ADD CONSTRAINT "OfferHistory_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
