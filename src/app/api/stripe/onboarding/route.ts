import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { stripe, createConnectAccount, createAccountLink } from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 1. Create Connect Account if doesn't exist
    let accountId = dbUser.stripeCustomerId; // Using this field for Connect ID for now

    if (!accountId) {
      const account = await createConnectAccount(dbUser.email, dbUser.id);
      accountId = account.id;

      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: accountId },
      });
    }

    // 2. Create Account Link
    const accountLink = await createAccountLink(accountId);

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Connect Onboarding Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
