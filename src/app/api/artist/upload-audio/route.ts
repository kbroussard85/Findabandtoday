import { createClient } from '@supabase/supabase-js';
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { validateFile } from '@/lib/utils/file-validation';

export async function POST(req: Request) {
  try {
    // Protecting against build-time env var missing error
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const userId = session.user.sub;

    // File Validation (Security Fix)
    const validation = await validateFile(file, 'audio');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 1. Upload to Storage Bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('media')
      .upload(`${userId}/audio/${Date.now()}_${file.name.replace(/\s+/g, '_')}`, file);

    if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 });

    // 2. Get Public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storageData.path);

    // 3. Save reference to Database
    const { error: dbError } = await supabase
      .from('artist_media')
      .insert({
        artist_id: userId,
        file_url: urlData.publicUrl,
        file_type: 'audio'
      });

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Audio Upload Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
