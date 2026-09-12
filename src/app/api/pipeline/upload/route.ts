import { NextResponse } from 'next/server';
import { uploadToSupabaseStorage } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${Date.now()}-${sanitizedName}`;

    const publicUrl = await uploadToSupabaseStorage(
      'video-temp',
      storagePath,
      buffer,
      file.type || 'video/mp4'
    );

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (err: any) {
    console.error('[Upload API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
