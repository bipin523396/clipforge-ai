import { NextResponse } from 'next/server';
import { permanentlyDeleteClip, updateClipInStore } from '@/lib/server/project-store';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; clipId: string }> }
) {
  const { id, clipId } = await params;
  try {
    const updates = await req.json();
    const result = await updateClipInStore(id, clipId, updates);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Clip or project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, clip: result.clip, project: result.project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; clipId: string }> }
) {
  const { id, clipId } = await params;
  try {
    const success = await permanentlyDeleteClip(id, clipId);
    return NextResponse.json({
      success,
      message: `Clip ${clipId} permanently purged from project ${id}, disk, and cloud storage.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

