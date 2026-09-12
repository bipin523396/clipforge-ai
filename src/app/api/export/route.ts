// Server Video Export & Encoding API 🎬
// Triggers high-bitrate rendering with burned-in subtitles, overlays, and audio normalization.
// Returns direct download API URL for instant browser download.

import { NextResponse } from 'next/server';
import { renderBurnedEditedClip, cleanupIntermediateRenders } from '@/lib/server/video-burnin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      clipId,
      resolution = '4k',
      fps = 60,
      forceRerender = false,
      channelName,
      cleanupIntermediate = true,
    } = body;

    if (!projectId || !clipId) {
      return NextResponse.json(
        { success: false, error: 'projectId and clipId are required.' },
        { status: 400 }
      );
    }

    // Render fully edited short video in 4K Ultra-HD with burned subtitles, headline, channel watermark, progress bar
    const renderResult = await renderBurnedEditedClip(projectId, clipId, {
      resolution,
      fps,
      forceRerender,
      channelName,
    });

    if (cleanupIntermediate) {
      cleanupIntermediateRenders(projectId, clipId);
    }

    const encodedChannel = channelName ? `&channelName=${encodeURIComponent(channelName)}` : '';
    const downloadUrl = `/api/projects/${projectId}/clips/${clipId}/download?resolution=${resolution}${encodedChannel}`;

    return NextResponse.json({
      success: true,
      jobId: `exp-${Date.now()}`,
      status: 'COMPLETED',
      downloadUrl,
      publicVideoUrl: renderResult.publicUrl,
      fileSizeBytes: renderResult.fileSizeBytes,
      durationSec: renderResult.durationSec,
      format: 'mp4',
      resolution,
      fps,
    });
  } catch (error: any) {
    console.error('[Export API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}
