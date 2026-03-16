/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emailsToUpgrade = process.env.EMAILS ? process.env.EMAILS.split(',') : [];

async function upgradeUsers(emails) {
  if (emails.length === 0) {
    console.log("No emails provided. Set EMAILS env var. Example: EMAILS=test1@gmail.com,test2@gmail.com node upgrade.js");
    return;
  }

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`User not found: ${email}`);
      continue;
    }

    const tier = user.role === 'VENUE' ? 'PRO_VENUE' : 'BIZ_BAND';
    
    await prisma.user.update({
      where: { email },
      data: {
        isPaid: true,
        subscriptionTier: tier,
      }
    });
    
    // Also update Supabase profile if using Supabase sync
    try {
      await prisma.profiles.update({
        where: { id: user.id }, // Assuming ID matches or Auth0 matches
        data: {
          is_pro: true,
          subscription_status: 'active',
          stripe_subscription_tier: tier
        }
      });
    } catch(e) { /* ignore if no supabase mapping */ }

    console.log(`✅ Upgraded ${email} (${user.role}) to ${tier}`);
  }
}

upgradeUsers(emailsToUpgrade).finally(() => prisma.$disconnect());
