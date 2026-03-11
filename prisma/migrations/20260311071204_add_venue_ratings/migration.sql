-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rating_bandId_idx" ON "Rating"("bandId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_bandId_venueId_key" ON "Rating"("bandId", "venueId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
