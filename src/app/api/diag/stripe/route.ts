import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    })
    : null;

export async function GET() {
    if (!stripe) {
        return NextResponse.json({
            error: 'Stripe not configured',
            env_keys: Object.keys(process.env).filter(k => k.includes('STRIPE'))
        });
    }

    try {
        const account = await stripe.accounts.retrieve();
        return NextResponse.json({
            status: 'success',
            account_id: account.id,
            display_name: account.settings?.dashboard.display_name,
            key_prefix: process.env.STRIPE_SECRET_KEY?.slice(0, 7) + '...',
            key_suffix: '...' + process.env.STRIPE_SECRET_KEY?.slice(-4),
            env_keys: Object.keys(process.env).filter(k => k.includes('STRIPE'))
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({
            status: 'error',
            message: errorMessage,
            env_keys: Object.keys(process.env).filter(k => k.includes('STRIPE'))
        }, { status: 500 });
    }
}
