'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Clip } from '@/types';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Edit3,
  Download,
  Shield,
  Subtitles,
  Languages,
  Crop,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import { downloadVerifiedVideoMp4, splitHeadlineTwoTone } from '@/lib/client-download';

interface QuickWatchModalProps {
  clips: Clip[];
  initialClipIndex: number;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onOpenAIEdit?: (clip: Clip) => void;
}

export const QuickWatchModal: React.FC<QuickWatchModalProps> = ({
  clips,
  initialClipIndex,
  isOpen,
  onClose,
  projectId,
  onOpenAIEdit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialClipIndex);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // User Features
  const [framingMode, setFramingMode] = useState<'fit-blur' | 'portrait'>('fit-blur');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState<'en' | 'orig'>('en');
  const [shieldWatermark, setShieldWatermark] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialClipIndex);
  }, [initialClipIndex]);

  const currentClip = clips[currentIndex] || clips[0];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isOpen) return;

    video.currentTime = 0;
    setCurrentTime(0);
    video.muted = isMuted;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, isOpen]);

  if (!isOpen || !currentClip) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(clips.length - 1);
    }
  };

  // Direct Verified MP4 Download (4K Ultra-HD)
  const handleDownloadMP4 = async () => {
    const channelParam = currentClip.overlays?.channelName ? `&channelName=${encodeURIComponent(currentClip.overlays.channelName)}` : '';
    const downloadUrl = `/api/projects/${currentClip.projectId}/clips/${currentClip.id}/download?resolution=4k${channelParam}`;
    const cleanFilename = `${currentClip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_4k_short.mp4`;
    await downloadVerifiedVideoMp4(downloadUrl, cleanFilename);
  };

  // Direct SRT Subtitle Download
  const handleDownloadSRT = () => {
    const segs = currentClip.captions?.segments || [];
    let srtContent = '';

    segs.forEach((seg, idx) => {
      const formatTime = (sec: number) => {
        const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
        const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(sec % 60).toString().padStart(2, '0');
        const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
        return `${hrs}:${mins}:${secs},${ms}`;
      };

      srtContent += `${idx + 1}\n${formatTime(seg.startSec)} --> ${formatTime(seg.endSec)}\n${seg.text}\n\n`;
    });

    const blob = new Blob([srtContent || '1\n00:00:00,000 --> 00:00:05,000\n[Subtitles]'], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentClip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const segments = currentClip.captions?.segments || [];
  const activeSegment = segments.find(
    (seg) => currentTime >= seg.startSec && currentTime <= seg.endSec
  );

  const activeWordIdx = Array.isArray(activeSegment?.words)
    ? activeSegment.words.findIndex(
        (w) => currentTime >= w.startSec && currentTime <= w.endSec
      )
    : -1;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const headline =
    currentClip.overlays?.headlineText ||
    (currentClip.hookStatement?.slice(0, 42).toUpperCase() + ' 🤣') ||
    'WATCH UNTIL THE END 🤣';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative flex flex-col md:flex-row items-center gap-6 max-h-[96vh]">
        {/* Navigation Arrows for Multiple Shorts */}
        {clips.length > 1 && (
          <button
            onClick={handlePrev}
            className="hidden md:flex h-12 w-12 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 items-center justify-center shadow-xl hover:scale-110 transition-all"
            title="Previous Short Video"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Vertical Short Container (9:16) */}
        <div className="relative aspect-[9/16] h-[82vh] max-h-[780px] rounded-3xl overflow-hidden border-2 border-violet-500/40 bg-black shadow-[0_0_60px_rgba(139,92,246,0.4)] flex items-center justify-center group">
          {/* Ambient Blurred Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-55 pointer-events-none"
            style={{ backgroundImage: `url(${currentClip.thumbnailUrl})` }}
          />

          {/* Real HTML5 Video - Swappable between Fit (Ambient Blur) and Portrait */}
          <video
            ref={videoRef}
            src={currentClip.previewVideoUrl}
            poster={currentClip.thumbnailUrl}
            playsInline
            loop
            onClick={togglePlay}
            className={`absolute inset-0 w-full h-full transition-all duration-300 cursor-pointer ${
              framingMode === 'fit-blur' ? 'object-contain z-10' : 'object-cover z-10'
            }`}
          />

          {/* Top Control Bar */}
          <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-black text-cyan-300 border border-cyan-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                QA Score {currentClip.highlightScore}/100
              </span>
              <span className="rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                {currentIndex + 1} of {clips.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Framing Mode Toggle */}
              <button
                type="button"
                onClick={() => setFramingMode(framingMode === 'fit-blur' ? 'portrait' : 'fit-blur')}
                className={`h-8 px-2 rounded-full flex items-center gap-1 text-[10px] font-bold border backdrop-blur-md transition-all ${
                  framingMode === 'fit-blur'
                    ? 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300'
                    : 'bg-black/70 border-white/20 text-zinc-300'
                }`}
                title={
                  framingMode === 'fit-blur'
                    ? 'Face Fit: Ambient Blur (Zero Over-zoom)'
                    : 'Portrait Framing: Full Screen Crop'
                }
              >
                <Crop className="w-3.5 h-3.5 text-cyan-400" />
                <span>{framingMode === 'fit-blur' ? 'Fit' : 'Crop'}</span>
              </button>

              {/* Subtitles CC Toggle */}
              <button
                type="button"
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`h-8 w-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-transform hover:scale-110 ${
                  showSubtitles
                    ? 'bg-violet-600 border-violet-400 text-white'
                    : 'bg-black/80 border-white/20 text-zinc-400'
                }`}
                title={showSubtitles ? 'Subtitles ON (Click to Hide)' : 'Subtitles OFF (Click to Show)'}
              >
                <Subtitles className="w-4 h-4" />
              </button>

              {/* Language Switch */}
              {showSubtitles && (
                <button
                  type="button"
                  onClick={() => setSubtitleLang(subtitleLang === 'en' ? 'orig' : 'en')}
                  className="h-8 px-2 rounded-full bg-black/80 hover:bg-black text-cyan-300 flex items-center gap-1 border border-white/20 backdrop-blur-md text-[10px] font-mono font-bold"
                  title="Switch Subtitle Language (English / Spoken)"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{subtitleLang === 'en' ? 'EN' : 'ORIG'}</span>
                </button>
              )}

              {/* Watermark Shield Toggle */}
              <button
                type="button"
                onClick={() => setShieldWatermark(!shieldWatermark)}
                className={`h-8 w-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-transform hover:scale-110 ${
                  shieldWatermark
                    ? 'bg-emerald-600/90 border-emerald-400 text-white'
                    : 'bg-black/80 border-white/20 text-zinc-400'
                }`}
                title={
                  shieldWatermark
                    ? 'Watermark Shield Active: Masking YouTube Channel Logos'
                    : 'Turn on Watermark Shield'
                }
              >
                <Shield className="w-4 h-4" />
              </button>

              {/* ✨ AI Edit Pro Button */}
              {onOpenAIEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const c = clips[currentIndex];
                    onClose();
                    onOpenAIEdit(c);
                  }}
                  className="h-8 px-3 rounded-full bg-gradient-to-r from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] text-white flex items-center gap-1.5 text-xs font-black border border-white/20 backdrop-blur-md shadow-lg shadow-violet-500/30 transition-transform hover:scale-105"
                  title="Open DaVinci Resolve-style AI Edit Studio"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Edit Pro</span>
                </button>
              )}

              {/* Download MP4 */}
              <button
                type="button"
                onClick={handleDownloadMP4}
                className="h-8 w-8 rounded-full bg-black/80 hover:bg-black text-emerald-400 flex items-center justify-center border border-emerald-500/40 backdrop-blur-md transition-transform hover:scale-110"
                title="Download Short Video (MP4)"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Mute */}
              <button
                type="button"
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    video.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="h-8 w-8 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-transform hover:scale-110"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center border border-rose-400/40 backdrop-blur-md transition-transform hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Top Headline Banner - Catchy Big Letter Two-Tone Title (Matching User Screenshot) */}
          {(() => {
            const mainText = currentClip.overlays?.headlineHighlight ? currentClip.overlays.headlineText : splitHeadlineTwoTone(headline).main;
            const highlightText = currentClip.overlays?.headlineHighlight ? currentClip.overlays.headlineHighlight : splitHeadlineTwoTone(headline).highlight;
            const style = currentClip.overlays?.headlineStyle || 'yellow_white';
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
              <div className="absolute top-14 inset-x-3 text-center z-20 pointer-events-none">
                <div className="inline-block px-2 max-w-[98%] text-center">
                  <p className="font-black uppercase tracking-tight leading-snug flex flex-col items-center">
                    <span className="text-white text-base sm:text-lg md:text-xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:_0_2px_10px_rgba(0,0,0,1),_0_0_16px_rgba(0,0,0,0.9),_0_0_3px_rgba(0,0,0,1)]">
                      {mainText}
                    </span>
                    <span className={`${highlightColorClass} text-lg sm:text-xl md:text-2xl font-black mt-0.5 tracking-tight [text-shadow:_0_2px_10px_rgba(0,0,0,1),_0_0_16px_rgba(0,0,0,0.9),_0_0_3px_rgba(0,0,0,1)]`}>
                      {highlightText}
                    </span>
                  </p>
                </div>
              </div>
            );
          })()}

          {/* External YouTuber Channel Logo / Watermark Shield (Blurs Moving Channel Watermarks) */}
          {shieldWatermark && (
            <>
              {/* Active Frosted-Glass Dynamic Blur Overlay across Moving Watermark Zone */}
              <div
                className="absolute inset-x-0 bottom-[10%] h-[15%] pointer-events-none z-10 backdrop-blur-xl"
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
                  maskImage:
                    'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
                }}
              />
              <div className="absolute bottom-16 right-3 z-20 pointer-events-none">
                <div className="rounded-lg bg-black/85 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono font-bold text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xl">
                  <Shield className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Moving Logo Shield Active</span>
                </div>
              </div>
            </>
          )}

          {/* Active Word-by-Word Karaoke Subtitles (No Black Box, Direct on Video, Big Size) */}
          {showSubtitles && (
            <div className="absolute bottom-16 inset-x-4 text-center z-20 pointer-events-none">
              {activeSegment ? (
                <div className="inline-block px-3 py-1 max-w-[98%] text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-400/30 shadow-lg">
                      {subtitleLang === 'en' ? '🌐 English' : '🎙️ Spoken'}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wide leading-snug [text-shadow:_0_2px_10px_rgba(0,0,0,1),_0_0_16px_rgba(0,0,0,0.9),_0_0_4px_rgba(0,0,0,1)]">
                    {Array.isArray(activeSegment.words) && activeSegment.words.length > 0 ? (
                      activeSegment.words.map((w, idx) => {
                        const isActive = idx === activeWordIdx;
                        return (
                          <span
                            key={idx}
                            className={`inline-block mx-0.5 transition-all duration-100 ${
                              isActive
                                ? 'scale-125 text-yellow-300 font-extrabold drop-shadow-[0_0_14px_#FACC15] [text-shadow:_0_2px_8px_rgba(0,0,0,1),_0_0_16px_#FACC15]'
                                : w.highlight
                                ? 'text-cyan-300 font-black [text-shadow:_0_2px_8px_rgba(0,0,0,1)]'
                                : 'text-white font-black [text-shadow:_0_2px_8px_rgba(0,0,0,1)]'
                            }`}
                          >
                            {w.word}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-white font-black [text-shadow:_0_2px_8px_rgba(0,0,0,1)]">{activeSegment.text}</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="inline-block rounded-xl bg-black/40 px-3 py-1 text-xs text-zinc-300 font-mono backdrop-blur-sm border border-white/10">
                  ♪ [Situational Speech Audio Active]
                </div>
              )}
            </div>
          )}

          {/* Bottom CTA Overlay */}
          <div className="absolute bottom-8 inset-x-4 text-center z-20 pointer-events-none">
            <div className="inline-block rounded-lg bg-zinc-900/90 border border-zinc-700 px-3 py-1 text-[11px] font-bold text-cyan-300 shadow">
              🔥 Follow for Part {currentIndex + 1} • Daily Insights
            </div>
          </div>

          {/* Bottom Retention Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-zinc-900 z-30 pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-100 shadow-[0_0_10px_#22D3EE]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Pause overlay trigger */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
            >
              <div className="h-16 w-16 rounded-full bg-violet-600/90 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Next Arrow on Right */}
        {clips.length > 1 && (
          <button
            onClick={handleNext}
            className="hidden md:flex h-12 w-12 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 items-center justify-center shadow-xl hover:scale-110 transition-all"
            title="Next Short Video"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Sidebar Info & Action Panel */}
        <div className="hidden lg:flex flex-col justify-between w-80 h-[82vh] max-h-[780px] rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Short Video {currentIndex + 1} of {clips.length}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {currentClip.durationSec}s (&lt; 50s)
              </span>
            </div>

            <h3 className="text-sm font-bold text-white leading-snug">{currentClip.title}</h3>
            <p className="text-xs text-zinc-400 italic bg-black/40 p-3 rounded-xl border border-white/5">
              "{currentClip.hookStatement}"
            </p>

            {/* Quality & Audio Matching Details */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Situational Audio:</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  -14 LUFS Matched
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Face Framing:</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {framingMode === 'fit-blur' ? 'Smart Fit (No Zoom)' : 'Portrait Crop'}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Subtitles:</span>
                <span className="text-violet-300 font-mono font-bold">
                  {showSubtitles ? (subtitleLang === 'en' ? 'English (CC)' : 'Spoken (CC)') : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Quick Download Suite */}
            <div className="space-y-2">
              <span className="text-[11px] text-zinc-400 font-semibold block">Download Short & Assets:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadMP4}
                  className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSRT}
                  className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>Download .SRT</span>
                </button>
              </div>
            </div>

            {/* Switch Between Shorts */}
            <div className="space-y-2">
              <span className="text-[11px] text-zinc-400 font-semibold block">All Generated Shorts:</span>
              <div className="space-y-1.5">
                {clips.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between border ${
                      idx === currentIndex
                        ? 'bg-violet-600/30 border-violet-500 text-white font-bold'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="truncate max-w-[180px]">Short #{idx + 1}: {c.title}</span>
                    <span className="text-[10px] font-mono shrink-0">{c.durationSec}s</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <Link
              href={`/projects/${projectId}/clips/${currentClip.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-lg hover:opacity-95 transition-opacity"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Open in Full Studio Editor</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
