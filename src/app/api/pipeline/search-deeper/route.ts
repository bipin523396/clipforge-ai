import { NextResponse } from 'next/server';
import { searchDeeperForJob } from '@/lib/server/job-queue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'jobId is required' },
        { status: 400 }
      );
    }

    const updatedMoments = await searchDeeperForJob(jobId);

    return NextResponse.json({
      success: true,
      momentsCount: updatedMoments.length,
      moments: updatedMoments,
      message: 'Deep search completed successfully.',
    });
  } catch (error: any) {
    console.error('[API /api/pipeline/search-deeper Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to execute deep search',
      },
      { status: 500 }
    );
  }
}
