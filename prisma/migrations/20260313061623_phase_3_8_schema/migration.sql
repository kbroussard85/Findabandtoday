-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "minPayoutRequirement" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "vaultCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "expiresAt" TIMESTAMP(3) DEFAULT (now() + '72:00:00'::interval),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "minPayoutRequirement" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "vaultCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "engagements" ADD COLUMN     "expires_at" TIMESTAMPTZ(6) DEFAULT (now() + '72:00:00'::interval),
ADD COLUMN     "is_active" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "stripe_subscription_tier" TEXT DEFAULT 'free',
ADD COLUMN     "vault_completed_at" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "VaultAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaultAsset_ownerId_idx" ON "VaultAsset"("ownerId");

-- AddForeignKey
ALTER TABLE "VaultAsset" ADD CONSTRAINT "VaultAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
