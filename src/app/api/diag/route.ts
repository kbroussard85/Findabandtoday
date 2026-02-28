import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const host = (await headers()).get('host');
  
  const checks = {
    CURRENT_HOST: host,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    HOST_MATCH: host === new URL(process.env.AUTH0_BASE_URL || 'http://localhost').host,
    AUTH0_SECRET_OK: (process.env.AUTH0_SECRET?.length || 0) >= 32,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID_OK: !!process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET_OK: !!process.env.AUTH0_CLIENT_SECRET,
  };

  return NextResponse.json(checks);
}
