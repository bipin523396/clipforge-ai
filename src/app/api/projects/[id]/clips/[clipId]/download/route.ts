import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { renderBurnedEditedClip, BURNIN_STYLE_VERSION } from '@/lib/server/video-burnin';
import { getProjectById, sanitizeTitle } from '@/lib/server/project-store';
import { compileMegaShortTask } from '@/lib/server/mega-short-compiler';

/**
 * Verify that a rendered burned file exists, is non-trivial, and matches current visual styling version
 */
function isValidBurnedFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  try {
    if (fs.statSync(filePath).size < 100000) return false;
    const metaPath = `${filePath}.meta.json`;
    if (!fs.existsSync(metaPath)) return false;
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    return Boolean(meta && meta.version === BURNIN_STYLE_VERSION);
  } catch {
    return false;
  }
}

/**
 * Universal video locator and on-demand renderer for both HEAD and GET
 * Strictly guarantees that all downloads have subtitles, hook headlines, and channel watermark burned-in.
 */
async function resolveClipVideoFilePath(
  projectId: string,
  clipId: string,
  rebuild: boolean = false,
  resolution: '720p' | '1080p' | '4k' = '4k',
  channelName?: string
): Promise<string | null> {
  const projectRendersDir = path.join(process.cwd(), 'public', 'renders', projectId);

  // 1. If not rebuilding, check if an authentic burned render matching current styling version exists
  if (!rebuild && fs.existsSync(projectRendersDir)) {
    const files = fs.readdirSync(projectRendersDir);

    const expectedName =
      resolution === '4k'
        ? `${clipId}-4k-burned.mp4`
        : resolution === '720p'
        ? `${clipId}-720p-burned.mp4`
        : `${clipId}-burned.mp4`;

    const exactMatch = files.find((f) => f === expectedName && !f.includes('.tmp'));
    if (exactMatch) {
      const p = path.join(projectRendersDir, exactMatch);
      if (isValidBurnedFile(p)) return p;
    }

    // For 1080p requests, also accept 4K burned if available as superior quality fallback
    if (resolution === '1080p') {
      const fallback4k = files.find((f) => f === `${clipId}-4k-burned.mp4` && !f.includes('.tmp'));
      if (fallback4k) {
        const p = path.join(projectRendersDir, fallback4k);
        if (isValidBurnedFile(p)) return p;
      }
    }
  }

  // 2. On-Demand Burn-In Rendering: Burn subtitles, headline, channel name watermark & progress bar
  try {
    const renderResult = await renderBurnedEditedClip(projectId, clipId, {
      resolution,
      forceRerender: rebuild,
      channelName,
    });
    if (renderResult && renderResult.filePath && fs.existsSync(renderResult.filePath)) {
      return renderResult.filePath;
    }
  } catch (burnErr: any) {
    console.warn('[On-Demand Burn-in Notice]:', burnErr.message);
  }

  // 3. Fallback: If burned render failed, check if 3-in-1 mega short needs compilation
  const isMega = clipId.includes('mega') || clipId.includes('combined');
  if (isMega && fs.existsSync(projectRendersDir)) {
    try {
      const project = await getProjectById(projectId);
      if (project && project.clips && project.clips.length > 0) {
        const sourceClips = project.clips.filter((c) => !c.id.includes('mega') && !c.id.includes('combined'));
        if (sourceClips.length > 0) {
          await compileMegaShortTask(projectId, sourceClips);
          // Now burn the compiled mega short with target resolution
          const burnedMega = await renderBurnedEditedClip(projectId, clipId, {
            resolution,
            forceRerender: true,
            channelName,
          });
          if (burnedMega && fs.existsSync(burnedMega.filePath)) {
            return burnedMega.filePath;
          }
        }
      }
    } catch (megaErr: any) {
      console.warn('[Mega Short Burn Compile Notice]:', megaErr.message);
    }
  }

  // 4. If resolution is not 4k, check for any valid burned render for this clip matching current version
  if (resolution !== '4k' && fs.existsSync(projectRendersDir)) {
    const files = fs.readdirSync(projectRendersDir);
    const anyBurnedForClip = files.find(
      (f) => f.startsWith(clipId) && f.includes('burned') && f.endsWith('.mp4') && !f.includes('.tmp')
    );
    if (anyBurnedForClip) {
      const p = path.join(projectRendersDir, anyBurnedForClip);
      if (isValidBurnedFile(p)) return p;
    }
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; clipId: string }> }
) {
  const { id: projectId, clipId } = await params;
  const { searchParams } = new URL(req.url);
  const rebuild = searchParams.get('rebuild') === 'true';
  const resolution = (searchParams.get('resolution') as '720p' | '1080p' | '4k') || '4k';
  const channelName = searchParams.get('channelName') || undefined;

  try {
    // 1. Fetch project and clip metadata for clean filename
    const project = await getProjectById(projectId);
    const clip = project?.clips.find((c) => c.id === clipId);
    const rawTitle = clip?.title || clip?.hookStatement || `short_${clipId}`;
    const cleanTitle = sanitizeTitle(rawTitle)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30)
      .trim() || `clip_${clipId.slice(-6)}`;
    const filename = `${cleanTitle}_${resolution}.mp4`;
    const encodedFilename = encodeURIComponent(filename);
    const contentDisposition = `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`;

    // 2. Resolve video file path with on-demand 4k rendering
    let videoFilePath = await resolveClipVideoFilePath(projectId, clipId, rebuild, resolution, channelName);

    // If file is currently being finalized by FFmpeg, wait up to 20 seconds
    if (videoFilePath && fs.existsSync(videoFilePath)) {
      let stat = fs.statSync(videoFilePath);
      let waitAttempts = 0;
      while (stat.size < 10000 && waitAttempts < 20) {
        await new Promise((r) => setTimeout(r, 1000));
        if (fs.existsSync(videoFilePath)) {
          stat = fs.statSync(videoFilePath);
        }
        waitAttempts++;
      }
    }

    if (!videoFilePath || !fs.existsSync(videoFilePath)) {
      if (clip?.supabaseVideoUrl) {
        return NextResponse.redirect(clip.supabaseVideoUrl);
      }
      return new Response('Video is being prepared. Please try again in a few seconds.', {
        status: 202,
        headers: { 'Content-Type': 'text/plain' },
      });
    }


    const stat = fs.statSync(videoFilePath);
    if (stat.size < 1000) {
      return new Response('Video file is still finalizing. Please retry in a few seconds.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 3. Support HTTP Range requests (crucial for QuickTime, Safari, and streaming download managers)
    const range = req.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      const nodeStream = fs.createReadStream(videoFilePath, { start, end });
      const webStream = Readable.toWeb(nodeStream as any) as any;

      return new Response(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4',
          'Content-Disposition': contentDisposition,
        },
      });
    }

    // 4. Deliver complete file download via stream
    const fullNodeStream = fs.createReadStream(videoFilePath);
    const fullWebStream = Readable.toWeb(fullNodeStream as any) as any;

    return new Response(fullWebStream, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': contentDisposition,
        'Content-Length': stat.size.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[Download Route Fatal Error]:', error);
    return new Response('Unable to download video file at this time.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; clipId: string }> }
) {
  const { id: projectId, clipId } = await params;
  const { searchParams } = new URL(req.url);
  const resolution = (searchParams.get('resolution') as '720p' | '1080p' | '4k') || '4k';
  const projectRendersDir = path.join(process.cwd(), 'public', 'renders', projectId);

  if (fs.existsSync(projectRendersDir)) {
    const files = fs.readdirSync(projectRendersDir);
    const expectedName =
      resolution === '4k'
        ? `${clipId}-4k-burned.mp4`
        : resolution === '720p'
        ? `${clipId}-720p-burned.mp4`
        : `${clipId}-burned.mp4`;

    const existing = files.find((f) => f === expectedName && !f.includes('.tmp'));
    if (existing) {
      const p = path.join(projectRendersDir, existing);
      try {
        if (isValidBurnedFile(p)) {
          const stat = fs.statSync(p);
          return new Response(null, {
            status: 200,
            headers: {
              'Content-Type': 'video/mp4',
              'Content-Length': stat.size.toString(),
              'Accept-Ranges': 'bytes',
              'X-Render-Status': 'ready',
            },
          });
        }
      } catch {}
    }
  }

  // Not ready or not rendered yet
  return new Response(null, {
    status: 202,
    headers: {
      'Content-Type': 'application/json',
      'X-Render-Status': 'pending',
    },
  });
}
