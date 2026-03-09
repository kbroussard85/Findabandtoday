'use server';

import { getSession } from '@auth0/nextjs-auth0';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as unknown as Stripe.LatestApiVersion, 
});

export async function createUpgradeSession(formData: FormData) {
    try {
        const session = await getSession();
        const priceId = formData.get('priceId') as string;

        if (!session || !session.user) {
            throw new Error('You must be logged in to upgrade.');
        }

        if (!priceId) {
            throw new Error('Price ID is missing.');
        }

        const baseUrl = process.env.AUTH0_BASE_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const userId = session.user.sub;

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            success_url: `${baseUrl}/profile?success=true`,
            cancel_url: `${baseUrl}/profile?canceled=true`,
            client_reference_id: userId,
            customer_email: session.user.email,
            metadata: {
                auth0Id: session.user.sub
            }
        });

        if (!checkoutSession.url) {
            throw new Error('Stripe failed to return a checkout URL.');
        }

        return { url: checkoutSession.url };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initiate checkout.';
        console.error('[STRIPE_ACTION_ERROR]:', error);
        return { error: errorMessage };
    }
}
