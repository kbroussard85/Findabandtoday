import { createClient } from '@supabase/supabase-js';
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  // Protecting against build-time env var missing error
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = session.user.sub;

  // 1. Get internal user ID from Prisma
  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: userId }
  });

  if (!dbUser) return NextResponse.json({ error: 'User record not found' }, { status: 404 });

  // 2. Upload to Storage Bucket
  const { data: storageData, error: storageError } = await supabase.storage
    .from('media')
    .upload(`${userId}/audio/${Date.now()}_${file.name.replace(/\s+/g, '_')}`, file);

  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 });

  // 3. Get Public URL
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(storageData.path);

  // 4. Save reference to Database using Prisma
  await (prisma as any).artistMedia.create({
    data: {
      artistId: dbUser.id,
      fileUrl: urlData.publicUrl,
      fileType: 'audio'
    }
  });

  // 5. If it's a band, update the audioUrlPreview directly for convenience
  if (dbUser.role === 'BAND') {
    const band = await prisma.band.findUnique({
      where: { userId: dbUser.id }
    });

    if (band) {
      await prisma.band.update({
        where: { id: band.id },
        data: { audioUrlPreview: urlData.publicUrl }
      });
    }
  }

  return NextResponse.json({ success: true, url: urlData.publicUrl });
}
