'use server';

import { getSession } from '@auth0/nextjs-auth0';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

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

        const auth0Id = session.user.sub;
        const email = session.user.email;

        // 1. Get or Create the local user and their Stripe Customer ID
        let dbUser = await prisma.user.findUnique({
            where: { auth0Id },
        });

        if (!dbUser) {
            throw new Error('User record not found in database.');
        }

        let stripeCustomerId = dbUser.stripeCustomerId;

        // 2. If no Stripe Customer exists, create one now
        // This resolves the "Accounts V2" requirement for an existing customer
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    auth0Id: auth0Id,
                    userId: dbUser.id
                }
            });
            stripeCustomerId = customer.id;

            // Update local DB with the new Stripe Customer ID
            await prisma.user.update({
                where: { id: dbUser.id },
                data: { stripeCustomerId }
            });
        }

        const baseUrl = process.env.AUTH0_BASE_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        // 3. Create Checkout Session with the explicit customer ID
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: stripeCustomerId, // Explicitly passing the existing customer
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            success_url: `${baseUrl}/profile?success=true`,
            cancel_url: `${baseUrl}/profile?canceled=true`,
            client_reference_id: auth0Id,
            metadata: {
                auth0Id: auth0Id
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
