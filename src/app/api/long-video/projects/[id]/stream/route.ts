// ClipForge AI - Long Video Streaming Route (HTTP 206 Range Support) 🎥

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getLongVideoProject } from '@/lib/server/long-video-store';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = getLongVideoProject(id);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // 'source' or 'rendered'

    let targetFilePath = '';

    if (mode === 'source' && project.localSourcePath && fs.existsSync(project.localSourcePath)) {
      targetFilePath = project.localSourcePath;
    } else if (project.renderedOutput?.videoPath) {
      // Check if rendered video is on public disk
      const relPath = project.renderedOutput.videoPath.replace(/^\//, '');
      const pubPath = path.join(process.cwd(), 'public', relPath);
      if (fs.existsSync(pubPath)) {
        targetFilePath = pubPath;
      } else if (project.localSourcePath && fs.existsSync(project.localSourcePath)) {
        targetFilePath = project.localSourcePath;
      }
    } else if (project.localSourcePath && fs.existsSync(project.localSourcePath)) {
      targetFilePath = project.localSourcePath;
    }

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return NextResponse.json({ success: false, error: 'Video file not available on disk' }, { status: 404 });
    }

    const stat = fs.statSync(targetFilePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const fileStream = fs.createReadStream(targetFilePath, { start, end });
      // Convert node stream to web stream
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new Response(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4',
        },
      });
    } else {
      const fileStream = fs.createReadStream(targetFilePath);
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
        },
      });
    }
  } catch (err: any) {
    console.error('[Long Video Stream Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
