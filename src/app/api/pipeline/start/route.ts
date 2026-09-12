import { NextResponse } from 'next/server';
import { createDiscoveryJob } from '@/lib/server/job-queue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title = 'Why 90% of Tech Startups Fail Early',
      contentType = 'podcast',
      stylePreset = 'energetic',
      aspectRatio = '9:16',
      preferredLang = 'en',
      discoveryMode = 'all_qualified',
      minViralScore = 80,
      requestedCount,
      headlineStyle,
    } = body;

    const job = createDiscoveryJob({
      youtubeUrl,
      title,
      contentType,
      stylePreset,
      aspectRatio,
      preferredLang,
      discoveryMode,
      minViralScore: Number(minViralScore) || 80,
      requestedCount: requestedCount ? Number(requestedCount) : undefined,
      headlineStyle,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      projectId: job.projectId,
      status: job.status,
      message: 'Asynchronous discovery job initiated on server worker.',
    });
  } catch (error: any) {
    console.error('[API /api/pipeline/start Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start discovery job',
      },
      { status: 500 }
    );
  }
}
