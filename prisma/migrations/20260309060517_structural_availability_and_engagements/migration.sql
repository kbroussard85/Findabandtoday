/*
  Warnings:

  - You are about to drop the column `availability` on the `Band` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `Venue` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'PAST', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('SUBMISSION', 'REQUEST');

-- AlterTable
ALTER TABLE "Band" DROP COLUMN "availability",
ADD COLUMN     "city" TEXT,
ALTER COLUMN "socialLinks" SET DEFAULT '{"instagram": "", "twitter": "", "spotify": "", "website": ""}';

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "engagementType" "EngagementType" NOT NULL DEFAULT 'REQUEST';

-- AlterTable
ALTER TABLE "Venue" DROP COLUMN "availability",
ADD COLUMN     "city" TEXT,
ALTER COLUMN "socialLinks" SET DEFAULT '{"instagram": "", "twitter": "", "spotify": "", "website": ""}';

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "bandId" TEXT,
    "venueId" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Availability_eventDate_idx" ON "Availability"("eventDate");

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
