import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const venueId = "cmmn821200001l804jq1vl4bk";
  const bands = await prisma.band.findMany({ take: 5 });
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Create some "Open Dates"
  const openDates = [15, 18, 22, 25, 28];
  for (const day of openDates) {
    const date = new Date(currentYear, currentMonth, day);
    await prisma.openDate.create({
      data: {
        venueId,
        eventDate: date,
        isFilled: false
      }
    });

    // For each open date, create 1-3 band submissions
    const numSubmissions = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numSubmissions; i++) {
      const band = bands[Math.floor(Math.random() * bands.length)];
      await prisma.gig.create({
        data: {
          title: `Submission for ${date.toDateString()}`,
          date: date,
          venueId,
          bandId: band.id,
          status: 'OFFER_SENT',
          totalAmount: (band.negotiationPrefs as { minRate?: number })?.minRate || 500,
          payoutStatus: 'NOT_APPLICABLE'
        }
      });
    }
  }

  // Create some "Booked Dates"
  const bookedDates = [5, 10, 12];
  for (const day of bookedDates) {
    const date = new Date(currentYear, currentMonth, day);
    const band = bands[Math.floor(Math.random() * bands.length)];
    await prisma.gig.create({
      data: {
        title: `Confirmed Show: ${band.name}`,
        date: date,
        venueId,
        bandId: band.id,
        status: 'CONFIRMED',
        totalAmount: 750,
        payoutStatus: 'HELD_IN_ESCROW'
      }
    });
  }

  console.log("Seeding complete for kencarlbroussard");
}

main().catch(console.error).finally(() => prisma.$disconnect());
