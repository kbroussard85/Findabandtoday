import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { AvailabilityStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookedDates } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
      include: {
        bandProfile: true,
        venueProfile: true,
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profileId = dbUser.role === 'BAND' ? dbUser.bandProfile?.id : dbUser.venueProfile?.id;

    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Use a transaction to clear and set new availabilities
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing availabilities for this profile
      if (dbUser.role === 'BAND') {
        await tx.availability.deleteMany({ where: { bandId: profileId } });
      } else {
        await tx.availability.deleteMany({ where: { venueId: profileId } });
      }

      // 2. Create new availability records for each booked date
      const createData = bookedDates.map((dateStr: string) => ({
        eventDate: new Date(dateStr),
        status: AvailabilityStatus.BOOKED,
        [dbUser.role === 'BAND' ? 'bandId' : 'venueId']: profileId
      }));

      if (createData.length > 0) {
        await tx.availability.createMany({
          data: createData
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Availability Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
