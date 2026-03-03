import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AgreementSandbox from '@/components/booking/AgreementSandbox';
import { PayoutType } from '@prisma/client';

export default async function GigSandboxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const gig = await prisma.gig.findUnique({
    where: { id },
    include: {
      band: true,
      venue: true,
      agreement: true,
    }
  });

  if (!gig) {
    notFound();
  }

  return (
    <div className="bg-black min-h-screen">
      <AgreementSandbox 
        gigId={gig.id}
        bandData={{
          name: gig.band.name,
          stagePlotUrl: gig.agreement?.stagePlotSnapshot || undefined,
          // Use generic info for now or fetch from band profile if needed
          backlineInfo: "Standard Technical Rider applies."
        }}
        venueData={{
          name: gig.venue.name,
          backlineInfo: "House PA and Lights included."
        }}
        initialOffer={{
          amount: gig.totalAmount,
          payoutType: (gig.agreement?.payoutType as PayoutType) || PayoutType.CASH_DOS
        }}
      />
    </div>
  );
}
