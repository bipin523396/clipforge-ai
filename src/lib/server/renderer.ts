// Real Server-Side FFmpeg Video Rendering & Verification Engine 🎬
// Cuts actual timestamp intervals from original source video, applies 9:16 vertical framing, and preserves original audio

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { probeMediaFile, ProbedMediaResult, canUseVideotoolbox, getFFmpegPath } from './media-probe';
import { uploadToSupabaseStorage } from './supabase';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);


export interface RenderClipTask {
  projectId: string;
  clipId: string;
  sourceVideoPath: string;
  startSec: number;
  endSec: number;
  aspectRatio?: '9:16' | '1:1' | '16:9';
  stylePreset?: 'energetic' | 'clean' | 'cinematic' | 'educational' | 'minimal';
  headlineText?: string;
  backgroundAudioPath?: string;
  songSyncMode?: boolean;
  muteOriginalAudio?: boolean;
  originalAudioVolume?: number; // 0 - 150
  bgMusicVolume?: number; // 0 - 100
  autoDucking?: boolean; // Automated sidechain compression ducking
}

export interface RenderClipResult {
  clipId: string;
  videoUrl: string;
  thumbnailUrl: string;
  supabaseVideoUrl?: string;
  fileSizeBytes: number;
  durationSec: number;
  probed: ProbedMediaResult;
}

export async function renderClipWithFFmpeg(
  task: RenderClipTask
): Promise<RenderClipResult> {
  const ffmpegPath = getFFmpegPath();

  // 1. Verify source video exists and contains valid video stream
  if (!fs.existsSync(task.sourceVideoPath)) {
    throw new Error(`Source video file missing: ${task.sourceVideoPath}`);
  }

  const sourceProbed = await probeMediaFile(task.sourceVideoPath);
  if (!sourceProbed.hasVideo) {
    throw new Error(`Source file ${task.sourceVideoPath} has no video stream.`);
  }

  const outDir = isServerless
    ? path.join('/tmp', 'clipforge-renders', task.projectId)
    : path.join(process.cwd(), 'public', 'renders', task.projectId);
  if (!fs.existsSync(outDir)) {
    try {
      fs.mkdirSync(outDir, { recursive: true });
    } catch {}
  }

  const outVideoFilename = `${task.clipId}.mp4`;
  const outThumbFilename = `${task.clipId}-thumb.jpg`;

  const outVideoPath = path.join(outDir, outVideoFilename);
  const outThumbPath = path.join(outDir, outThumbFilename);

  // Enforce strictly less than 50 seconds for short video format
  const durationSec = Math.min(48, Math.max(3, task.endSec - task.startSec));
  const ratio = task.aspectRatio || '9:16';

  // Build FFmpeg video filter for 9:16 vertical framing with center crop, scale, and fast watermark blur
  let baseFilter = 'crop=ih*(9/16):ih:iw/2-(ih*(9/16))/2:0,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920';
  let videoFilter = `${baseFilter},split[v_main][v_blur];[v_blur]crop=iw:ih*0.14:0:ih*0.78,boxblur=20:3[v_b];[v_main][v_b]overlay=0:H*0.78`;
  if (ratio === '1:1') {
    videoFilter = 'crop=ih:ih:iw/2-ih/2:0,scale=1080:1080';
  } else if (ratio === '16:9') {
    videoFilter = 'scale=1920:1080';
  }

  const voiceVol = ((task.originalAudioVolume !== undefined ? task.originalAudioVolume : 100) / 100).toFixed(2);
  const bgVol = ((task.bgMusicVolume !== undefined ? task.bgMusicVolume : task.songSyncMode ? 15 : 25) / 100).toFixed(2);
  const useDucking = task.autoDucking !== false;

  // 2. Cut clip from source video and encode with original audio & auto ducking
  await new Promise<void>((resolve, reject) => {
    const args = [
      '-y',
      '-ss',
      task.startSec.toString(),
      '-t',
      durationSec.toString(),
      '-i',
      task.sourceVideoPath,
    ];

    if (task.backgroundAudioPath && fs.existsSync(task.backgroundAudioPath)) {
      args.push('-stream_loop', '-1', '-i', task.backgroundAudioPath);
      
      if (task.muteOriginalAudio) {
        // Only keep the background audio
        args.push(
          '-filter_complex',
          `[0:v]${videoFilter}[v];[1:a]volume=${bgVol}[a]`,
          '-map', '[v]',
          '-map', '[a]'
        );
      } else if (useDucking) {
        // Professional Sidechain Auto-Ducking: background music automatically dips when speaker talks
        args.push(
          '-filter_complex',
          `[0:v]${videoFilter}[v];[0:a]volume=${voiceVol}[voice];[1:a]volume=${bgVol}[bg];[bg][voice]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[ducked_bg];[voice][ducked_bg]amix=inputs=2:duration=first:dropout_transition=2[a]`,
          '-map', '[v]',
          '-map', '[a]'
        );
      } else {
        // Standard mix without dynamic ducking
        args.push(
          '-filter_complex',
          `[0:v]${videoFilter}[v];[0:a]volume=${voiceVol}[a0];[1:a]volume=${bgVol}[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[a]`,
          '-map', '[v]',
          '-map', '[a]'
        );
      }
    } else {
      if (task.muteOriginalAudio) {
        // No background audio and muted original -> Silent video
        args.push('-vf', videoFilter, '-an');
      } else if (Number(voiceVol) !== 1.0) {
        args.push(
          '-filter_complex',
          `[0:v]${videoFilter}[v];[0:a]volume=${voiceVol}[a]`,
          '-map', '[v]',
          '-map', '[a]'
        );
      } else {
        // Default: Original audio only
        args.push('-vf', videoFilter);
      }
    }

    const useHardwareVT = canUseVideotoolbox();
    if (useHardwareVT) {
      args.push(
        '-c:v',
        'h264_videotoolbox',
        '-b:v',
        '8M',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-movflags',
        '+faststart',
        outVideoPath
      );
    } else {
      args.push(
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-threads',
        '0',
        '-crf',
        '22',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-movflags',
        '+faststart',
        outVideoPath
      );
    }

    const proc = spawn(ffmpegPath, args);
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0 || !fs.existsSync(outVideoPath)) {
        return reject(new Error(`FFmpeg video render failed: ${stderr}`));
      }
      resolve();
    });
  });

  // 3. STRICT PROBING OF RENDERED OUTPUT
  const probed = await probeMediaFile(outVideoPath);

  if (!probed.hasVideo) {
    throw new Error(`Verification Failed: Rendered MP4 ${outVideoFilename} has no valid video stream.`);
  }

  if (sourceProbed.hasAudio && !probed.hasAudio && !task.muteOriginalAudio) {
    throw new Error(`Verification Failed: Rendered MP4 ${outVideoFilename} is missing original audio.`);
  }

  // 4. Generate thumbnail from actual rendered video frame
  await new Promise<void>((resolve) => {
    const args = [
      '-y',
      '-ss',
      '0.5',
      '-i',
      outVideoPath,
      '-vframes',
      '1',
      '-q:v',
      '2',
      outThumbPath,
    ];

    const proc = spawn(ffmpegPath, args);
    proc.on('close', () => resolve());
  });

  // 5. Upload rendered short video MP4 and thumbnail to Supabase Storage
  let supabaseVideoUrl: string | undefined = undefined;
  let supabaseThumbUrl: string | undefined = undefined;

  if (fs.existsSync(outVideoPath)) {
    try {
      const uploadPromise = uploadToSupabaseStorage(
        'final-videos',
        `${task.projectId}/${outVideoFilename}`,
        fs.readFileSync(outVideoPath),
        'video/mp4'
      );
      supabaseVideoUrl = await Promise.race([
        uploadPromise,
        new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 5000)),
      ]);
    } catch (err: any) {
      console.warn('[Supabase Video Upload Notice]:', err.message);
    }
  }

  if (fs.existsSync(outThumbPath)) {
    try {
      const uploadThumbPromise = uploadToSupabaseStorage(
        'final-videos',
        `${task.projectId}/${outThumbFilename}`,
        fs.readFileSync(outThumbPath),
        'image/jpeg'
      );
      supabaseThumbUrl = await Promise.race([
        uploadThumbPromise,
        new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 3000)),
      ]);
    } catch {}
  }

  return {
    clipId: task.clipId,
    videoUrl: supabaseVideoUrl || `/renders/${task.projectId}/${outVideoFilename}`,
    thumbnailUrl: supabaseThumbUrl || `/renders/${task.projectId}/${outThumbFilename}`,
    supabaseVideoUrl,
    fileSizeBytes: probed.fileSizeBytes,
    durationSec: probed.durationSec || durationSec,
    probed,
  };
}

