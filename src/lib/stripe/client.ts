import Stripe from 'stripe';

/**
 * Shared Stripe client instance (Singleton).
 * Ensure all Stripe interactions use this instance to maintain consistent configuration
 * and avoid multiple connections.
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    })
  : null;

/**
 * Creates a Stripe Connect account for a user.
 */
export async function createConnectAccount(email: string, userId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  return await stripe.accounts.create({
    type: 'express',
    email,
    metadata: { userId },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

/**
 * Generates an onboarding link for a Connect account.
 */
export async function createAccountLink(accountId: string) {
  if (!stripe) throw new Error('Stripe not configured');

  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.AUTH0_BASE_URL}/profile?stripe=refresh`,
    return_url: `${process.env.AUTH0_BASE_URL}/profile?stripe=success`,
    type: 'account_onboarding',
  });
}
