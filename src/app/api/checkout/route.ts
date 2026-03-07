import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
  })
  : null;

export async function POST(req: Request) {
  const { origin } = new URL(req.url);
  const baseUrl = process.env.AUTH0_BASE_URL || origin;

  try {
    if (!stripe) {
      console.error('[STRIPE-CHECKOUT] Stripe secret key is missing from environment variables.');
      return NextResponse.json({ error: 'Stripe is not configured on the server.' }, { status: 500 });
    }
    
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: No session found.' }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Missing Price ID in request body.' }, { status: 400 });
    }

    console.log(`[STRIPE-CHECKOUT] Creating session for user: ${user.sub}, Price: ${priceId}`);

    // Retrieve price to check if it's recurring or one-time
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (err: any) {
      console.error(`[STRIPE-CHECKOUT] Failed to retrieve price ${priceId}:`, err.message);
      return NextResponse.json({ 
        error: `Stripe Error: The Price ID "${priceId}" could not be found. Check if you are in Test Mode vs Live Mode.`,
        message: err.message
      }, { status: 400 });
    }

    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/profile?success=true`,
      cancel_url: `${baseUrl}/profile?canceled=true`,
      metadata: {
        userId: user.sub,
      },
    });

    console.log(`[STRIPE-CHECKOUT] Session created: ${checkoutSession.id}`);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('[STRIPE-CHECKOUT] Unexpected Error:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate checkout.',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
