import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { executeAIEditPlan, AIEditPlan } from '@/lib/server/ai-edit-planner';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      clipId,
      plan,
      startSec = 0,
      endSec = 30,
      originalAudioVolume = 100,
      bgMusicVolume = 15,
      autoDucking = true,
    } = body;

    if (!projectId || !clipId || !plan) {
      return NextResponse.json(
        { success: false, error: 'Missing projectId, clipId, or plan parameter' },
        { status: 400 }
      );
    }

    // Locate source video on disk with robust fallback and size verification
    const rendersDir = path.join(process.cwd(), 'public', 'renders', projectId);
    const downloadsDir = path.join(process.cwd(), 'public', 'media', 'downloads');

    const isValidVideo = (p: string) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).size > 1000;
      } catch {
        return false;
      }
    };

    let sourceVideoPath = '';
    const candidates = [
      path.join(rendersDir, `${clipId}.mp4`),
      path.join(rendersDir, `${clipId}-4k-burned.mp4`),
      path.join(rendersDir, `clip-${clipId}.mp4`),
      path.join(downloadsDir, `${projectId}.mp4`),
    ];

    for (const cand of candidates) {
      if (isValidVideo(cand)) {
        sourceVideoPath = cand;
        break;
      }
    }

    if (!sourceVideoPath && fs.existsSync(rendersDir)) {
      const validRenders = fs
        .readdirSync(rendersDir)
        .filter(
          (f) =>
            f.endsWith('.mp4') &&
            !f.includes('ai-pro') &&
            !f.includes('story_arc') &&
            !f.includes('maximum_viral') &&
            !f.includes('professional') &&
            isValidVideo(path.join(rendersDir, f))
        );
      if (validRenders.length > 0) {
        sourceVideoPath = path.join(rendersDir, validRenders[0]);
      }
    }

    if (!fs.existsSync(sourceVideoPath)) {
      return NextResponse.json(
        { success: false, error: `Source video not found for clip ${clipId} in project ${projectId}` },
        { status: 404 }
      );
    }

    const renderResult = await executeAIEditPlan({
      projectId,
      clipId,
      sourceVideoPath,
      startSec: Number(startSec) || 0,
      endSec: Number(endSec) || 30,
      plan: plan as AIEditPlan,
      originalAudioVolume: Number(originalAudioVolume) || 100,
      bgMusicVolume: Number(bgMusicVolume) || 15,
      autoDucking: Boolean(autoDucking !== false),
    });

    return NextResponse.json({
      success: true,
      message: 'AI Pro Edit rendered successfully!',
      result: renderResult,
    });
  } catch (error: any) {
    console.error('[API /api/ai-edit/render Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to render AI Pro Edit' },
      { status: 500 }
    );
  }
}
