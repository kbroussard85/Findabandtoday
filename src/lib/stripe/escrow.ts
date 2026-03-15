import { stripe } from './client';
import prisma from '../prisma';

/**
 * FABT REVENUE MODEL CONSTANTS
 */
const PLATFORM_FEE_PERCENT = 0.05; // 5%
const PLATFORM_FEE_FLAT = 5;       // $5 flat fee for platform pay

/**
 * STEP 1: INITIALIZE ESCROW OR FEE VERIFICATION
 * Triggered when a Venue initiates a booking or swipes right.
 */
export async function initializeBookingHold(gigId: string, amount: number, method: 'PLATFORM' | 'IN_PERSON') {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      venue: { include: { user: true } },
      band: { include: { user: true } }
    }
  });

  if (!gig) throw new Error("Gig not found.");

  if (method === 'PLATFORM') {
    // Escrow full amount from Venue
    if (!gig.venue.user.stripeCustomerId) throw new Error("Venue stripe customer ID not found.");

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount * 100), // Full amount in cents
        currency: 'usd',
        customer: gig.venue.user.stripeCustomerId,
        capture_method: 'manual', // Hold funds
        metadata: { gigId: gigId, type: 'GIG_ESCROW', method: 'PLATFORM' },
      },
      { idempotencyKey: `escrow-${gigId}` }
    );

    await prisma.gig.update({
      where: { id: gigId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'ESCROW_HOLD',
        paymentMethod: 'PLATFORM'
      }
    });

    return { clientSecret: paymentIntent.client_secret, method: 'PLATFORM' };
  } else {
    // IN_PERSON: Just verify band has payment method for 5% commission
    if (!gig.band.user.stripeCustomerId) throw new Error("Band stripe customer ID not found.");
    
    // We don't hold the 5% now, we just ensure we can bill it later.
    // In a real app, we'd check for a saved payment method.
    
    await prisma.gig.update({
      where: { id: gigId },
      data: {
        status: 'PENDING_APPROVAL',
        paymentMethod: 'IN_PERSON',
        payoutStatus: 'HELD_IN_ESCROW'
      }
    });

    return { success: true, method: 'IN_PERSON' };
  }
}

/**
 * STEP 2: CAPTURE ESCROW (PLATFORM PAY ONLY)
 * Triggered when the booking is finalized.
 */
export async function captureBookingEscrow(gigId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });
  if (!gig?.stripePaymentIntentId) throw new Error("No payment intent found.");

  const intent = await stripe.paymentIntents.capture(
    gig.stripePaymentIntentId,
    {},
    { idempotencyKey: `capture-${gigId}` }
  );

  await prisma.gig.update({
    where: { id: gigId },
    data: {
      status: 'CONFIRMED',
      depositPaid: true,
      payoutStatus: 'HELD_IN_ESCROW'
    }
  });

  return intent;
}

/**
 * RELEASE HOLD (FAILED DEAL)
 */
export async function releaseBookingHold(gigId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });

  if (gig?.stripePaymentIntentId) {
    await stripe.paymentIntents.cancel(gig.stripePaymentIntentId);
    await prisma.gig.update({
      where: { id: gigId },
      data: { status: 'CANCELLED' }
    });
  }
}
