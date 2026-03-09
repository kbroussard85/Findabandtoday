import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    env: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Present (Starts with ' + process.env.STRIPE_SECRET_KEY.slice(0, 7) + '...)' : '❌ MISSING',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Present' : '❌ MISSING',
      NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID ? '✅ ' + process.env.NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID : '❌ MISSING',
    },
    connectivity: 'Testing...',
    account: null,
    products: []
  };

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing Stripe Secret Key in environment' }, { status: 500 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any,
    });

    // 1. Test Key Validity & IP Restrictions
    const account = await stripe.accounts.retrieve();
    results.connectivity = '✅ Connected Successfully';
    results.account = {
      id: account.id,
      email: account.email,
      business_name: account.settings?.dashboard?.display_name
    };

    // 2. Test Price ID existence
    const priceId = process.env.NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID;
    if (priceId) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        results.price_verification = `✅ Price ID ${priceId} found (${(price.unit_amount! / 100).toFixed(2)} ${price.currency.toUpperCase()})`;
      } catch (e: any) {
        results.price_verification = `❌ Price ID ${priceId} NOT FOUND in this Stripe account.`;
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[STRIPE_DEBUG_ERROR]:', error);
    return NextResponse.json({
      ...results,
      connectivity: '❌ Failed',
      error: error.message,
      hint: 'Ensure your Vercel/Local env vars match your Stripe Dashboard keys.'
    }, { status: 500 });
  }
}
