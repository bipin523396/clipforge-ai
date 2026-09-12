// ClipForge AI - Project Rendered Video Cleanup Controller 🧹
// Removes heavy .mp4 render files after rendering/export while preserving
// project structure, transcript, clips list, and preview thumbnails.

import { NextRequest, NextResponse } from 'next/server';
import { cleanProjectRenders } from '@/lib/server/project-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { deletedCount, bytesReclaimed } = await cleanProjectRenders(projectId, {
      keepThumbnails: true,
    });

    const reclaimedMb = (bytesReclaimed / (1024 * 1024)).toFixed(1);

    return NextResponse.json({
      success: true,
      projectId,
      deletedCount,
      bytesReclaimed,
      message: `Cleaned ${deletedCount} video files and freed ${reclaimedMb} MB of disk space.`,
    });
  } catch (error: any) {
    console.error('[Project Cleanup Route Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clean project video files' },
      { status: 500 }
    );
  }
}
