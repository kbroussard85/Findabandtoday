import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { PerformanceContract } from '@/lib/pdf/contract-generator';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        band: true,
        venue: true,
      },
    });

    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

    // Render PDF to stream
    const stream = await renderToStream(<PerformanceContract gig={gig as any} />);
    
    // Create response with PDF content type
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Contract Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
