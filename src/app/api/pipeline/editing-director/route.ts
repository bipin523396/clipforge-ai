import { NextResponse } from 'next/server';
import { generateEditDecisionList } from '@/lib/ai/providers/ai-editing-director';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clipId = `clip-${Date.now()}`,
      title = 'Viral Moment',
      hookStatement = 'Crucial breakthrough concept',
      startSec = 0,
      endSec = 30,
      durationSec = 30,
      segments = [],
    } = body;

    const result = await generateEditDecisionList({
      clipId,
      title,
      hookStatement,
      startSec,
      endSec,
      durationSec,
      segments,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'EDL generation failed' },
      { status: 500 }
    );
  }
}
