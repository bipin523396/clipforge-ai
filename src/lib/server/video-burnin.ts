// ClipForge AI - Professional Server-Side Video Burn-In & Export Engine 🎬
// Burns dynamic subtitles, top hook headlines, brand overlays, and audio normalization
// into universally playable standard H.264/AAC MP4 files (compatible with macOS QuickTime,
// Windows Media Player, iOS, Android, and all web players).

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Clip } from '@/types';
import { probeMediaFile, ProbedMediaResult, canUseVideotoolbox, getFFmpegPath } from './media-probe';
import { getProjectById } from './project-store';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const RENDERS_DIR = isServerless
  ? path.join('/tmp', 'clipforge-renders')
  : path.join(process.cwd(), 'public', 'renders');
const DOWNLOADS_DIR = isServerless
  ? path.join('/tmp', 'clipforge-downloads')
  : path.join(process.cwd(), 'public', 'media', 'downloads');
const FFMPEG_PATH = getFFmpegPath();

export { canUseVideotoolbox };


/**
 * Automatically sweep and remove bulky intermediate raw cuts, duplicate clips, and .tmp files
 */
export function cleanupIntermediateRenders(projectId: string, clipId?: string): void {
  const outDir = path.join(RENDERS_DIR, projectId);
  if (!fs.existsSync(outDir)) return;

  const now = Date.now();
  try {
    const files = fs.readdirSync(outDir);
    for (const f of files) {
      const full = path.join(outDir, f);
      try {
        const stats = fs.statSync(full);
        // Strictly protect active in-flight encoding: never delete files modified in the last 2 minutes
        if (now - stats.mtimeMs < 2 * 60 * 1000) {
          continue;
        }
        // Purge old orphan .tmp or .ass files
        if (f.includes('.tmp') || f.endsWith('.ass')) {
          fs.unlinkSync(full);
          continue;
        }
        // Purge timestamped duplicates of combined mega-shorts
        if (f.startsWith('combined-50s-') && f.endsWith('.mp4')) {
          fs.unlinkSync(full);
          continue;
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[Cleanup Intermediate Renders Warning]:', err);
  }
}


// Fallback font detection for drawtext and subtitles
export function getSystemFontPath(): string {
  const candidateFonts = [
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/Library/Fonts/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  ];

  for (const f of candidateFonts) {
    if (fs.existsSync(f)) {
      return f;
    }
  }
  return '';
}

export interface BurnInOptions {
  resolution?: '720p' | '1080p' | '4k';
  fps?: number;
  forceRerender?: boolean;
  channelName?: string;
  showChannelWatermark?: boolean;
}

export interface BurnInResult {
  filePath: string;
  publicUrl: string;
  fileSizeBytes: number;
  durationSec: number;
  probed: ProbedMediaResult;
}

/**
 * Escape string for FFmpeg drawtext filter
 */
function escapeDrawText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '’')
    .replace(/:/g, '\\:')
    .replace(/%/g, '%%')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .trim();
}

/**
 * Format seconds to ASS timestamp: 0:00:05.25
 */
function formatAssTime(sec: number): string {
  const s = Math.max(0, sec);
  const hrs = Math.floor(s / 3600).toString();
  const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(s % 60).toString().padStart(2, '0');
  const cs = Math.floor((s % 1) * 100).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}.${cs}`;
}

/**
 * Split raw headline text into two-tone Big-Letter format
 * e.g. "नेपाल में एक कुत्ते की वफादारी की मिसाल" -> { main: "नेपाल में एक कुत्ते", highlight: "की वफादारी की मिसाल" }
 * e.g. "VIRAT KOHLI'S UNREAL KNOCK IN ENGLAND!" -> { main: "VIRAT KOHLI'S", highlight: "UNREAL KNOCK IN ENGLAND!" }
 */
export function splitHeadlineTwoTone(rawText: string): { main: string; highlight: string } {
  if (!rawText) return { main: 'WATCH UNTIL', highlight: 'THE END!' };
  const cleaned = cleanHeadlinePhrase(rawText)
    .replace(/^["']|["']$/g, '')
    .replace(/\.{2,}/g, '')
    .replace(/^[.,:;!?'"\s]+|[.,:;!?'"\s]+$/g, '')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { main: words[0] || 'MUST WATCH', highlight: '' };
  }
  if (words.length === 2) {
    return {
      main: words[0].replace(/[.,;:]+$/, ''),
      highlight: words[1].replace(/[.,;:]+$/, ''),
    };
  }
  const mid = Math.ceil(words.length / 2);
  const main = words.slice(0, mid).join(' ').replace(/[.,;:]+$/, '').trim();
  const highlight = words.slice(mid).join(' ').replace(/[.,;:]+$/, '').trim();
  return { main, highlight };
}

/**
 * Clean conversational speech filler, trailing dots, handles, and YouTuber channel names from headline phrases
 */
export function cleanHeadlinePhrase(text: string): string {
  if (!text) return '';
  return text
    .replace(/\/\/\s*.*$/gi, '') // Remove "// Shri Hit Premanand Ji Maharaj" etc.
    .replace(/\|\s*.*$/gi, '') // Remove "| Sadhan Path" etc.
    .replace(/[-–—]\s*(by|channel|official|youtube|ji maharaj|sadhan path).*$/gi, '')
    .replace(
      /^(up here|and so|so basically|you know|look at that|look at this|look|wait for it|check this out|here is|here's|and now|hey guys|listen)[.,:\s]+/i,
      ''
    )
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/\.{2,}/g, '')
    .replace(/^[.,:;!?'"\s]+|[.,:;!?'"\s]+$/g, '')
    .replace(/@\w+/g, '')
    .replace(/#\w+/g, '')
    .trim();
}

/**
 * Extract a high-engagement viral headline banner, stripping conversational filler and third-party YouTuber names
 */
export function extractCatchyHeadline(clip: Clip, projectTitle?: string): { main: string; highlight: string } {
  // 1. Check clip overlays
  if (clip.overlays?.headlineText && clip.overlays.headlineText.trim().length > 2) {
    const rawMain = cleanHeadlinePhrase(clip.overlays.headlineText);
    const rawHigh = cleanHeadlinePhrase(clip.overlays?.headlineHighlight || '');
    if (rawHigh && rawHigh.toLowerCase() !== rawMain.toLowerCase()) {
      const highWords = rawHigh.split(/\s+/).slice(0, 3).join(' ');
      return {
        main: rawMain || 'MUST WATCH',
        highlight: highWords,
      };
    }
    if (rawMain) {
      return splitHeadlineTwoTone(rawMain);
    }
  }

  // 2. Candidate pool
  const candidates = [
    clip.title,
    clip.hookStatement,
    projectTitle,
  ].filter((c): c is string => Boolean(c && c.trim().length > 0));

  for (const raw of candidates) {
    const lower = raw.toLowerCase().trim();
    if (lower.startsWith('clip-') || lower === 'viral short' || lower === 'untitled' || lower === 'short') {
      continue;
    }

    const cleaned = cleanHeadlinePhrase(raw);
    if (cleaned.length >= 4) {
      return splitHeadlineTwoTone(cleaned);
    }
  }

  const fallback = cleanHeadlinePhrase(clip.title || clip.hookStatement || projectTitle || '');
  if (fallback) {
    return splitHeadlineTwoTone(fallback);
  }
  return { main: 'MUST WATCH', highlight: 'HIGHLIGHT!' };
}

/**
 * Helper to build continuous, dynamic subtitles ensuring zero dead gaps in video
 */
export function buildContinuousSubtitles(
  clip: Clip,
  projectTitle: string | undefined,
  durationSec: number
): { id: string; startSec: number; endSec: number; text: string }[] {
  const rawSegments = (clip.captions?.segments || [])
    .filter((s) => s && s.text && s.text.trim().length > 0)
    .sort((a, b) => a.startSec - b.startSec);

  const cleanTitle = cleanHeadlinePhrase(
    clip.overlays?.headlineText || clip.hookStatement || clip.title || projectTitle || ''
  );
  const isDevanagari = /[\u0900-\u097F]/.test(cleanTitle);

  // If real speech segments exist, ensure there are no dead empty gaps > 2.5s
  if (rawSegments.length > 0) {
    const result: { id: string; startSec: number; endSec: number; text: string }[] = [];

    for (let i = 0; i < rawSegments.length; i++) {
      const seg = rawSegments[i];
      let start = Math.max(0, seg.startSec);
      let end = Math.min(durationSec, Math.max(start + 0.8, seg.endSec));

      // Strictly clamp previous segment's endSec so two subtitle phrases NEVER display simultaneously
      if (result.length > 0) {
        const last = result[result.length - 1];
        if (last.endSec > start) {
          if (start > last.startSec + 0.4) {
            last.endSec = Number(start.toFixed(2));
          } else {
            start = last.endSec;
            end = Math.max(start + 0.8, end);
          }
        }
      }

      // If next segment exists, clamp this segment's end to avoid colliding with next segment
      if (i + 1 < rawSegments.length) {
        const nextStart = Math.max(0, rawSegments[i + 1].startSec);
        if (nextStart > start) {
          end = Math.min(end, nextStart);
        }
      }

      const effectivePrevEnd = result.length === 0 ? 0 : result[result.length - 1].endSec;
      // Fill long silence gap with a contextual cue
      if (start - effectivePrevEnd > 2.5) {
        const gapWords = cleanTitle.split(/\s+/).filter(Boolean);
        const chunkText = gapWords.length > 0
          ? gapWords.slice(0, 5).join(' ')
          : isDevanagari ? 'सत्संग का आनंद लें' : 'WATCH THIS SCENE!';
        result.push({
          id: `cue-${i}`,
          startSec: Number(effectivePrevEnd.toFixed(2)),
          endSec: Number(Math.min(start, effectivePrevEnd + 2.5).toFixed(2)),
          text: chunkText,
        });
      }

      if (end > start + 0.3) {
        result.push({
          id: seg.id || `seg-${i}`,
          startSec: Number(start.toFixed(2)),
          endSec: Number(end.toFixed(2)),
          text: seg.text.trim(),
        });
      }
    }

    // Trailing gap check
    if (result.length > 0 && durationSec - result[result.length - 1].endSec > 2.5) {
      const lastEnd = result[result.length - 1].endSec;
      result.push({
        id: 'trailing-cue',
        startSec: Number(lastEnd.toFixed(2)),
        endSec: Number(durationSec.toFixed(2)),
        text: isDevanagari ? 'पूरा सत्संग सुनें' : 'FOLLOW FOR MORE!',
      });
    }

    return result;
  }

  // If no speech segments exist, generate rhythmic sequential storytelling captions across the video
  const words = cleanTitle.split(/\s+/).filter(Boolean);
  const phraseList: string[] = [];
  const chunkSize = 4;
  for (let c = 0; c < words.length; c += chunkSize) {
    phraseList.push(words.slice(c, c + chunkSize).join(' '));
  }
  if (phraseList.length === 0) {
    if (isDevanagari) {
      phraseList.push('विशेष सत्संग विचार', 'ध्यानपूर्वक श्रवण करें', 'पूरा सत्संग सुनें');
    } else {
      phraseList.push('INCREDIBLE MOMENT', 'WATCH UNTIL THE END', 'FOLLOW FOR MORE');
    }
  }

  const chunkDuration = Math.min(4.5, durationSec / Math.max(1, phraseList.length));
  const syntheticSegments: { id: string; startSec: number; endSec: number; text: string }[] = [];

  for (let idx = 0; idx < phraseList.length; idx++) {
    const s = Number((idx * chunkDuration).toFixed(2));
    const e = Number(Math.min(durationSec, (idx + 1) * chunkDuration).toFixed(2));
    if (s < durationSec) {
      syntheticSegments.push({
        id: `synth-${idx}`,
        startSec: s,
        endSec: e,
        text: phraseList[idx],
      });
    }
  }

  return syntheticSegments;
}


/**
 * Generate standard ASS subtitle content with sleek, compact layout:
 * - Top Box: Catchy 2-Tone Big-Letter Title inside sleek compact box
 * - Subtitle Box: Centered subtitles inside sleek lower box (Y=74.5%..81%, center Y=1492)
 * - Channel Watermark: Discreet bottom badge above progress bar
 */
function generateAssSubtitles(
  clip: Clip,
  targetWidth: number,
  targetHeight: number,
  durationSec: number,
  channelName?: string,
  projectTitle?: string
): string {
  const segments = buildContinuousSubtitles(clip, projectTitle, durationSec);

  // Catchy Big-Letter Title extraction (ALWAYS present, never empty, speech-filler and YouTuber names stripped)
  const headline = extractCatchyHeadline(clip, projectTitle);
  let headlineMain = headline.main;
  let headlineHighlight = headline.highlight;

  // Detect Devanagari / Hindi script across headline and segments
  const allSampleText = `${headlineMain} ${headlineHighlight} ${segments.map((s) => s.text).join(' ')}`;
  const hasDevanagari = /[\u0900-\u097F]/.test(allSampleText);
  const preferredFont = hasDevanagari ? 'Kohinoor Devanagari' : 'Arial Unicode MS';

  // Sanitize for ASS (remove emojis/flags to avoid missing font glyph errors, escape braces)
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{FE00}-\u{FE0F}]/gu;
  let cleanMain = headlineMain.replace(emojiRegex, '').replace(/[{}]/g, '').trim();
  let cleanHighlight = headlineHighlight.replace(emojiRegex, '').replace(/[{}]/g, '').trim();

  if (!hasDevanagari) {
    cleanMain = cleanMain.toUpperCase();
    cleanHighlight = cleanHighlight.toUpperCase();
  }

  if (!cleanMain && !cleanHighlight) {
    cleanMain = hasDevanagari ? 'विशेष सत्संग' : 'MUST WATCH';
    cleanHighlight = hasDevanagari ? 'महत्वपूर्ण विचार' : 'HIGHLIGHT!';
  }

  // Headline highlight color in ASS BGR format
  let headlineAssHighlightColor = '&H0015CCFA&'; // Neon Yellow (#FACC15 in BGR)
  if (clip.overlays?.headlineStyle === 'fire_orange') {
    headlineAssHighlightColor = '&H003C92FB&'; // Fire Orange (#FB923C in BGR)
  } else if (clip.overlays?.headlineStyle === 'neon_cyan') {
    headlineAssHighlightColor = '&H00EED322&'; // Electric Cyan (#22D3EE in BGR)
  }

  // Channel Watermark branding
  const effectiveChannel = (channelName || clip.overlays?.channelName || '').trim();
  const cleanChannel = effectiveChannel
    .replace(emojiRegex, '')
    .replace(/[{}]/g, '')
    .trim();

  // Reference coordinates for PlayResX: 1080, PlayResY: 1920
  // Top Headline: Centered at Y = 140 (comfortable clearance from top notch/header)
  // Subtitle: Centered at Y = 1380 (prominent lower-third, safely above watermark blur zone at Y = 1497)
  // Channel Watermark: MarginV = 32 (Alignment 2: bottom center above progress bar)
  const header = `[Script Info]
Title: ClipForge AI Sleek Subtitles & Catchy Headline
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: HeadlineBanner,${preferredFont},48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5.2,2.0,5,40,40,0,1
Style: SubtitleText,${preferredFont},48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5.0,2.0,5,40,40,0,1
Style: ChannelBrand,${preferredFont},26,&H0022D3EE,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,1,0,1,3.0,1.0,2,40,40,32,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = '';
  const totalEndStr = formatAssTime(durationSec);

  // 1. Top Catchy Big-Letter Colorful Headline (Rendered cleanly without black box, centered at Y = 140)
  const hasTwoLines = cleanMain && cleanHighlight && cleanMain !== cleanHighlight;
  let headlineText = '';
  if (hasTwoLines) {
    headlineText = `{\\pos(540,140)\\b1\\c&H00FFFFFF&}${cleanMain}\\N{\\c${headlineAssHighlightColor}\\b1}${cleanHighlight}`;
  } else {
    const single = cleanMain || cleanHighlight || (hasDevanagari ? 'विशेष सत्संग' : 'VIRAL HIGHLIGHT');
    headlineText = `{\\pos(540,140)\\b1\\c${headlineAssHighlightColor}}${single}`;
  }
  events += `Dialogue: 1,0:00:00.00,${totalEndStr},HeadlineBanner,,0,0,0,,${headlineText}\n`;

  // 2. Branded Channel Name Watermark (Subtle at bottom center above progress bar)
  if (cleanChannel) {
    const watermarkDisplay = cleanChannel.startsWith('@')
      ? cleanChannel
      : `| ${cleanChannel.toUpperCase()} |`;
    events += `Dialogue: 2,0:00:00.00,${totalEndStr},ChannelBrand,,0,0,0,,{\\an2\\fs26\\b1\\c&H0022D3EE&\\bord3.0\\3c&H00000000&}${watermarkDisplay}\n`;
  }

  // 3. Dynamic Subtitles (No Black Box, Centered at Y = 1380 cleanly above blur zone)
  segments.forEach((seg) => {
    const startStr = formatAssTime(seg.startSec);
    const endStr = formatAssTime(seg.endSec);
    let cleanText = (seg.text || '')
      .replace(emojiRegex, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/[{}]/g, '')
      .trim();

    if (cleanText) {
      const words = cleanText.split(/\s+/);
      let formatted = cleanText;
      if (words.length > 7) {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');
        if (words.length >= 2) {
          const firstTwo = words.slice(0, 2).join(' ');
          const restL1 = words.slice(2, mid).join(' ');
          formatted = `{\\c&H0015CCFA&\\b1}${firstTwo}${restL1 ? ' ' + restL1 : ''}\\N{\\c&H00FFFFFF&\\b1}${line2}`;
        } else {
          formatted = `{\\c&H0015CCFA&\\b1}${line1}\\N{\\c&H00FFFFFF&\\b1}${line2}`;
        }
      } else if (words.length >= 2) {
        const firstTwo = words.slice(0, 2).join(' ');
        const rest = words.slice(2).join(' ');
        formatted = `{\\c&H0015CCFA&\\b1}${firstTwo} {\\c&H00FFFFFF&\\b1}${rest}`;
      } else {
        formatted = `{\\c&H0015CCFA&\\b1}${cleanText}`;
      }

      events += `Dialogue: 0,${startStr},${endStr},SubtitleText,,0,0,0,,{\\pos(540,1380)}${formatted}\n`;
    }
  });

  return header + events;
}


/**
 * Locate best available video source for the clip, strictly avoiding active/partial writes
 */
export async function resolveClipSourceVideo(projectId: string, clipId: string, clip?: Clip): Promise<string> {
  const projectDir = path.join(RENDERS_DIR, projectId);

  // 1. If this is a mega short, look for combined-50s-*.mp4 first (newest first)
  if (clipId.includes('mega') || clipId.includes('combined')) {
    if (fs.existsSync(projectDir)) {
      const files = fs.readdirSync(projectDir);
      const combinedFiles = files
        .filter((f) => f.startsWith('combined-50s') && f.endsWith('.mp4') && !f.includes('.tmp'))
        .map((f) => ({
          name: f,
          path: path.join(projectDir, f),
          time: fs.statSync(path.join(projectDir, f)).mtimeMs,
        }))
        .sort((a, b) => b.time - a.time);

      if (combinedFiles.length > 0 && fs.statSync(combinedFiles[0].path).size > 100000) {
        return combinedFiles[0].path;
      }
    }
  }

  // 2. Check if raw clip render already exists and is non-empty
  const existingRender = path.join(projectDir, `${clipId}.mp4`);
  if (fs.existsSync(existingRender)) {
    const stat = fs.statSync(existingRender);
    if (stat.size > 50000) return existingRender;
  }

  // 3. Check if a source video exists in downloads directory
  if (fs.existsSync(DOWNLOADS_DIR)) {
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const projMatch = files.find((f) => f.startsWith(projectId) && (f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mov')));
    if (projMatch) {
      return path.join(DOWNLOADS_DIR, projMatch);
    }
  }

  // 4. Fallback to any clean finished clip in the project renders dir (never a burned or tmp file)
  if (fs.existsSync(projectDir)) {
    const clipFiles = fs.readdirSync(projectDir).filter(
      (f) => f.endsWith('.mp4') && !f.includes('thumb') && !f.includes('-burned') && !f.includes('.tmp')
    );
    if (clipFiles.length > 0) {
      return path.join(projectDir, clipFiles[0]);
    }
  }

  throw new Error(`Cannot locate video source file for project ${projectId} clip ${clipId}`);
}

/**
 * Render complete edited clip with burned-in subtitles, hook banner, progress bar,
 * normalized audio, 4K Ultra-HD resolution support, and strict QuickTime/H.264 compatibility.
 */
// Global in-flight render mutex to eliminate duplicate concurrent FFmpeg renders
const inFlightBurnInJobs = new Map<string, Promise<BurnInResult>>();

export async function renderBurnedEditedClip(
  projectId: string,
  clipId: string,
  options: BurnInOptions = {}
): Promise<BurnInResult> {
  const jobKey = `${projectId}:${clipId}:${options.resolution || '4k'}:${options.channelName || ''}`;
  if (!options.forceRerender && inFlightBurnInJobs.has(jobKey)) {
    return inFlightBurnInJobs.get(jobKey)!;
  }

  const promise = doRenderBurnedEditedClip(projectId, clipId, options).finally(() => {
    inFlightBurnInJobs.delete(jobKey);
  });

  inFlightBurnInJobs.set(jobKey, promise);
  return promise;
}

export const BURNIN_STYLE_VERSION = 'v6_nobox_bigtext_nooverlap';

/**
 * Internal burn-in worker
 */
async function doRenderBurnedEditedClip(
  projectId: string,
  clipId: string,
  options: BurnInOptions = {}
): Promise<BurnInResult> {
  const outDir = path.join(RENDERS_DIR, projectId);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const resolution = options.resolution || '4k';
  const is4K = resolution === '4k';
  const is720p = resolution === '720p';
  const burnedFilename = is4K ? `${clipId}-4k-burned.mp4` : is720p ? `${clipId}-720p-burned.mp4` : `${clipId}-burned.mp4`;
  const finalPath = path.join(outDir, burnedFilename);
  const metaPath = `${finalPath}.meta.json`;
  const tempPath = path.join(outDir, `${clipId}-burned-${Date.now()}.tmp.mp4`);
  const publicUrl = `/renders/${projectId}/${burnedFilename}`;

  // Check metadata version to strictly guarantee no outdated styling or black boxes are served
  let isValidVersion = false;
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      if (meta && meta.version === BURNIN_STYLE_VERSION) {
        isValidVersion = true;
      }
    } catch {}
  }

  // If already rendered, authentic, and matches current visual styling version, return cached
  if (!options.forceRerender && isValidVersion && fs.existsSync(finalPath)) {
    try {
      const existingProbe = await probeMediaFile(finalPath);
      const matches4KReq = !is4K || (existingProbe.width >= 2160 || existingProbe.height >= 2160);
      if (existingProbe.hasVideo && existingProbe.fileSizeBytes > 100000 && matches4KReq) {
        return {
          filePath: finalPath,
          publicUrl,
          fileSizeBytes: existingProbe.fileSizeBytes,
          durationSec: existingProbe.durationSec,
          probed: existingProbe,
        };
      }
    } catch {
      // If corrupted, re-render
    }
  }

  // Load project and clip metadata
  const project = await getProjectById(projectId);
  const clip = project?.clips.find((c) => c.id === clipId);
  const sourceVideoPath = await resolveClipSourceVideo(projectId, clipId, clip);

  const durationSec = clip?.durationSec || 30;
  const startSec = clip?.startSec || 0;
  const assSubPath = path.join(outDir, `${clipId}-subs-${Date.now()}.ass`);

  const effectiveChannel = options.channelName || clip?.overlays?.channelName || project?.channelName || '';

  // Recover caption segments if empty so subtitles are NEVER missing on download
  const effectiveClip: Clip = clip ? { ...clip } : ({} as any);

  // Target resolution calculation: 4K Ultra-HD, 1080p, 720p
  const ratio = clip?.aspectRatio || '9:16';
  let targetWidth = 2160;
  let targetHeight = 3840;

  if (resolution === '4k') {
    if (ratio === '1:1') {
      targetWidth = 2160;
      targetHeight = 2160;
    } else if (ratio === '16:9') {
      targetWidth = 3840;
      targetHeight = 2160;
    } else {
      targetWidth = 2160;
      targetHeight = 3840;
    }
  } else if (resolution === '720p') {
    if (ratio === '1:1') {
      targetWidth = 720;
      targetHeight = 720;
    } else if (ratio === '16:9') {
      targetWidth = 1280;
      targetHeight = 720;
    } else {
      targetWidth = 720;
      targetHeight = 1280;
    }
  } else {
    // 1080p
    if (ratio === '1:1') {
      targetWidth = 1080;
      targetHeight = 1080;
    } else if (ratio === '16:9') {
      targetWidth = 1920;
      targetHeight = 1080;
    } else {
      targetWidth = 1080;
      targetHeight = 1920;
    }
  }

  // Generate ASS script containing Catchy Headline, Channel Watermark, and Speech Captions
  const assContent = generateAssSubtitles(effectiveClip, 1080, 1920, durationSec, effectiveChannel, project?.title);
  fs.writeFileSync(assSubPath, assContent, 'utf-8');

  // Build FFmpeg video filter chain
  const filters: string[] = [];

  // 1. Fast dynamic blur across moving third-party YouTuber channel watermark zone (Y=78%..92%)
  filters.push(
    `split[main_vid][blur_src];[blur_src]crop=iw:ih*0.14:0:ih*0.78,boxblur=20:3[blurred_watermark];[main_vid][blurred_watermark]overlay=0:H*0.78`
  );

  // 2. High quality, efficient bicubic scaling to target resolution
  filters.push(`scale=${targetWidth}:${targetHeight}:flags=bicubic:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight}`);

  // Scale backdrop and progress bar coordinates based on resolution
  const scaleRatio = targetWidth / 1080;
  const progressH = Math.max(10, Math.round(10 * scaleRatio));

  // 3. Burn-in Catchy Big-Letter Headline + Channel Watermark + Subtitles directly onto video via libass (No black background box)
  filters.push(`ass='${assSubPath}'`);

  // 4. Dynamic Progress Bar at bottom
  filters.push(
    `drawbox=x=0:y=ih-${progressH}:w='min(iw,iw*(t/${durationSec}))':h=${progressH}:color=0x22D3EE@0.95:t=fill`
  );

  const videoFilterString = filters.join(',');
  const audioFilter = 'dynaudnorm=p=0.9:m=10:s=12:b=1';

  // If sourceVideoPath is the long full-length download, seek to startSec
  const isRawFullDownload = sourceVideoPath.includes('/media/downloads/');
  const inputArgs: string[] = [];
  if (isRawFullDownload && startSec > 0) {
    inputArgs.push('-ss', startSec.toString());
  }
  inputArgs.push('-i', sourceVideoPath);

  const crf = is4K ? '17' : '19';
  const audioBitrate = is4K ? '320k' : '256k';
  const audioSampleRate = is4K ? '48000' : '44100';
  const h264Level = is4K ? '5.2' : '4.2';

  const useHardwareVT = canUseVideotoolbox();
  const videoCodecArgs: string[] = useHardwareVT
    ? ['-c:v', 'h264_videotoolbox', '-b:v', is4K ? '25M' : is720p ? '5M' : '10M', '-pix_fmt', 'yuv420p']
    : [
        '-c:v', 'libx264',
        '-profile:v', 'high',
        '-level', h264Level,
        '-pix_fmt', 'yuv420p',
        '-preset', 'ultrafast',
        '-threads', '0',
        '-crf', crf,
      ];

  await new Promise<void>((resolve, reject) => {
    const args = [
      '-y',
      ...inputArgs,
      '-t',
      durationSec.toString(),
      '-vf',
      videoFilterString,
      '-af',
      audioFilter,
      ...videoCodecArgs,
      '-c:a',
      'aac',
      '-b:a',
      audioBitrate,
      '-ar',
      audioSampleRate,
      '-ac',
      '2',
      '-movflags',
      '+faststart',
      tempPath,
    ];

    const proc = spawn(FFMPEG_PATH, args);
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      // Clean up temporary ASS file
      try {
        if (fs.existsSync(assSubPath)) fs.unlinkSync(assSubPath);
      } catch {}

      if (code !== 0 || !fs.existsSync(tempPath)) {
        console.error(`[Video Burn-in Error]:`, stderr);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return reject(new Error(`FFmpeg burn-in failed with code ${code}: ${stderr.slice(-300)}`));
      }

      // Atomically promote temporary file to final output
      try {
        fs.renameSync(tempPath, finalPath);
      } catch {
        fs.copyFileSync(tempPath, finalPath);
        fs.unlinkSync(tempPath);
      }

      try {
        fs.writeFileSync(
          metaPath,
          JSON.stringify(
            {
              version: BURNIN_STYLE_VERSION,
              clipId,
              projectId,
              resolution,
              renderedAt: new Date().toISOString(),
            },
            null,
            2
          ),
          'utf-8'
        );
      } catch {}

      cleanupIntermediateRenders(projectId, clipId);
      resolve();
    });
  });

  // Verify rendered video with strict ffprobe
  const probed = await probeMediaFile(finalPath);
  if (!probed.hasVideo) {
    throw new Error(`Verification failed: rendered file has no valid video stream`);
  }

  return {
    filePath: finalPath,
    publicUrl,
    fileSizeBytes: probed.fileSizeBytes,
    durationSec: probed.durationSec,
    probed,
  };
}
