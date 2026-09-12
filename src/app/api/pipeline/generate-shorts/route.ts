import { NextResponse } from 'next/server';
import { createGenerationJob } from '@/lib/server/job-queue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      discoveryJobId,
      selectedMomentIds = [],
      stylePreset = 'energetic',
      aspectRatio = '9:16',
    } = body;

    if (!discoveryJobId) {
      return NextResponse.json(
        { success: false, error: 'discoveryJobId is required' },
        { status: 400 }
      );
    }

    const job = createGenerationJob({
      discoveryJobId,
      selectedMomentIds: Array.isArray(selectedMomentIds) ? selectedMomentIds : [],
      stylePreset,
      aspectRatio,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      projectId: job.projectId,
      status: job.status,
      message: 'Short video rendering job initiated.',
    });
  } catch (error: any) {
    console.error('[API /api/pipeline/generate-shorts Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start generation job',
      },
      { status: 500 }
    );
  }
}
