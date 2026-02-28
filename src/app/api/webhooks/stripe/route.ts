import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { auth0Id: userId },
          data: { 
            isPaid: true, 
            stripeCustomerId: session.customer as string,
            subscriptionStatus: 'active'
          },
        });
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
