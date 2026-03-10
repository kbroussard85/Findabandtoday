/*
  Warnings:

  - A unique constraint covering the columns `[stripeAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeAccountId" TEXT;

-- CreateTable
CREATE TABLE "engagements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sender_id" TEXT,
    "receiver_id" TEXT,
    "type" TEXT,
    "status" TEXT DEFAULT 'pending',
    "event_date" DATE,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "stripe_customer_id" TEXT,
    "is_pro" BOOLEAN DEFAULT false,
    "is_artist" BOOLEAN DEFAULT false,
    "subscription_status" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "social_links" JSONB DEFAULT '{"spotify": "", "website": "", "instagram": ""}',
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_stripe_customer_id_key" ON "profiles"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeAccountId_key" ON "User"("stripeAccountId");

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
