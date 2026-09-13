import { NextResponse } from 'next/server';
import { getLongVideoProject } from '@/lib/server/long-video-store';
import { processLongVideoChat } from '@/lib/server/long-video-chat';

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

    if (project.status === 'indexing') {
      return NextResponse.json(
        { success: false, error: 'Video is still indexing. Please wait until indexing completes.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const result = await processLongVideoChat(project, prompt.trim());

    return NextResponse.json({
      success: true,
      reply: result.reply,
      plan: result.plan,
      project: result.project,
    });
  } catch (err: any) {
    console.error('[Long Video Chat API Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
