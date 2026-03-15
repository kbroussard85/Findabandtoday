import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { CheckoutSchema } from '@/lib/validations/stripe';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { origin } = new URL(req.url);
  const baseUrl = process.env.AUTH0_BASE_URL || origin;

  try {
    if (!stripe) {
      logger.error('[STRIPE-CHECKOUT] Stripe secret key is missing from environment variables.');
      return NextResponse.json({ error: 'Stripe is not configured on the server.' }, { status: 500 });
    }

    // DIAGNOSTIC LOGGING
    try {
      const account = await stripe.accounts.retrieve();
      logger.info(`[STRIPE-CHECKOUT] Connected to Account: ${account.id} (${account.settings?.dashboard.display_name})`);
      logger.info(`[STRIPE-CHECKOUT] Using Secret Key ending in: ...${process.env.STRIPE_SECRET_KEY?.slice(-4)}`);
    } catch {
      logger.warn('[STRIPE-CHECKOUT] Could not retrieve account info - check API key permissions.');
    }

    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: No session found.' }, { status: 401 });
    }

    const body = await req.json();
    const result = CheckoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { priceId } = result.data;

    logger.info(`[STRIPE-CHECKOUT] Creating session for user: ${user.sub}, Price: ${priceId}`);

    // Retrieve price to check if it's recurring or one-time
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');

      logger.error({ err: errorMessage }, `[STRIPE-CHECKOUT] Failed to retrieve price ${priceId}:`);
      return NextResponse.json({ 
        error: `Stripe Error: The Price ID "${priceId}" could not be found.`,
        message: `${errorMessage}. Your server is currently using a ${isTestKey ? 'TEST MODE' : 'LIVE MODE'} secret key. Please ensure the Price ID exists in that specific mode.`
      }, { status: 400 });
    }
    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      client_reference_id: user.sub, // Added for more robust webhook processing
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/profile?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/profile?canceled=true`,
      metadata: {
        userId: user.sub,
      },
    });

    logger.info(`[STRIPE-CHECKOUT] Session created: ${checkoutSession.id}`);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ err: error }, '[STRIPE-CHECKOUT] Unexpected Error:');
    return NextResponse.json({
      error: 'Failed to initiate checkout.',
      message: errorMessage
    }, { status: 500 });
  }
}
