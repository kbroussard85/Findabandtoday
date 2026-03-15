import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { PerformanceContract } from '@/lib/documents/templates/PerformanceContract';
import React from 'react';
import { logger } from '@/lib/logger';

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
      venueClauses: searchParams.get('venueClauses') || undefined,
    };

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        band: {
          include: { user: { include: { vaultAssets: true } } }
        },
        venue: {
          include: { user: { include: { vaultAssets: true } } }
        },
      },
    });

    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

    // Extract assets for the full pack
    const artistPlot = gig.band.user.vaultAssets.find(v => v.assetType === 'stage_plot')?.rawText || undefined;
    const artistInputList = gig.band.user.vaultAssets.find(v => v.assetType === 'input_list')?.rawText || undefined;
    const artistI9 = gig.band.user.vaultAssets.find(v => v.assetType === 'i9')?.rawText || undefined;

    // Render PDF to stream
    const stream = await renderToStream(
      <PerformanceContract 
        gigId={gig.id}
        artistName={gig.band.name}
        venueName={gig.venue.name}
        eventDate={new Date(gig.date).toLocaleDateString()}
        payout={`$${gig.totalAmount}`}
        terms={gig.description || "Standard performance terms apply."}
        i9Info={artistI9}
        stagePlot={artistPlot}
        inputList={artistInputList}
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
    logger.error({ err: error }, 'Contract Generation Error:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
