/*
  Warnings:

  - You are about to drop the `ArtistMedia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArtistMedia" DROP CONSTRAINT "ArtistMedia_userId_fkey";

-- DropTable
DROP TABLE "ArtistMedia";

-- CreateTable
CREATE TABLE "artist_media" (
    "id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artist_media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "artist_media" ADD CONSTRAINT "artist_media_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
