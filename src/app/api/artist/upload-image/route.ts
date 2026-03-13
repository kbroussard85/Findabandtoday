import { createClient } from '@supabase/supabase-js';
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateFile } from '@/lib/utils/file-validation';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // File Validation (Security Fix)
    const validation = await validateFile(file, 'image');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const auth0Id = session.user.sub;
    const dbUser = await prisma.user.findUnique({ where: { auth0Id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 1. Upload to Supabase Storage ('media' bucket, 'images' folder)
    const fileName = `${dbUser.id}/images/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (storageError) throw storageError;

    // 2. Get Public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storageData.path);

    // 3. Save to Prisma Database
    const mediaRecord = await prisma.artistMedia.create({
      data: {
        artistId: dbUser.id,
        fileUrl: urlData.publicUrl,
        fileType: 'image',
        isPrimary: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl,
      name: file.name,
      id: mediaRecord.id 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('[IMAGE_UPLOAD_ERROR]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
