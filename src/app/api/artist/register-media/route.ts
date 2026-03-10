import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileUrl, fileType, fileName } = await req.json();

    const auth0Id = session.user.sub;
    const dbUser = await prisma.user.findUnique({ where: { auth0Id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 1. Create the media record
    const mediaRecord = await prisma.artistMedia.create({
      data: {
        artistId: dbUser.id,
        fileUrl,
        fileType,
        isPrimary: fileType === 'audio', // Auto-set as primary for the demo player if it's audio
      }
    });

    // 2. If it's audio, also update the Band/Venue profile's direct audioUrlPreview field
    if (fileType === 'audio' && dbUser.role === 'BAND') {
      await prisma.band.update({
        where: { userId: dbUser.id },
        data: { audioUrlPreview: fileUrl }
      });
    }

    return NextResponse.json({ success: true, id: mediaRecord.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    console.error('[MEDIA_REGISTRATION_ERROR]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
