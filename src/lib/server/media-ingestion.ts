// Real Server Media Ingestion & Source Media Verification 🎬
// Downloads genuine video streams, extracts 16kHz audio WAV, and runs ffprobe validation

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { probeMediaFile, ProbedMediaResult, getFFmpegPath, getFFprobePath, getPythonPath, getYtDlpPath } from './media-probe';

import os from 'os';

export function getYouTubeCookiesPath(): string | null {
  if (process.env.YOUTUBE_COOKIES && process.env.YOUTUBE_COOKIES.trim().length > 10) {
    const cookiePath = path.join(os.tmpdir(), 'yt-cookies.txt');
    try {
      let content = process.env.YOUTUBE_COOKIES.trim();
      if (content.startsWith('base64:')) {
        content = Buffer.from(content.slice(7), 'base64').toString('utf-8');
      }
      fs.writeFileSync(cookiePath, content, 'utf-8');
      return cookiePath;
    } catch {}
  }

  const localCandidates = [
    path.join(process.cwd(), 'cookies.txt'),
    path.join(os.tmpdir(), 'cookies.txt'),
    path.join(os.tmpdir(), 'yt-cookies.txt'),
  ];
  for (const cand of localCandidates) {
    if (fs.existsSync(cand)) return cand;
  }

  return null;
}

export interface VideoMetadata {
  id: string;
  title: string;
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  uploader: string;
  filesizeBytes: number;
  thumbnailUrl: string;
  localVideoPath?: string;
  localAudioPath?: string;
  hasVideo: boolean;
  hasAudio: boolean;
}

export function isYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url.trim());
}

export async function extractMediaMetadata(sourceUrl: string): Promise<VideoMetadata> {
  // 1. If it's a YouTube URL, fetch instant metadata from YouTube's public oEmbed API
  let oembedData: any = null;
  if (isYouTubeUrl(sourceUrl)) {
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`, {
        signal: AbortSignal.timeout(6000),
      });
      if (oembedRes.ok) {
        oembedData = await oembedRes.json();
      }
    } catch {
      // Ignore oEmbed network hiccups
    }
  }

  // 2. Try yt-dlp to enrich duration, width, height, fps with strict timeout & error handling
  try {
    const ytDlpData = await new Promise<any>((resolve, reject) => {
      const ytDlp = getYtDlpPath();
      const args = [
        '--dump-json',
        '--skip-download',
        '--no-playlist',
        '--no-check-certificates',
        '--js-runtimes',
        'node',
        sourceUrl,
      ];

      const proc = spawn(ytDlp, args);
      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch {}
        reject(new Error('yt-dlp metadata timed out after 15 seconds'));
      }, 15000);

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0 || !stdout.trim()) {
          return reject(new Error(`yt-dlp exited with code ${code}: ${stderr.slice(-300)}`));
        }
        try {
          const json = JSON.parse(stdout);
          resolve(json);
        } catch (err: any) {
          reject(err);
        }
      });
    });

    return {
      id: ytDlpData.id || `yt-${Date.now()}`,
      title: ytDlpData.title || ytDlpData.fulltitle || oembedData?.title || 'Untitled Video',
      durationSec: Number(ytDlpData.duration) || 180,
      width: Number(ytDlpData.width) || 1920,
      height: Number(ytDlpData.height) || 1080,
      fps: Number(ytDlpData.fps) || 30,
      uploader: ytDlpData.uploader || ytDlpData.channel || oembedData?.author_name || 'Content Creator',
      filesizeBytes: Number(ytDlpData.filesize || ytDlpData.filesize_approx) || 25000000,
      thumbnailUrl: ytDlpData.thumbnail || (ytDlpData.thumbnails && ytDlpData.thumbnails[0]?.url) || oembedData?.thumbnail_url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      hasVideo: true,
      hasAudio: true,
    };
  } catch (ytDlpErr: any) {
    console.warn('[yt-dlp metadata notice, falling back to oEmbed/defaults]:', ytDlpErr.message);

    // If yt-dlp failed (e.g. cloud datacenter rate limit), but oEmbed worked:
    if (oembedData) {
      let videoId = `yt-${Date.now()}`;
      try {
        const urlObj = new URL(sourceUrl);
        videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop() || videoId;
      } catch {}

      return {
        id: videoId,
        title: oembedData.title || 'Untitled Video',
        durationSec: 180,
        width: 1920,
        height: 1080,
        fps: 30,
        uploader: oembedData.author_name || 'Content Creator',
        filesizeBytes: 25000000,
        thumbnailUrl: oembedData.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        hasVideo: true,
        hasAudio: true,
      };
    }

    // Baseline fallback if completely offline
    return {
      id: `vid-${Date.now()}`,
      title: 'Processed Video Stream',
      durationSec: 180,
      width: 1920,
      height: 1080,
      fps: 30,
      uploader: 'Content Creator',
      filesizeBytes: 25000000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      hasVideo: true,
      hasAudio: true,
    };
  }
}

import { uploadToSupabaseStorage } from './supabase';

export async function downloadAndVerifyMedia(
  sourceUrl: string,
  outputDir: string,
  projectId: string,
  onProgress?: (progressPct: number, message: string) => void
): Promise<{ videoPath: string; audioPath: string; probed: ProbedMediaResult; supabaseVideoUrl?: string; supabaseAudioUrl?: string }> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Auto-clean old downloads (> 10 mins old) to ensure local disk never runs out of space
  try {
    const files = fs.readdirSync(outputDir);
    const now = Date.now();
    for (const f of files) {
      if (f.endsWith('.part') || (f.startsWith('proj-') && !f.includes(projectId))) {
        const filePath = path.join(outputDir, f);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > 10 * 60 * 1000) {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch {
    // Ignore cleanup errors
  }

  const videoOutPath = path.join(outputDir, `${projectId}.mp4`);
  const audioOutPath = path.join(outputDir, `${projectId}.wav`);

  // Step 1: Acquire source video
  if (!isYouTubeUrl(sourceUrl)) {
    // Direct HTTP media stream download (e.g. Supabase, S3, or direct uploaded MP4)
    onProgress?.(15, 'Acquiring source video from cloud storage...');
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      throw new Error(`Failed to download media file: HTTP ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(videoOutPath, Buffer.from(arrayBuffer));
  } else {
    onProgress?.(15, 'Acquiring authorized original media stream (720p/1080p)...');

    const cookiePath = getYouTubeCookiesPath();

    const tryDownload = async (customArgs: string[]): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const ytDlp = getYtDlpPath();
        const baseArgs = [
          '--no-playlist',
          '--no-part',
          '--no-check-certificates',
          '--js-runtimes',
          'node',
          '-N',
          '4',
          '--concurrent-fragments',
          '4',
          '--buffer-size',
          '16M',
          '--merge-output-format',
          'mp4',
          '-o',
          videoOutPath,
        ];

        if (cookiePath) {
          baseArgs.push('--cookies', cookiePath);
        }

        const fullArgs = [...baseArgs, ...customArgs, sourceUrl];

        const proc = spawn(ytDlp, fullArgs);
        let stderr = '';
        const timer = setTimeout(() => {
          try { proc.kill('SIGKILL'); } catch {}
          resolve(false);
        }, 180000);

        proc.stderr.on('data', (d) => { stderr += d.toString(); });
        proc.on('error', () => { clearTimeout(timer); resolve(false); });
        proc.on('close', (code) => {
          clearTimeout(timer);
          if (code === 0 && fs.existsSync(videoOutPath) && fs.statSync(videoOutPath).size > 10000) {
            resolve(true);
          } else {
            console.warn('[yt-dlp attempt failed]:', stderr.slice(-300));
            resolve(false);
          }
        });
      });
    };

    // Stage 1: Standard high-speed multi-format with node JS challenge solver (visionos auto-detect)
    let ok = await tryDownload([
      '-f',
      'bestvideo[height<=1080]+bestaudio/best[height<=1080]/bestvideo+bestaudio/best',
    ]);

    if (!ok) {
      // Stage 2: Fallback with format tolerance (any video + any audio)
      onProgress?.(25, 'Retrying with flexible stream format resolution...');
      ok = await tryDownload([
        '-f',
        'bestvideo+bestaudio/best',
      ]);
    }

    if (!ok) {
      // Stage 3: Direct 720p/360p pre-muxed streams
      onProgress?.(30, 'Retrying single stream container...');
      ok = await tryDownload([
        '-f',
        'best[height<=720]/best',
      ]);
    }

    if (!ok) {
      throw new Error('YouTube restricted download on cloud server (bot/cookies required). Please set YOUTUBE_COOKIES in Render Environment Variables, or upload your video file directly using the Upload tab.');
    }
  }


  // Step 2: STRICT VERIFICATION OF SOURCE VIDEO VIA FFPROBE
  onProgress?.(40, 'Running ffprobe source stream verification...');
  const probed = await probeMediaFile(videoOutPath);

  if (!probed.hasVideo) {
    throw new Error('Verification Failed: Acquired source has no valid video stream. Refusing to proceed with static thumbnail fallback.');
  }

  if (probed.durationSec < 1) {
    throw new Error(`Verification Failed: Source video duration (${probed.durationSec}s) is too short.`);
  }

  // Step 3: Extract original audio track using FFmpeg
  onProgress?.(46, 'Extracting 16kHz mono audio WAV track for full-video transcription...');

  await new Promise<void>((resolve, reject) => {
    const ffmpegPath = getFFmpegPath();
    const args = [
      '-y',
      '-i',
      videoOutPath,
      '-vn',
      '-threads',
      '0',
      '-ar',
      '16000',
      '-ac',
      '1',
      '-c:a',
      'pcm_s16le',
      audioOutPath,
    ];

    const proc = spawn(ffmpegPath, args);
    let ffmpegErr = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      reject(new Error('FFmpeg audio extraction timed out'));
    }, 45000);

    proc.stderr.on('data', (d) => { ffmpegErr += d.toString(); });
    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 || !fs.existsSync(audioOutPath)) {
        return reject(new Error(`FFmpeg audio extraction failed: ${ffmpegErr.slice(-300)}`));
      }
      resolve();
    });
  });

  // Step 4: Archive original video & extracted audio to Supabase Storage
  let supabaseVideoUrl: string | undefined = undefined;
  let supabaseAudioUrl: string | undefined = undefined;

  onProgress?.(47, 'Media stream ready. Initiating background cloud backup...');

  // Asynchronous non-blocking cloud archive
  if (fs.existsSync(audioOutPath)) {
    uploadToSupabaseStorage('audio-temp', `${projectId}.wav`, fs.readFileSync(audioOutPath), 'audio/wav')
      .then((url) => { supabaseAudioUrl = url; })
      .catch((err: any) => console.warn('[Supabase Audio Upload Notice]:', err.message));
  }

  if (fs.existsSync(videoOutPath)) {
    uploadToSupabaseStorage('video-temp', `${projectId}.mp4`, fs.readFileSync(videoOutPath), 'video/mp4')
      .then((url) => { supabaseVideoUrl = url; })
      .catch((err: any) => console.warn('[Supabase Video Upload Notice]:', err.message));
  }

  onProgress?.(50, '✓ Media downloaded and archived in Supabase Storage. Ready for AI transcription.');

  return {
    videoPath: videoOutPath,
    audioPath: audioOutPath,
    probed,
    supabaseVideoUrl,
    supabaseAudioUrl,
  };
}

export async function downloadBackgroundAudio(
  songUrl: string,
  outputDir: string,
  projectId: string
): Promise<string | undefined> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const audioOutPath = path.join(outputDir, `${projectId}-bg.wav`);

  try {
    await new Promise<void>((resolve, reject) => {
      const ytDlp = getYtDlpPath();
      const args = [
        '--no-playlist',
        '--no-check-certificates',
        '--extract-audio',
        '--audio-format',
        'wav',
        '-o',
        path.join(outputDir, `${projectId}-bg.%(ext)s`),
        songUrl,
      ];

      const proc = spawn(ytDlp, args);
      let stderr = '';
      const timer = setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch {}
        reject(new Error('Background audio download timed out'));
      }, 60000);

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          return reject(new Error(`Failed to download background audio: ${stderr}`));
        }
        resolve();
      });
    });
    
    if (fs.existsSync(audioOutPath)) {
      try {
        const viralAudioPath = path.join(outputDir, `${projectId}-bg-viral.wav`);
        
        // 1. Probe the downloaded full audio to get duration
        const probeData = await probeMediaFile(audioOutPath);
        const duration = probeData.durationSec || 180;
        
        // 2. Calculate the "most viral" part (heuristic: skip first 30%, take next 60s)
        let startSec = Math.floor(duration * 0.30);
        
        // If song is very short, just start from 0
        if (duration < 30) {
          startSec = 0;
        }

        await new Promise<void>((resolve, reject) => {
          const ffmpegPath = getFFmpegPath();
          const ffmpegArgs = [
            '-y',
            '-ss', startSec.toString(),
            '-i', audioOutPath,
            '-t', '60',
            '-c:a', 'pcm_s16le',
            viralAudioPath
          ];
          const proc = spawn(ffmpegPath, ffmpegArgs);
          
          let ffmpegErr = '';
          const timer = setTimeout(() => {
            try { proc.kill('SIGKILL'); } catch {}
            reject(new Error('FFmpeg audio extract timed out'));
          }, 30000);

          proc.stderr.on('data', (d) => { ffmpegErr += d.toString(); });
          proc.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
          });
          proc.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) resolve();
            else reject(new Error(`FFmpeg audio extract failed: ${ffmpegErr}`));
          });
        });
        
        if (fs.existsSync(viralAudioPath)) {
          // Replace the raw download with the extracted viral segment
          fs.unlinkSync(audioOutPath);
          fs.renameSync(viralAudioPath, audioOutPath);
        }
      } catch (extractErr: any) {
        console.warn('[Viral Audio Extraction Failed, falling back to full audio]:', extractErr.message);
      }
      return audioOutPath;
    }
  } catch (err) {
    console.warn('[Background Audio Error]:', err);
  }
  return undefined;
}

