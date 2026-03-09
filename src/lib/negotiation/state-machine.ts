import { GigStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Valid transitions for a Gig offer lifecycle.
 */
export const VALID_TRANSITIONS: Record<GigStatus, GigStatus[]> = {
  [GigStatus.DRAFT]: [GigStatus.OFFER_SENT, GigStatus.CANCELLED, GigStatus.SUBMISSION, GigStatus.REQUEST],
  [GigStatus.SUBMISSION]: [GigStatus.PENDING_APPROVAL, GigStatus.REJECTED, GigStatus.CANCELLED],
  [GigStatus.REQUEST]: [GigStatus.OFFER_SENT, GigStatus.ACCEPTED, GigStatus.REJECTED, GigStatus.CANCELLED],
  [GigStatus.PENDING_APPROVAL]: [GigStatus.OFFER_SENT, GigStatus.ACCEPTED, GigStatus.REJECTED, GigStatus.CANCELLED],
  [GigStatus.OFFER_SENT]: [GigStatus.ESCROW_HOLD, GigStatus.REJECTED, GigStatus.COUNTER_OFFER, GigStatus.CANCELLED, GigStatus.ACCEPTED],
  [GigStatus.COUNTER_OFFER]: [GigStatus.ESCROW_HOLD, GigStatus.REJECTED, GigStatus.COUNTER_OFFER, GigStatus.CANCELLED, GigStatus.ACCEPTED],
  [GigStatus.ESCROW_HOLD]: [GigStatus.CONFIRMED, GigStatus.REJECTED, GigStatus.COUNTER_OFFER, GigStatus.CANCELLED],
  [GigStatus.CONFIRMED]: [GigStatus.BOOKED, GigStatus.CANCELLED],
  [GigStatus.ACCEPTED]: [GigStatus.BOOKED, GigStatus.CANCELLED, GigStatus.ESCROW_HOLD],
  [GigStatus.REJECTED]: [GigStatus.DRAFT, GigStatus.OFFER_SENT, GigStatus.SUBMISSION, GigStatus.REQUEST], // Allow resending if terms change
  [GigStatus.BOOKED]: [GigStatus.COMPLETED, GigStatus.CANCELLED],
  [GigStatus.COMPLETED]: [],
  [GigStatus.CANCELLED]: [GigStatus.DRAFT], // Allow restarting from draft
};

/**
 * Transitions a Gig to a new status and records the history.
 */
export async function transitionGigState(
  gigId: string,
  toStatus: GigStatus,
  actorId: string,
  reason?: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get current status
    const gig = await tx.gig.findUnique({
      where: { id: gigId },
      select: { status: true },
    });

    if (!gig) throw new Error('Gig not found');

    const fromStatus = gig.status;

    // 2. Validate transition
    const possibleTransitions = VALID_TRANSITIONS[fromStatus];
    if (!possibleTransitions.includes(toStatus)) {
      throw new Error(`Invalid transition from ${fromStatus} to ${toStatus}`);
    }

    // 3. Update status
    const updatedGig = await tx.gig.update({
      where: { id: gigId },
      data: { status: toStatus },
    });

    // 4. Log history
    await tx.offerHistory.create({
      data: {
        gigId,
        fromStatus,
        toStatus,
        changedById: actorId,
        changeReason: reason,
      },
    });

    return updatedGig;
  });
}
