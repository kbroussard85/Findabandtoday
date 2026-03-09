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
        redirect('/api/auth/login');
    }

    if (!priceId) {
        throw new Error('Price ID is required');
    }

    // Determine the base URL for redirects
    const baseUrl = process.env.AUTH0_BASE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Use auth0Id directly for the client_reference_id to ensure we can find the user in the webhook
    const userId = session.user.sub;

    try {
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
            throw new Error('Failed to create Stripe checkout URL');
        }

        // Return the URL instead of redirecting inside the try/catch
        // to avoid the NEXT_REDIRECT error being treated as a crash
        return { url: checkoutSession.url };
    } catch (error) {
        console.error('[STRIPE_ERROR]:', error);
        throw error;
    }
}
