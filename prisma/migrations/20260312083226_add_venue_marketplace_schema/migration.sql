-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('IN_PERSON', 'PLATFORM');

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "totalGuarantee" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "OpenDate" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "isFilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueAgreement" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "templateText" TEXT,
    "payoutStructure" JSONB,
    "uploadedFileUrl" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpenDate_venueId_eventDate_idx" ON "OpenDate"("venueId", "eventDate");

-- CreateIndex
CREATE INDEX "VenueAgreement_venueId_idx" ON "VenueAgreement"("venueId");

-- AddForeignKey
ALTER TABLE "OpenDate" ADD CONSTRAINT "OpenDate_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueAgreement" ADD CONSTRAINT "VenueAgreement_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
