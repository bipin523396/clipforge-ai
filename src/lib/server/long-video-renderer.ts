// ClipForge AI - FFmpeg Long Video Concatenation & Blurring Engine 🎞️
// Cuts selected segments, applies optional watermark/logo blurring, concatenates seamlessly, and exports final master video.

import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import { getFFmpegPath } from './media-probe';
import { LongVideoProject, LongVideoEditPlan, RenderedLongVideoOutput } from '@/types/long-video';
import { saveLongVideoProject } from './long-video-store';
import { uploadToSupabaseStorage } from './supabase';

export async function renderLongVideoPlan(
  project: LongVideoProject,
  plan: LongVideoEditPlan,
  onProgress?: (progressPct: number, stageMessage: string) => void
): Promise<RenderedLongVideoOutput> {
  if (!plan.segments || plan.segments.length === 0) {
    throw new Error('No segments specified in the edit plan to render');
  }

  if (!project.localSourcePath || !fs.existsSync(project.localSourcePath)) {
    throw new Error(`Source video file not found at: ${project.localSourcePath}`);
  }

  project.status = 'rendering';
  project.progressPct = 5;
  project.stageMessage = `Initiating render for ${plan.segments.length} selected sequences...`;
  saveLongVideoProject(project);

  const workDir = path.join(os.tmpdir(), `long-render-${project.id}-${Date.now()}`);
  fs.mkdirSync(workDir, { recursive: true });

  const publicOutDir = path.join(process.cwd(), 'public', 'media', 'long-renders');
  if (!fs.existsSync(publicOutDir)) {
    fs.mkdirSync(publicOutDir, { recursive: true });
  }

  const finalOutputFilename = `${project.id}-ai-edit.mp4`;
  const finalLocalPath = path.join(publicOutDir, finalOutputFilename);
  const publicWebUrl = `/media/long-renders/${finalOutputFilename}`;

  const segmentFiles: string[] = [];

  try {
    const totalSegs = plan.segments.length;

    // Step 1: Extract and process each segment
    for (let i = 0; i < totalSegs; i++) {
      const seg = plan.segments[i];
      const segOutPath = path.join(workDir, `segment-${i}.mp4`);
      const pct = Math.round(10 + ((i / totalSegs) * 65));

      onProgress?.(pct, `[Segment ${i + 1}/${totalSegs}] Cutting "${seg.label}" (${seg.startSec}s - ${seg.endSec}s)...`);
      project.progressPct = pct;
      project.stageMessage = `Cutting segment ${i + 1} of ${totalSegs}...`;
      saveLongVideoProject(project);

      await cutSingleSegment({
        sourceVideoPath: project.localSourcePath,
        startSec: seg.startSec,
        endSec: seg.endSec,
        outputPath: segOutPath,
        blurWatermark: plan.output.blurWatermark,
        watermarkBox: plan.output.watermarkBox || {
          x: Math.round(project.width * 0.82),
          y: Math.round(project.height * 0.04),
          w: Math.round(project.width * 0.15),
          h: Math.round(project.height * 0.08),
        },
        aspectRatio: plan.output.aspectRatio,
      });

      if (fs.existsSync(segOutPath) && fs.statSync(segOutPath).size > 1000) {
        segmentFiles.push(segOutPath);
      }
    }

    if (segmentFiles.length === 0) {
      throw new Error('Failed to generate video segments from edit plan');
    }

    // Step 2: Concatenate all segments seamlessly
    onProgress?.(80, `Seamlessly joining ${segmentFiles.length} video sequences into master output...`);
    project.progressPct = 80;
    project.stageMessage = 'Joining all video segments into master long video...';
    saveLongVideoProject(project);

    await concatenateSegments(segmentFiles, finalLocalPath, workDir);

    // Step 3: Archive to Supabase Cloud Storage
    onProgress?.(92, 'Backing up master edited video to cloud storage...');
    project.progressPct = 92;
    project.stageMessage = 'Archiving master edited video to Supabase...';
    saveLongVideoProject(project);

    let supabaseUrl: string | undefined = undefined;
    try {
      const fileBuffer = fs.readFileSync(finalLocalPath);
      const uploaded = await uploadToSupabaseStorage(
        'projects-data',
        `long-renders/${finalOutputFilename}`,
        fileBuffer,
        'video/mp4'
      );
      if (uploaded) {
        supabaseUrl = uploaded;
      }
    } catch (supaErr: any) {
      console.warn('[Supabase Master Video Upload Warning]:', supaErr.message);
    }

    // Step 4: Finalize
    const finalStat = fs.statSync(finalLocalPath);
    const renderedOutput: RenderedLongVideoOutput = {
      videoPath: publicWebUrl,
      supabaseVideoUrl: supabaseUrl || publicWebUrl,
      durationSec: plan.totalDurationSec,
      segmentsCount: segmentFiles.length,
      renderedAt: new Date().toISOString(),
      fileSizeBytes: finalStat.size,
    };

    project.status = 'completed';
    project.progressPct = 100;
    project.stageMessage = 'Render completed! Video ready to stream and download.';
    project.renderedOutput = renderedOutput;

    // Add assistant announcement in chat
    project.chatHistory.push({
      id: `msg-render-${Date.now()}`,
      role: 'assistant',
      content: `🎉 **Render Complete!** I've compiled your ${segmentFiles.length} sequences into a seamless master video (${Math.floor(plan.totalDurationSec / 60)}m ${Math.round(plan.totalDurationSec % 60)}s). You can preview it in the player or download it below!`,
      timestamp: new Date().toISOString(),
    });

    saveLongVideoProject(project);
    onProgress?.(100, 'Master edited video finalized.');

    // Clean up temporary segment workdir
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {}

    return renderedOutput;
  } catch (error: any) {
    console.error('[Long Video Render Error]:', error);
    project.status = 'ready'; // reset to ready so user can re-try
    project.error = error.message;
    project.stageMessage = `Render error: ${error.message}`;
    saveLongVideoProject(project);

    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {}

    throw error;
  }
}

/**
 * Cuts a single segment with optional delogo watermark blur and aspect ratio scaling
 */
async function cutSingleSegment(params: {
  sourceVideoPath: string;
  startSec: number;
  endSec: number;
  outputPath: string;
  blurWatermark: boolean;
  watermarkBox: { x: number; y: number; w: number; h: number };
  aspectRatio: string;
}): Promise<void> {
  const { sourceVideoPath, startSec, endSec, outputPath, blurWatermark, watermarkBox, aspectRatio } = params;
  const ffmpeg = getFFmpegPath();

  const duration = Math.max(0.5, endSec - startSec);

  // Build filtergraph
  const videoFilters: string[] = [];

  if (blurWatermark && watermarkBox) {
    // Delogo filter for text / watermark / logo blur
    const x = Math.max(0, watermarkBox.x);
    const y = Math.max(0, watermarkBox.y);
    const w = Math.max(10, watermarkBox.w);
    const h = Math.max(10, watermarkBox.h);
    videoFilters.push(`delogo=x=${x}:y=${y}:w=${w}:h=${h}`);
  }

  if (aspectRatio === '9:16') {
    videoFilters.push(`scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black`);
  }

  const args = [
    '-y',
    '-ss',
    startSec.toString(),
    '-t',
    duration.toString(),
    '-i',
    sourceVideoPath,
  ];

  if (videoFilters.length > 0) {
    args.push('-vf', videoFilters.join(','));
    args.push(
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '21',
      '-c:a',
      'aac',
      '-b:a',
      '192k'
    );
  } else {
    // Fast cutting with keyframe handling
    args.push(
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '22',
      '-c:a',
      'aac',
      '-b:a',
      '192k'
    );
  }

  args.push(outputPath);

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpeg, args);
    let stderr = '';

    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      reject(new Error(`FFmpeg segment cut timed out for [${startSec} - ${endSec}]`));
    }, 45000);

    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (err) => { clearTimeout(timer); reject(err); });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 || !fs.existsSync(outputPath)) {
        return reject(new Error(`FFmpeg cut failed with code ${code}: ${stderr.slice(-300)}`));
      }
      resolve();
    });
  });
}

/**
 * Concatenates multiple segment MP4 files into a single master MP4
 */
async function concatenateSegments(
  segmentPaths: string[],
  outputPath: string,
  workDir: string
): Promise<void> {
  const ffmpeg = getFFmpegPath();

  // Create concat list file
  const listFilePath = path.join(workDir, 'concat-list.txt');
  const listContent = segmentPaths
    .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
    .join('\n');
  fs.writeFileSync(listFilePath, listContent, 'utf-8');

  // Attempt stream copy concatenation first (instantaneous, 0 re-encoding)
  const streamCopyArgs = [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listFilePath,
    '-c',
    'copy',
    '-movflags',
    '+faststart',
    outputPath,
  ];

  const streamCopySuccess = await new Promise<boolean>((resolve) => {
    const proc = spawn(ffmpeg, streamCopyArgs);
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      resolve(false);
    }, 60000);

    proc.on('error', () => { clearTimeout(timer); resolve(false); });
    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve(code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000);
    });
  });

  if (streamCopySuccess) return;

  // Fallback to re-encode concat if stream copy encountered timestamp discontinuities
  console.warn('[Stream copy concat fallback to re-encode]');
  const reencodeArgs = [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listFilePath,
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '21',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-movflags',
    '+faststart',
    outputPath,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpeg, reencodeArgs);
    let stderr = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      reject(new Error('FFmpeg re-encode concat timed out'));
    }, 180000);

    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (err) => { clearTimeout(timer); reject(err); });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 || !fs.existsSync(outputPath)) {
        return reject(new Error(`FFmpeg concat failed: ${stderr.slice(-300)}`));
      }
      resolve();
    });
  });
}
