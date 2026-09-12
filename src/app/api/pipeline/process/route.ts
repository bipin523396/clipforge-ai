import { NextResponse } from 'next/server';
import { runViralClipPipeline } from '@/lib/ai/pipeline-orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      youtubeUrlOrFile = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      projectTitle = 'Viral Shorts Generation',
      contentType = 'podcast',
      targetDuration = '30-60',
      clipCount = 5,
      aspectRatio = '9:16',
      stylePreset = 'energetic',
      preferredLang = 'en',
    } = body;

    const result = await runViralClipPipeline({
      youtubeUrlOrFile,
      projectTitle,
      contentType,
      targetDuration,
      clipCount: Number(clipCount) || 5,
      aspectRatio,
      stylePreset,
      preferredLang,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/pipeline/process Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Pipeline processing failed',
      },
      { status: 500 }
    );
  }
}
