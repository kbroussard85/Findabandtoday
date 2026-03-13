import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import prisma from '@/lib/prisma';

export async function POST() {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!dbUser || !dbUser.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.AUTH0_BASE_URL}/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe Portal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
