import { NextResponse } from 'next/server';
import { createDiscoveryJob } from '@/lib/server/job-queue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeUrls,
      songUrl,
      songSyncMode,
      muteOriginalAudio,
      audioMode = 'original_plus_music',
      originalAudioVolume = 100,
      bgMusicVolume = 15,
      autoDucking = true,
      title = 'Video Moment Discovery',
      discoveryMode = 'all_qualified',
      generationStrategy = 'quality_first',
      autoRender = true,
      headlineStyle = 'yellow_white',
      minViralScore = 80,
      requestedCount,
      timelineRange,
      contentType = 'podcast',
      stylePreset = 'energetic',
      aspectRatio = '9:16',
      preferredLang = 'en',
      channelName,
    } = body;

    const primaryUrl = youtubeUrls && youtubeUrls.length > 0 ? youtubeUrls[0] : youtubeUrl;

    const job = createDiscoveryJob({
      youtubeUrl: primaryUrl,
      youtubeUrls,
      songUrl,
      songSyncMode,
      muteOriginalAudio: Boolean(muteOriginalAudio),
      audioMode,
      originalAudioVolume: Number(originalAudioVolume) || 100,
      bgMusicVolume: Number(bgMusicVolume) || 15,
      autoDucking: Boolean(autoDucking !== false),
      autoRender: Boolean(autoRender !== false),
      headlineStyle,
      title,
      discoveryMode,
      generationStrategy,
      minViralScore: Number(minViralScore) || 80,
      requestedCount: requestedCount ? Number(requestedCount) : undefined,
      timelineRange,
      contentType,
      stylePreset,
      aspectRatio,
      preferredLang,
      channelName: channelName ? channelName.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      projectId: job.projectId,
      status: job.status,
      message: 'AI Viral Moment Discovery job initiated.',
    });
  } catch (error: any) {
    console.error('[API /api/pipeline/discover Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start discovery job',
      },
      { status: 500 }
    );
  }
}
