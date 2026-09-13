import { NextResponse } from 'next/server';
import { getLongVideoProject } from '@/lib/server/long-video-store';
import { renderLongVideoPlan } from '@/lib/server/long-video-renderer';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = getLongVideoProject(id);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const targetPlan = body.plan || project.activePlan;

    if (!targetPlan || !targetPlan.segments || targetPlan.segments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active edit plan with video segments found. Please send an editing command first.' },
        { status: 400 }
      );
    }

    // Trigger asynchronous rendering in worker
    setTimeout(() => {
      renderLongVideoPlan(project, targetPlan).catch((err) => {
        console.error(`[Async Long Video Render Failed for ${id}]:`, err);
      });
    }, 50);

    return NextResponse.json({
      success: true,
      message: `Rendering queued for ${targetPlan.segments.length} video sequences.`,
      project,
    });
  } catch (err: any) {
    console.error('[Long Video Render API Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
