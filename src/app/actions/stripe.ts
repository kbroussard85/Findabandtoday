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

        // 1. Get the local user
        const dbUser = await prisma.user.findUnique({
            where: { auth0Id },
        });

        if (!dbUser) {
            throw new Error('User record not found in database.');
        }

        let stripeCustomerId = dbUser.stripeCustomerId;
        let needsNewCustomer = !stripeCustomerId;

        // 2. VERIFY & REPAIR: If we have an ID, check if it exists in the NEW Stripe account
        if (stripeCustomerId) {
            try {
                await stripe.customers.retrieve(stripeCustomerId);
                console.log(`[STRIPE] Verified existing customer: ${stripeCustomerId}`);
            } catch (err) {
                console.log(`[STRIPE] Customer ID ${stripeCustomerId} not found in this account. Creating new one.`);
                needsNewCustomer = true;
            }
        }

        // 3. Create a new Customer if needed
        if (needsNewCustomer) {
            const customer = await stripe.customers.create({
                email: email,
                name: dbUser.name || undefined,
                metadata: {
                    auth0Id: auth0Id,
                    userId: dbUser.id
                }
            });
            stripeCustomerId = customer.id;

            // Update local DB with the new valid Stripe Customer ID
            await prisma.user.update({
                where: { id: dbUser.id },
                data: { stripeCustomerId }
            });
            console.log(`[STRIPE] Created and saved new customer: ${stripeCustomerId}`);
        }

        const baseUrl = process.env.AUTH0_BASE_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        // 4. Create Checkout Session with the verified customer ID
        console.log(`[STRIPE] Initiating checkout for customer: ${stripeCustomerId} with price: ${priceId}`);
        
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: stripeCustomerId!, 
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
