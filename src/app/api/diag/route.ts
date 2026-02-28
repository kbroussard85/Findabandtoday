import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    AUTH0_SECRET: !!process.env.AUTH0_SECRET,
    AUTH0_SECRET_LENGTH: process.env.AUTH0_SECRET?.length || 0,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'MISSING',
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || 'MISSING',
    AUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID,
    DATABASE_URL: !!process.env.DATABASE_URL,
  };

  return NextResponse.json(checks);
}
