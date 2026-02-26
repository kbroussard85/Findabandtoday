import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.gig.deleteMany();
  await prisma.band.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Nashville test data...');

  // 1. Create a Band User
  const bandUser = await prisma.user.create({
    data: {
      auth0Id: 'seed_band_1',
      email: 'band@test.com',
      role: 'BAND',
      isPaid: true,
      subscriptionTier: 'ARTIST_BIZ',
      bandProfile: {
        create: {
          name: 'The Nashville Blues Trio',
          bio: 'Deep-fried delta blues straight from the heart of Tennessee.',
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
          negotiationPrefs: {
            minRate: 500,
            openToNegotiate: true
          }
        }
      }
    }
  });

  // 2. Create another Band User (Franklin)
  const bandUser2 = await prisma.user.create({
    data: {
      auth0Id: 'seed_band_2',
      email: 'indie@test.com',
      role: 'BAND',
      isPaid: false,
      bandProfile: {
        create: {
          name: 'Franklin Indie Collective',
          bio: 'A rotating cast of singer-songwriters playing acoustic folk.',
          lat: 35.9251,
          lng: -86.8689,
          searchRadius: 50,
          media: [],
          availability: { bookedDates: [] },
          negotiationPrefs: { minRate: 200, openToNegotiate: false }
        }
      }
    }
  });

  // 3. Create a Venue User
  const venueUser = await prisma.user.create({
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

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
