'use server';

import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { createVerificationSession } from '@/lib/stripe/client';
import { logger } from '@/lib/logger';

export async function startIdentityVerification() {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!dbUser) throw new Error('User not found');

    const verificationSession = await createVerificationSession(dbUser.id);

    // Link the session ID to the user for tracking
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        identityVerificationId: verificationSession.id,
        identityStatus: 'pending'
      }
    });

    logger.info(`[STRIPE-IDENTITY] Started verification session ${verificationSession.id} for user ${dbUser.id}`);

    return { clientSecret: verificationSession.client_secret };
  } catch (error) {
    logger.error({ err: error }, '[STRIPE-IDENTITY-ACTION-ERROR]:');
    return { error: error instanceof Error ? error.message : 'Failed to start verification' };
  }
}
