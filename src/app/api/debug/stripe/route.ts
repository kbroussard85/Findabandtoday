import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Stripe Debug Route Hit');
  
  const results: {
    status: string;
    env: Record<string, string>;
    connectivity: string;
    account: { id: string; email: string | null; business_name: string | undefined | null } | null;
    price_verification?: string;
    error?: string;
  } = {
    status: 'DEBUG_ACTIVE',
    env: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Present (Starts with ' + process.env.STRIPE_SECRET_KEY.slice(0, 7) + '...)' : '❌ MISSING',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Present' : '❌ MISSING',
      NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID ? '✅ ' + process.env.NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID : '❌ MISSING',
    },
    connectivity: 'Testing...',
    account: null,
  };

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ...results, error: 'Missing Stripe Secret Key' }, { status: 500 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as unknown as Stripe.LatestApiVersion,
    });

    const account = await stripe.accounts.retrieve();
    results.connectivity = '✅ Connected Successfully';
    results.account = {
      id: account.id,
      email: account.email,
      business_name: account.settings?.dashboard?.display_name
    };

    const priceId = process.env.NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID;
    if (priceId) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        results.price_verification = `✅ Price ID found: ${price.unit_amount ? price.unit_amount / 100 : 0} ${price.currency.toUpperCase()}`;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        results.price_verification = `❌ Price ID NOT FOUND: ${errorMessage}`;
      }
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({
      ...results,
      connectivity: '❌ Failed',
      error: errorMessage
    }, { status: 500 });
  }
}
