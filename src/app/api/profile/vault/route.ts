import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl, assetType, rawText } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const asset = await prisma.vaultAsset.upsert({
      where: {
        // We need a unique constraint or find existing
        id: (await prisma.vaultAsset.findFirst({
          where: { ownerId: dbUser.id, assetType }
        }))?.id || 'new-asset'
      },
      update: {
        fileUrl,
        rawText,
      },
      create: {
        ownerId: dbUser.id,
        assetType,
        fileUrl,
        rawText,
      },
    });

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
