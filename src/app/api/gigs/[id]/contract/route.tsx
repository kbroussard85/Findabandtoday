import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { PerformanceContract, type ContractProps } from '@/lib/pdf/contract-generator';
import React from 'react';

// Build trigger comment
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const performanceDetails = {
      loadIn: searchParams.get('loadIn') || undefined,
      setStart: searchParams.get('setStart') || undefined,
      duration: searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : undefined,
      payoutMethod: searchParams.get('payoutMethod') || undefined,
      technicalNotes: searchParams.get('technicalNotes') || undefined,
    };

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        band: true,
        venue: true,
      },
    });

    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

    // Render PDF to stream
    const stream = await renderToStream(
      <PerformanceContract 
        gig={gig as unknown as ContractProps['gig']} 
        performanceDetails={performanceDetails} 
      />
    );
    
    // Create response with PDF content type
    return new Response(stream as unknown as ReadableStream, {
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
