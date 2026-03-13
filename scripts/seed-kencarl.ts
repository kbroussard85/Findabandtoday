import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const venueId = "cmmn821200001l804jq1vl4bk";
  
  // 1. Update existing bands with professional stock imagery
  const bandUpdates = [
    { 
      name: "The Nashville Blues Trio", 
      logo: "https://images.unsplash.com/photo-1525994886773-080587e161c3?q=80&w=200", 
      image: "https://images.unsplash.com/photo-1514525253361-bee8a187499b?q=80&w=800",
      social: "12.4k", draw: "150"
    },
    { 
      name: "Franklin Indie Collective", 
      logo: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200", 
      image: "https://images.unsplash.com/photo-1459749411177-042180ceea73?q=80&w=800",
      social: "8.2k", draw: "95"
    },
    { 
      name: "Iron Forge", 
      logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200", 
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800",
      social: "24k", draw: "310"
    },
    { 
      name: "DJ Neon Pulse", 
      logo: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200", 
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800",
      social: "105k", draw: "500"
    },
    { 
      name: "Sarah & The Honky Tonks", 
      logo: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=200", 
      image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800",
      social: "15.1k", draw: "200"
    }
  ];

  for (const update of bandUpdates) {
    await prisma.band.updateMany({
      where: { name: update.name },
      data: {
        media: [
          { url: update.logo, type: 'image', name: 'logo' },
          { url: update.image, type: 'image', name: 'promo' }
        ],
        negotiationPrefs: {
          socialReach: update.social,
          avgDraw: update.draw,
          minRate: 500,
          openToNegotiate: true
        }
      }
    });
  }

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
          totalAmount: (band.negotiationPrefs as Record<string, unknown>)?.minRate as number || 500,
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
