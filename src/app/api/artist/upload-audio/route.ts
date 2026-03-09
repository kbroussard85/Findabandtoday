import { createClient } from '@supabase/supabase-js';
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Initialize Supabase inside the handler to prevent build-time errors if env vars are missing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const auth0Id = session.user.sub;

    // 1. Get the local DB User record
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Upload to Supabase Storage Bucket ('media')
    const fileName = `${dbUser.id}/audio/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });

    if (storageError) {
      console.error('[SUPABASE STORAGE ERROR]:', storageError);
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    // 3. Get Public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storageData.path);

    // 4. Save reference to Database using Prisma
    const mediaRecord = await prisma.artistMedia.create({
      data: {
        userId: dbUser.id,
        fileUrl: urlData.publicUrl,
        fileType: 'audio',
        isPrimary: true 
      }
    });

    // 5. Update the Band profile audioUrlPreview
    if (dbUser.role === 'BAND') {
      await prisma.band.update({
        where: { userId: dbUser.id },
        data: { audioUrlPreview: urlData.publicUrl }
      });
    }

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl,
      id: mediaRecord.id 
    });
  } catch (error) {
    console.error('Audio Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
