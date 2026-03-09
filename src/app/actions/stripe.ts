'use server';

import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as Stripe.LatestApiVersion,
});

export async function createUpgradeSession(formData: FormData) {
    const session = await getSession();
    const priceId = formData.get('priceId') as string;

    if (!session || !session.user) {
        redirect('/api/auth/login?returnTo=/upgrade');
    }

    if (!priceId) {
        throw new Error('Price ID is required');
    }

    // Use the userId we injected into the Auth0 profile
    // Note: Using optional chaining and fallback for robustness
    const claims = session.user['https://supabase.com/jwt/claims'];
    const userId = claims?.userId || session.user.sub;

    const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
            price: priceId,
            quantity: 1,
        }],
        success_url: `${process.env.AUTH0_BASE_URL}/profile?success=true`,
        cancel_url: `${process.env.AUTH0_BASE_URL}/profile?canceled=true`,
        client_reference_id: userId, // CRITICAL: This links the payment to the Supabase ID
        metadata: {
            userId: userId,
            auth0Id: session.user.sub
        }
    });

    if (checkoutSession.url) {
        redirect(checkoutSession.url);
    }
}
