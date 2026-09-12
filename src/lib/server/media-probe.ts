// Server Media Probing & Strict Verification Engine 🔍
// Uses ffprobe to strictly inspect video streams, audio streams, container formats, and durations

import { spawn, execSync } from 'child_process';
import fs from 'fs';

export function getFFmpegPath(): string {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  if (fs.existsSync('/opt/homebrew/bin/ffmpeg')) {
    return '/opt/homebrew/bin/ffmpeg';
  }
  if (fs.existsSync('/usr/bin/ffmpeg')) {
    return '/usr/bin/ffmpeg';
  }
  if (fs.existsSync('/usr/local/bin/ffmpeg')) {
    return '/usr/local/bin/ffmpeg';
  }
  return 'ffmpeg';
}

export function getFFprobePath(): string {
  if (process.env.FFPROBE_PATH && fs.existsSync(process.env.FFPROBE_PATH)) {
    return process.env.FFPROBE_PATH;
  }
  if (fs.existsSync('/opt/homebrew/bin/ffprobe')) {
    return '/opt/homebrew/bin/ffprobe';
  }
  if (fs.existsSync('/usr/bin/ffprobe')) {
    return '/usr/bin/ffprobe';
  }
  if (fs.existsSync('/usr/local/bin/ffprobe')) {
    return '/usr/local/bin/ffprobe';
  }
  return 'ffprobe';
}

export function getPythonPath(): string {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }
  if (fs.existsSync('/usr/bin/python3')) {
    return '/usr/bin/python3';
  }
  if (fs.existsSync('/usr/local/bin/python3')) {
    return '/usr/local/bin/python3';
  }
  if (fs.existsSync('/opt/homebrew/bin/python3')) {
    return '/opt/homebrew/bin/python3';
  }
  if (fs.existsSync('/opt/anaconda3/bin/python3')) {
    return '/opt/anaconda3/bin/python3';
  }
  return 'python3';
}

export function getYtDlpPath(): string {
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH;
  }
  if (fs.existsSync('/usr/local/bin/yt-dlp')) {
    return '/usr/local/bin/yt-dlp';
  }
  if (fs.existsSync('/usr/bin/yt-dlp')) {
    return '/usr/bin/yt-dlp';
  }
  if (fs.existsSync('/opt/homebrew/bin/yt-dlp')) {
    return '/opt/homebrew/bin/yt-dlp';
  }
  return 'yt-dlp';
}


let isVideotoolboxSupported: boolean | null = null;
export function canUseVideotoolbox(): boolean {
  if (isVideotoolboxSupported !== null) return isVideotoolboxSupported;
  try {
    if (process.platform === 'darwin') {
      const ffmpeg = getFFmpegPath();
      const out = execSync(`${ffmpeg} -encoders 2>/dev/null`, { timeout: 3000 }).toString();
      isVideotoolboxSupported = out.includes('h264_videotoolbox');
      return isVideotoolboxSupported;
    }
  } catch {}
  isVideotoolboxSupported = false;
  return false;
}

export interface ProbedMediaStream {
  codecType: 'video' | 'audio' | 'subtitle' | 'other';
  codecName: string;
  width?: number;
  height?: number;
  durationSec?: number;
  sampleRate?: number;
  channels?: number;
}

export interface ProbedMediaResult {
  filePath: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isImage: boolean;
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  fileSizeBytes: number;
  videoCodec?: string;
  audioCodec?: string;
  streams: ProbedMediaStream[];
}

export async function probeMediaFile(filePath: string): Promise<ProbedMediaResult> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Media file does not exist at path: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  if (stats.size < 1000) {
    throw new Error(`Media file is corrupted or too small (${stats.size} bytes): ${filePath}`);
  }

  return new Promise((resolve, reject) => {
    const ffprobePath = getFFprobePath();

    const args = [
      '-v',
      'error',
      '-show_entries',
      'format=duration,size',
      '-show_streams',
      '-of',
      'json',
      filePath,
    ];

    const proc = spawn(ffprobePath, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0 || !stdout.trim()) {
        return reject(new Error(`ffprobe failed: ${stderr || 'Unknown probing error'}`));
      }

      try {
        const json = JSON.parse(stdout);
        const streams: any[] = json.streams || [];
        const format = json.format || {};

        const videoStream = streams.find((s) => s.codec_type === 'video');
        const audioStream = streams.find((s) => s.codec_type === 'audio');

        const durationSec = Number(format.duration || videoStream?.duration || audioStream?.duration) || 0;
        const width = Number(videoStream?.width) || 0;
        const height = Number(videoStream?.height) || 0;

        // Calculate FPS
        let fps = 30;
        if (videoStream?.r_frame_rate) {
          const parts = videoStream.r_frame_rate.split('/');
          if (parts.length === 2 && Number(parts[1]) > 0) {
            fps = Math.round(Number(parts[0]) / Number(parts[1]));
          }
        }

        // Check if file is just a static image or thumbnail
        const isImage = (videoStream?.codec_name === 'png' || videoStream?.codec_name === 'mjpeg' || videoStream?.codec_name === 'jpeg') && durationSec < 0.2;

        const parsedStreams: ProbedMediaStream[] = streams.map((s) => ({
          codecType: s.codec_type || 'other',
          codecName: s.codec_name || '',
          width: s.width,
          height: s.height,
          durationSec: Number(s.duration) || undefined,
          sampleRate: s.sample_rate ? Number(s.sample_rate) : undefined,
          channels: s.channels ? Number(s.channels) : undefined,
        }));

        const result: ProbedMediaResult = {
          filePath,
          hasVideo: Boolean(videoStream) && !isImage,
          hasAudio: Boolean(audioStream),
          isImage,
          durationSec,
          width,
          height,
          fps,
          fileSizeBytes: stats.size,
          videoCodec: videoStream?.codec_name,
          audioCodec: audioStream?.codec_name,
          streams: parsedStreams,
        };

        resolve(result);
      } catch (err: any) {
        reject(new Error(`Failed to parse ffprobe JSON output: ${err.message}`));
      }
    });
  });
}
