-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "logoUrl" TEXT,
ALTER COLUMN "socialLinks" SET DEFAULT '{"spotify": "", "youtube": "", "tiktok": "", "instagram": "", "website": ""}';

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "logoUrl" TEXT,
ALTER COLUMN "socialLinks" SET DEFAULT '{"spotify": "", "youtube": "", "tiktok": "", "instagram": "", "website": ""}';
