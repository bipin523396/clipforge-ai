import { NextResponse } from 'next/server';
import { LongVideoProject } from '@/types/long-video';
import { saveLongVideoProject, listLongVideoProjects } from '@/lib/server/long-video-store';
import { executeLongVideoIndexing } from '@/lib/server/long-video-indexer';
import { isYouTubeUrl } from '@/lib/server/media-ingestion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = listLongVideoProjects();
    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sourceUrl,
      title = 'Long Video Analysis',
    } = body;

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'Source URL or file path is required' }, { status: 400 });
    }

    const projectId = `lv-proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isLocal = !isYouTubeUrl(sourceUrl);

    const project: LongVideoProject = {
      id: projectId,
      title: title.trim() || (isLocal ? 'Uploaded Match Highlights' : 'Long YouTube Highlights'),
      sourceUrl: sourceUrl.trim(),
      isLocalUpload: isLocal,
      localSourcePath: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
      durationSec: 0,
      width: 1920,
      height: 1080,
      fps: 30,
      status: 'indexing',
      progressPct: 5,
      stageMessage: 'Queued for multi-modal audio, visual & event indexing...',
      chatHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveLongVideoProject(project);

    // Run indexing asynchronously in background
    setTimeout(() => {
      executeLongVideoIndexing(projectId).catch((err) => {
        console.error(`[Background Indexing Error for ${projectId}]:`, err);
      });
    }, 100);

    return NextResponse.json({
      success: true,
      projectId,
      project,
      message: 'Long video indexing started.',
    });
  } catch (err: any) {
    console.error('[API /api/long-video/projects POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
