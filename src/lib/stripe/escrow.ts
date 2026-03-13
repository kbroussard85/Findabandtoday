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
        paymentMethod: 'IN_PERSON'
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
      depositPaid: true
    }
  });

  return intent;
}

/**
 * STEP 3: PAYOUT & COMMISSION
 * Triggered post-show (manual or cron).
 */
export async function processPostShowFinancials(gigId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      band: { include: { user: true } },
      venue: { include: { user: true } }
    }
  });

  if (!gig) throw new Error("Gig not found.");

  const amount = gig.totalAmount;
  const platformFee = Math.round((amount * PLATFORM_FEE_PERCENT + (gig.paymentMethod === 'PLATFORM' ? PLATFORM_FEE_FLAT : 0)) * 100);

  if (gig.paymentMethod === 'PLATFORM') {
    // Pay Band: Total - 5% - $5
    if (!gig.band.user.stripeAccountId) throw new Error("Band Connect account not found.");

    const transferAmount = Math.round(amount * 100) - platformFee;

    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: 'usd',
      destination: gig.band.user.stripeAccountId,
      transfer_group: `gig-${gigId}`,
      metadata: { gigId }
    });

    await prisma.gig.update({
      where: { id: gigId },
      data: { 
        payoutStatus: 'RELEASED_TO_BAND',
        platformFee: platformFee / 100
      }
    });

    return transfer;
  } else {
    // IN_PERSON: Charge band 5% commission
    if (!gig.band.user.stripeCustomerId) throw new Error("Band stripe customer ID not found.");

    const charge = await stripe.paymentIntents.create({
      amount: platformFee,
      currency: 'usd',
      customer: gig.band.user.stripeCustomerId,
      off_session: true,
      confirm: true,
      payment_method_types: ['card'],
      description: `5% Commission for Gig: ${gig.title}`,
      metadata: { gigId, type: 'COMMISSION' }
    });

    await prisma.gig.update({
      where: { id: gigId },
      data: { 
        platformFee: platformFee / 100,
        payoutStatus: 'RELEASED_TO_BAND' // For In-Person, this means commission was paid
      }
    });

    return charge;
  }
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
