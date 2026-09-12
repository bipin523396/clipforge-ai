import { NextResponse } from 'next/server';
import { generateStoryAwareEditPlans } from '@/lib/server/ai-edit-planner';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clipId = `clip-${Date.now()}`,
      title = 'AI Pro Edit',
      hookStatement = 'Crucial breakthrough concept',
      startSec = 0,
      endSec = 30,
      segments = [],
    } = body;

    const result = generateStoryAwareEditPlans({
      clipId,
      title,
      hookStatement,
      startSec: Number(startSec) || 0,
      endSec: Number(endSec) || 30,
      segments,
    });

    return NextResponse.json({
      success: true,
      clipId: result.clipId,
      title: result.title,
      totalDurationSec: result.totalDurationSec,
      storyArcBreakdown: result.storyArcBreakdown,
      versions: result.versions,
      // Default to professional plan for immediate preview
      plan: result.versions.professional,
    });
  } catch (error: any) {
    console.error('[API /api/ai-edit/plan Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate Story AI Edit Plans' },
      { status: 500 }
    );
  }
}
