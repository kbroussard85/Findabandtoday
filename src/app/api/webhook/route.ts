import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
        console.error('[STRIPE-WEBHOOK] Missing secret or signature');
        return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[STRIPE-WEBHOOK] Error verifying signature: ${errorMessage}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer as string;

        if (!userId) {
            console.error('[STRIPE-WEBHOOK] No userId found in session');
            return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        try {
            await prisma.user.update({
                where: { auth0Id: userId },
                data: {
                    stripeCustomerId,
                    isPaid: true,
                    subscriptionStatus: 'active'
                },
            });
            console.log(`[STRIPE-WEBHOOK] User ${userId} upgraded successfully`);
        } catch (error) {
            console.error('[STRIPE-WEBHOOK] Database update failed:', error);
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        try {
            await prisma.user.update({
                where: { stripeCustomerId },
                data: {
                    isPaid: false,
                    subscriptionStatus: 'canceled',
                    subscriptionTier: null
                },
            });
            console.log(`[STRIPE-WEBHOOK] Subscription canceled for customer ${stripeCustomerId}`);
        } catch (error) {
            console.error('[STRIPE-WEBHOOK] Error handling subscription deletion:', error);
        }
    }

    return NextResponse.json({ received: true });
}
