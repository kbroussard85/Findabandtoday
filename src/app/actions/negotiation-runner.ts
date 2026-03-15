'use server';

import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { runNegotiationSession as runSession } from '@/lib/ai/negotiation/runner';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function startNegotiation(gigId: string) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!dbUser) throw new Error('User not found');

    logger.info(`[ACTION-NEGOTIATION] Starting for Gig: ${gigId} by User: ${dbUser.id}`);
    
    const result = await runSession(gigId, dbUser.id);

    revalidatePath('/dashboard/venue');
    revalidatePath('/profile');

    return { 
      success: true, 
      status: result.status, 
      currentAmount: result.currentAmount,
      history: result.history 
    };
  } catch (error) {
    logger.error({ err: error }, '[ACTION-NEGOTIATION-ERROR]:');
    return { error: error instanceof Error ? error.message : 'Negotiation failed' };
  }
}
