'use client';

import React, { useRef, useEffect } from 'react';
import { Clip } from '@/types';
import { Play, Pause, Shield } from 'lucide-react';
import { splitHeadlineTwoTone } from '@/lib/client-download';

interface VideoCanvasProps {
  clip: Clip;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  previewQuality?: string;
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({
  clip,
  currentTime,
  isPlaying,
  onTogglePlay,
}) => {
  const { captions, cropSettings, overlays, aspectRatio } = clip;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video playback
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync video seek
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Find active caption segment and active word
  const activeSegment = captions.segments.find(
    (seg) => currentTime >= seg.startSec && currentTime <= seg.endSec
  );

  const activeWordIdx = Array.isArray(activeSegment?.words)
    ? activeSegment.words.findIndex(
        (w) => currentTime >= w.startSec && currentTime <= w.endSec
      )
    : -1;

  // Aspect ratio styling
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[580px]'
      : aspectRatio === '1:1'
      ? 'aspect-[1/1] max-h-[500px]'
      : 'aspect-[16/9] max-h-[420px]';

  // Calculate progress percentage of current clip
  const clipProgress = Math.max(
    0,
    Math.min(100, ((currentTime - clip.startSec) / (clip.durationSec || 1)) * 100)
  );

  const isFitBlur = cropSettings.backgroundMode === 'blur' || (cropSettings.scale || 1.0) <= 1.05;
  const watermarkPosClass =
    overlays.watermarkPos === 'top-right'
      ? 'top-4 right-4'
      : overlays.watermarkPos === 'bottom-left'
      ? 'bottom-8 left-4'
      : 'bottom-8 right-4'; // default bottom-right (standard YouTube watermark location)

  return (
    <div className="relative flex items-center justify-center h-full w-full bg-zinc-950/80 p-4 select-none">
      <div
        className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden border-2 border-violet-500/40 bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center group`}
      >
        {/* Ambient Blurred Video Background (Provides depth & fixes framing) */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-xl scale-125 opacity-55"
          style={{ backgroundImage: `url(${clip.thumbnailUrl})` }}
        />

        {/* Real HTML5 Video Player - Zero Zoom when FitBlur enabled */}
        <video
          ref={videoRef}
          src={clip.previewVideoUrl}
          poster={clip.thumbnailUrl}
          playsInline
          loop
          muted={false}
          className={`absolute inset-0 w-full h-full transition-transform duration-300 z-10 ${
            isFitBlur ? 'object-contain' : 'object-cover'
          }`}
          style={{
            transform: !isFitBlur
              ? `scale(${cropSettings.scale || 1.15}) translate(${
                  ((cropSettings.x || 0.5) - 0.5) * -40
                }%, ${((cropSettings.y || 0.5) - 0.5) * -40}%)`
              : undefined,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75 pointer-events-none z-10" />

        {/* AI Face Tracking Bounding Box indicator (when enabled) */}
        {cropSettings.smartTrack && (
          <div
            className="absolute rounded-xl border border-dashed border-cyan-400/80 bg-cyan-400/10 pointer-events-none flex items-start justify-end p-1 transition-all z-20"
            style={{
              top: `${((cropSettings.y || 0.5) - 0.15) * 100}%`,
              left: `${((cropSettings.x || 0.5) - 0.22) * 100}%`,
              width: '44%',
              height: '30%',
            }}
          >
            <span className="text-[8px] font-mono font-bold text-cyan-300 bg-black/80 px-1 rounded">
              AI Face Track
            </span>
          </div>
        )}

        {/* Top Headline Banner Overlay - Catchy Big Letter Two-Tone Title (Matching User Screenshot) */}
        {overlays?.headlineText && (() => {
          const mainText = overlays.headlineHighlight ? overlays.headlineText : splitHeadlineTwoTone(overlays.headlineText).main;
          const highlightText = overlays.headlineHighlight ? overlays.headlineHighlight : splitHeadlineTwoTone(overlays.headlineText).highlight;
          const style = overlays.headlineStyle || 'yellow_white';
          const highlightColorClass = style === 'fire_orange'
            ? 'text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.85)]'
            : style === 'neon_cyan'
            ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.85)]'
            : 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.85)]';
          const borderClass = style === 'fire_orange'
            ? 'border-orange-500/50'
            : style === 'neon_cyan'
            ? 'border-cyan-500/50'
            : 'border-yellow-400/60';

          return (
            <div className="absolute top-6 inset-x-3 text-center z-20 pointer-events-none">
              <div className="inline-block px-2 max-w-[98%] text-center">
                <p className="font-black uppercase tracking-tight leading-snug flex flex-col items-center">
                  <span className="text-white text-sm sm:text-base md:text-lg font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:_0_2px_10px_rgba(0,0,0,1),_0_0_16px_rgba(0,0,0,0.9),_0_0_3px_rgba(0,0,0,1)]">
                    {mainText}
                  </span>
                  <span className={`${highlightColorClass} text-base sm:text-lg md:text-xl font-black mt-0.5 tracking-tight [text-shadow:_0_2px_10px_rgba(0,0,0,1),_0_0_16px_rgba(0,0,0,0.9),_0_0_3px_rgba(0,0,0,1)]`}>
                    {highlightText}
                  </span>
                </p>
              </div>
            </div>
          );
        })()}

        {/* Branded Channel Watermark (WYSIWYG preview matching reference screenshot) */}
        {overlays.channelName && (
          <div className="absolute top-[84px] inset-x-4 flex justify-center z-20 pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/25 shadow-xl flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-widest text-zinc-100">
              <span>{overlays.channelName.startsWith('@') ? overlays.channelName : `| ${overlays.channelName.toUpperCase()} |`}</span>
            </div>
          </div>
        )}

        {/* YouTuber Channel Logo & Watermark Shield (Masks and Blurs Moving Channel Watermarks) */}
        {overlays.watermarkOpacity !== 0 && (
          <>
            {/* Active Frosted-Glass Dynamic Blur Overlay across Moving Watermark Zone */}
            <div
              className="absolute inset-x-0 bottom-[6%] h-[15%] pointer-events-none z-10 backdrop-blur-xl"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
              }}
            />
            <div className={`absolute ${watermarkPosClass} z-20 pointer-events-none`}>
              <div className="rounded-lg bg-black/85 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-xl">
                <Shield className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>Moving Logo Shield</span>
              </div>
            </div>
          </>
        )}

        {/* Word-by-Word Animated Caption Track (No Black Box, Direct on Video, Big Size) */}
        <div
          className="absolute inset-x-4 text-center z-20 pointer-events-none transition-all"
          style={{ top: `${captions.positionY || 75}%` }}
        >
          {activeSegment ? (
            <div className="inline-block p-1 max-w-full text-center">
              <p
                className="font-black uppercase tracking-wide leading-snug"
                style={{
                  fontFamily: captions.fontFamily || 'Inter',
                  fontSize: `${(captions.fontSize || 48) / 2.6}px`,
                  color: captions.textColor || '#FFFFFF',
                  textShadow:
                    '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 10px rgba(0,0,0,0.95)',
                }}
              >
                {Array.isArray(activeSegment.words) && activeSegment.words.length > 0 ? (
                  activeSegment.words.map((w, idx) => {
                    const isActive = idx === activeWordIdx;
                    return (
                      <span
                        key={idx}
                        className={`inline-block mx-0.5 transition-all duration-150 ${
                          isActive
                            ? 'scale-125 drop-shadow-[0_0_14px_rgba(250,204,21,1)]'
                            : ''
                        }`}
                        style={{
                          color: isActive
                            ? captions.highlightColor || '#FACC15'
                            : w.highlight
                            ? '#22D3EE'
                            : captions.textColor,
                        }}
                      >
                        {w.word}
                      </span>
                    );
                  })
                ) : (
                  <span>{activeSegment.text}</span>
                )}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-black/40 px-3 py-1 text-[11px] text-zinc-400 inline-block font-mono">
              [Situational Speech & Voice Stream]
            </div>
          )}
        </div>

        {/* CTA Banner Overlay at Bottom */}
        {overlays?.ctaText && (
          <div className="absolute bottom-5 inset-x-4 text-center z-20 pointer-events-none">
            <div className="inline-block rounded-lg bg-zinc-900/90 border border-zinc-700 px-2.5 py-1 text-[10px] font-bold text-cyan-300 shadow">
              {overlays.ctaText}
            </div>
          </div>
        )}

        {/* Animated Retention Progress Bar */}
        {overlays?.showProgressBar && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-900 z-30">
            <div
              className="h-full transition-all duration-150"
              style={{
                width: `${clipProgress}%`,
                backgroundColor: overlays.progressBarColor || '#22D3EE',
              }}
            />
          </div>
        )}

        {/* Center Play/Pause Floating Trigger Button */}
        <button
          onClick={onTogglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-40 cursor-pointer"
        >
          <div className="h-14 w-14 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </div>
        </button>
      </div>
    </div>
  );
};
