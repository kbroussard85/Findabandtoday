import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.gig.deleteMany();
  await prisma.band.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding extended Nashville/Regional test data...');

  // --- BANDS ---

  await prisma.user.create({
    data: {
      auth0Id: 'seed_band_1',
      email: 'blues@test.com',
      role: 'BAND',
      isPaid: true,
      subscriptionTier: 'ARTIST_BIZ',
      bandProfile: {
        create: {
          name: 'The Nashville Blues Trio',
          bio: 'Deep-fried delta blues straight from the heart of Tennessee. We bring the soul, you bring the whiskey.',
          lat: 36.1627,
          lng: -86.7816,
          searchRadius: 100,
          audioUrlPreview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          media: [
            { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'audio', title: 'Studio Session' }
          ],
          availability: {
            bookedDates: [new Date(2026, 2, 28).toISOString(), new Date(2026, 3, 1).toISOString()]
          },
          negotiationPrefs: { minRate: 500, openToNegotiate: true }
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      auth0Id: 'seed_band_2',
      email: 'indie@test.com',
      role: 'BAND',
      isPaid: false,
      bandProfile: {
        create: {
          name: 'Franklin Indie Collective',
          bio: 'A rotating cast of singer-songwriters playing acoustic folk and indie rock originals.',
          lat: 35.9251,
          lng: -86.8689, // Franklin, TN
          searchRadius: 50,
          audioUrlPreview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 200, openToNegotiate: false }
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      auth0Id: 'seed_band_3',
      email: 'metal@test.com',
      role: 'BAND',
      isPaid: true,
      subscriptionTier: 'ARTIST_BIZ',
      bandProfile: {
        create: {
          name: 'Iron Forge',
          bio: 'Heavy metal from the rust belt. Loud, fast, and guaranteed to blow your PA system if you aren\'t careful.',
          lat: 36.1744,
          lng: -86.7679, // East Nashville
          searchRadius: 250,
          audioUrlPreview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 800, openToNegotiate: true }
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      auth0Id: 'seed_band_4',
      email: 'dj@test.com',
      role: 'BAND',
      isPaid: true,
      bandProfile: {
        create: {
          name: 'DJ Neon Pulse',
          bio: 'EDM, House, and Top 40 remixes. Perfect for late-night club sets or high-energy private events.',
          lat: 36.1528,
          lng: -86.7983, // Midtown Nashville
          searchRadius: 500,
          audioUrlPreview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 1200, openToNegotiate: false }
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      auth0Id: 'seed_band_5',
      email: 'country@test.com',
      role: 'BAND',
      isPaid: false,
      bandProfile: {
        create: {
          name: 'Sarah & The Honky Tonks',
          bio: 'Classic 90s country covers and modern hits. Boots, hats, and pedal steel.',
          lat: 35.8456,
          lng: -86.3903, // Murfreesboro, TN
          searchRadius: 100,
          audioUrlPreview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 400, openToNegotiate: true }
        }
      }
    }
  });


  // --- VENUES ---

  await prisma.user.create({
    data: {
      auth0Id: 'seed_venue_1',
      email: 'venue@test.com',
      role: 'VENUE',
      isPaid: true,
      subscriptionTier: 'VENUE_COMMAND',
      venueProfile: {
        create: {
          name: 'The Stage on Broadway',
          bio: 'The biggest honky tonk in Nashville with 3 floors of live music.',
          lat: 36.1612,
          lng: -86.7775,
          capacity: 500,
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 1000, openToNegotiate: true }
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      auth0Id: 'seed_venue_2',
      email: 'divebar@test.com',
      role: 'VENUE',
      isPaid: false,
      venueProfile: {
        create: {
          name: 'The Basement East',
          bio: 'East Nashville\'s premier independent live music venue. "The Beast".',
          lat: 36.1755,
          lng: -86.7550, // East Nashville
          capacity: 400,
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 0, openToNegotiate: true } // Door deal
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      auth0Id: 'seed_venue_3',
      email: 'club@test.com',
      role: 'VENUE',
      isPaid: true,
      subscriptionTier: 'VENUE_COMMAND',
      venueProfile: {
        create: {
          name: 'Play Dance Bar',
          bio: 'High-energy dance club featuring top DJs and drag shows.',
          lat: 36.1530,
          lng: -86.7970, // Church St
          capacity: 600,
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 800, openToNegotiate: false }
        }
      }
    }
  });

  console.log('Seed complete! Added 5 Bands and 3 Venues.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
