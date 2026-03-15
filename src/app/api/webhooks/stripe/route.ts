import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import prisma from '@/lib/prisma';
import type Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { Client } from "@upstash/workflow";
import { GigStatus, FinancialLogType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const workflowClient = new Client({
  baseUrl: process.env.UPSTASH_WORKFLOW_URL,
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is missing');
    return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret as string);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`Webhook Error: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const gigId = paymentIntent.metadata?.gigId;
      if (gigId) {
        // This usually triggers for manual captures or direct payments
        await prisma.gig.update({
          where: { id: gigId },
          data: { 
            status: GigStatus.CONFIRMED, 
            depositPaid: true 
          }
        });
      }
      break;

    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      const bookingGigId = session.metadata?.gigId;
      
      if (bookingGigId) {
        // CASE: GIG BOOKING PAYMENT
        logger.info(`[STRIPE-WEBHOOK] Booking payment completed for Gig: ${bookingGigId}`);
        
        try {
          const gig = await prisma.gig.findUnique({ where: { id: bookingGigId } });
          if (!gig) throw new Error("Gig not found during webhook processing");

          await prisma.$transaction([
            prisma.gig.update({
              where: { id: bookingGigId },
              data: {
                status: GigStatus.PAID_ESCROW,
                depositPaid: true,
                stripePaymentIntentId: session.payment_intent as string,
              }
            }),
            prisma.financialLog.create({
              data: {
                gigId: bookingGigId,
                type: FinancialLogType.CREDIT,
                amount: gig.totalAmount + (gig.trustFee || 0),
                description: 'Booking payment captured in Escrow (via Checkout)'
              }
            })
          ]);

          // Trigger Upstash Payout Workflow
          const baseUrl = process.env.AUTH0_BASE_URL || `https://${process.env.VERCEL_URL}`;
          await workflowClient.trigger({
            url: `${baseUrl}/api/workflow/payout`,
            body: { gigId: bookingGigId },
          });

          logger.info(`[STRIPE-WEBHOOK] Triggered payout workflow for Gig: ${bookingGigId}`);
        } catch (error) {
          logger.error({ err: error }, `[STRIPE-WEBHOOK] Failed to process booking completion for Gig: ${bookingGigId}`);
        }
      } else if (userId) {
        // CASE: USER SUBSCRIPTION UPGRADE
        logger.info(`[STRIPE-WEBHOOK] Checkout completed for user: ${userId}, Customer: ${session.customer}`);
        try {
          await prisma.user.update({
            where: { auth0Id: userId },
            data: { 
              isPaid: true, 
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active'
            },
          });
        } catch (dbError) {
          logger.error({ err: dbError }, `[STRIPE-WEBHOOK] Subscription update failed for user ${userId}:`);
        }
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
      // Stripe Standard accounts manage their own verification, but we can track submitted status
      if (account.details_submitted) {
        // For standard accounts, we update the user based on the Connect Account ID
        await prisma.user.updateMany({
          where: { stripeAccountId: account.id },
          data: { isPaid: true }, // Mark as verified for business
        });
      }
      break;

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
