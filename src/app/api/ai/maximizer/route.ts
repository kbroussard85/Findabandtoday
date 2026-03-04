import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { getMaximizerSuggestions } from '@/lib/ai/agents/maximizer';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '36.1627');
    const lng = parseFloat(searchParams.get('lng') || '-86.7816');
    const radius = parseFloat(searchParams.get('radius') || '50');

    const suggestions = await getMaximizerSuggestions(session.user.sub, lat, lng, radius);

    return NextResponse.json({ data: suggestions });
  } catch (error) {
    console.error('Maximizer API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
