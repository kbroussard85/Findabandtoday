import prisma from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

export async function getMaximizerMatches(userId: string) {
  const user = await prisma.user.findUnique({
    where: { auth0Id: userId },
    include: {
      bandProfile: { include: { availabilities: true } },
      venueProfile: { include: { openDates: true } }
    }
  });

  if (!user) throw new Error('User not found');

  const isBand = user.role === 'BAND';
  const profile = isBand ? user.bandProfile : user.venueProfile;

  if (!profile) return [];

  const minPayout = profile.minPayoutRequirement || 0;

  if (isBand) {
    // Band looking for Venues
    // A real implementation would use PostGIS ST_DWithin for location matching
    // Here we simulate the logic by finding venues with open dates
    const matches = await prisma.venue.findMany({
      where: {
        // Pseudo-logic: Find venues where their capacity/payout aligns, and they have open dates
        // that match the band's availabilities (or just any open date for now)
        openDates: {
          some: {
            isFilled: false,
            eventDate: {
              gte: new Date()
            }
          }
        },
        minPayoutRequirement: {
          gte: minPayout // Very basic check, in reality, venues offer payout, bands require min
        }
      },
      include: {
        user: true,
        openDates: true
      },
      take: 10
    });

    return matches;
  } else {
    // Venue looking for Bands
    const matches = await prisma.band.findMany({
      where: {
        minPayoutRequirement: {
          lte: minPayout // Band is willing to play for <= what venue is offering
        },
        availabilities: {
          some: {
            status: 'AVAILABLE',
            eventDate: {
              gte: new Date()
            }
          }
        }
      },
      include: {
        user: true,
        availabilities: true
      },
      take: 10
    });

    return matches;
  }
}
