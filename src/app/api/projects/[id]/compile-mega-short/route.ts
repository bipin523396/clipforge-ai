import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/server/project-store';
import { compileMegaShortTask } from '@/lib/server/mega-short-compiler';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    if (!project.clips || project.clips.length === 0) {
      return NextResponse.json({ success: false, error: 'Project has no clips to compile' }, { status: 400 });
    }

    const sourceClips = project.clips.filter((c) => !c.id.includes('mega') && !c.id.includes('combined'));
    if (sourceClips.length === 0) {
      return NextResponse.json({ success: false, error: 'No standalone clips found to compile' }, { status: 400 });
    }

    const megaClip = await compileMegaShortTask(projectId, sourceClips);

    return NextResponse.json({
      success: true,
      message: `All-in-One Master Short (${sourceClips.length} clips combined) successfully compiled!`,
      clip: megaClip,
    });
  } catch (err: any) {
    console.error('[Compile Mega Short Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
