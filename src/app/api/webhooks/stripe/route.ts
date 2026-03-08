import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    })
  : null;

// Amelia: Use the specific whsec key provided by the team for verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_FLFOK5CeOJtxh25gcHiBmnRIkccb9A3M';

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const gigId = paymentIntent.metadata?.gigId;
      if (gigId) {
        await prisma.gig.update({
          where: { id: gigId },
          data: { 
            status: 'CONFIRMED', 
            depositPaid: true 
          }
        });
      }
      break;
    case 'payment_intent.amount_capturable_updated':
      const capturableIntent = event.data.object as Stripe.PaymentIntent;
      const gigIdToHold = capturableIntent.metadata?.gigId;
      if (gigIdToHold) {
        await prisma.gig.update({
          where: { id: gigIdToHold },
          data: { 
            status: 'ESCROW_HOLD'
          }
        });
      }
      break;
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      
      console.log(`[STRIPE-WEBHOOK] Checkout completed for user: ${userId}, Customer: ${session.customer}`);

      if (userId) {
        try {
          const updatedUser = await prisma.user.update({
            where: { auth0Id: userId },
            data: { 
              isPaid: true, 
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active'
            },
          });
          console.log(`[STRIPE-WEBHOOK] Successfully provisioned Pro status for user: ${updatedUser.email}`);
        } catch (dbError) {
          console.error(`[STRIPE-WEBHOOK] Database update failed for user ${userId}:`, dbError);
          // In a real app, you might want to retry or alert admins
        }
      } else {
        console.warn('[STRIPE-WEBHOOK] No userId found in session client_reference_id or metadata.');
      }
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: { isPaid: false, subscriptionStatus: 'canceled' },
      });
      break;
    case 'account.updated':
      const account = event.data.object as Stripe.Account;
      if (account.details_submitted) {
        await prisma.user.update({
          where: { stripeCustomerId: account.id },
          data: { isPaid: true }, // Mark as verified for business
        });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
