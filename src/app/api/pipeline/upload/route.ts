import { NextResponse } from 'next/server';
import { uploadToSupabaseStorage } from '@/lib/server/supabase';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
    const uploadId = `upl-${Date.now()}`;

    // 1. Save to container temporary disk (handles files up to 2GB+)
    const downloadsDir = path.join(os.tmpdir(), 'clipforge-downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    const localFilePath = path.join(downloadsDir, `${uploadId}-${sanitizedName}`);
    fs.writeFileSync(localFilePath, buffer);

    // 2. If under 45MB, also back up to Supabase Storage
    let resolvedUrl = localFilePath;
    if (buffer.length < 45 * 1024 * 1024) {
      try {
        const publicUrl = await uploadToSupabaseStorage(
          'video-temp',
          `uploads/${uploadId}-${sanitizedName}`,
          buffer,
          file.type || 'video/mp4'
        );
        if (publicUrl) {
          resolvedUrl = publicUrl;
        }
      } catch (err: any) {
        console.warn('[Supabase Upload Warning, using container disk]:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      url: resolvedUrl,
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
