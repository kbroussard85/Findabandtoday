import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[STRIPE-WEBHOOK] Error verifying signature: ${errorMessage}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // This is the ID we passed in the Server Action: client_reference_id
        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer as string;

        if (!userId) {
            console.error('[STRIPE-WEBHOOK] Missing client_reference_id in session');
            return NextResponse.json({ error: 'Missing client_reference_id' }, { status: 400 });
        }

        try {
            // UPDATE DATABASE using Prisma
            // We first try to find by our internal ID, or auth0Id if that's what was passed
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    isPaid: true,
                    subscriptionStatus: 'active',
                    stripeCustomerId: stripeCustomerId,
                    subscriptionTier: 'PRO' // Or whatever tier identifier you prefer
                }
            });

            console.log(`[STRIPE-WEBHOOK] Successfully upgraded user ${user.id} to Pro`);
        } catch (error) {
            console.error('[STRIPE-WEBHOOK] Prisma Update Error:', error);

            // Fallback: If userId was actually the Auth0 sub, try updating by auth0Id
            try {
                const user = await prisma.user.update({
                    where: { auth0Id: userId },
                    data: {
                        isPaid: true,
                        subscriptionStatus: 'active',
                        stripeCustomerId: stripeCustomerId,
                        subscriptionTier: 'PRO'
                    }
                });
                console.log(`[STRIPE-WEBHOOK] Successfully upgraded user ${user.id} (via auth0Id) to Pro`);
            } catch (fallbackError) {
                console.error('[STRIPE-WEBHOOK] Fallback Prisma Update Error:', fallbackError);
                return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
            }
        }
    }

    // Handle other events like subscription deletion (cancellation)
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        try {
            await prisma.user.update({
                where: { stripeCustomerId: stripeCustomerId },
                data: {
                    isPaid: false,
                    subscriptionStatus: 'canceled'
                }
            });
            console.log(`[STRIPE-WEBHOOK] Subscription canceled for customer ${stripeCustomerId}`);
        } catch (error) {
            console.error('[STRIPE-WEBHOOK] Error handling subscription deletion:', error);
        }
    }

    return NextResponse.json({ received: true });
}
