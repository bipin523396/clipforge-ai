'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Clip } from '@/types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  RotateCcw,
  Sparkles,
  Download,
  Shield,
  Subtitles,
  Languages,
  Eye,
  EyeOff,
  Crop,
} from 'lucide-react';
import { downloadVerifiedVideoMp4, splitHeadlineTwoTone } from '@/lib/client-download';

interface InlineClipPlayerProps {
  clip: Clip;
  onClose: () => void;
  onOpenModal?: () => void;
  onOpenAIEdit?: () => void;
}

export const InlineClipPlayer: React.FC<InlineClipPlayerProps> = ({
  clip,
  onClose,
  onOpenModal,
  onOpenAIEdit,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(clip.durationSec || 30);
  const [showControls, setShowControls] = useState(true);

  // User Features Requested:
  // 1. Face Zoom Fix: Smart Fit with Ambient Blur (no over-zoom) vs Portrait Crop
  const [framingMode, setFramingMode] = useState<'fit-blur' | 'portrait'>('fit-blur');

  // 2. Subtitle Controls: CC On/Off + Language Switcher
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState<'en' | 'orig'>('en');

  // 3. YouTube Channel Logo / Watermark Shield
  const [shieldWatermark, setShieldWatermark] = useState(true);

  // Sync real video playback and timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

    // Auto-play on mount
    video.play().catch((err) => {
      console.warn('[Inline Autoplay]:', err.message);
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Play/Pause toggle
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Mute toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Restart
  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
    setIsPlaying(true);
  };

  // Direct Verified MP4 Download (4K Ultra-HD)
  const handleDownloadMP4 = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const channelParam = clip.overlays?.channelName ? `&channelName=${encodeURIComponent(clip.overlays.channelName)}` : '';
    const downloadUrl = `/api/projects/${clip.projectId}/clips/${clip.id}/download?resolution=4k${channelParam}`;
    const cleanFilename = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_4k_short.mp4`;
    await downloadVerifiedVideoMp4(downloadUrl, cleanFilename);
  };

  // Direct SRT Subtitle Download
  const handleDownloadSRT = (e: React.MouseEvent) => {
    e.stopPropagation();
    const segs = clip.captions?.segments || [];
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
    a.download = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Active caption segment & word calculation
  const segments = clip.captions?.segments || [];
  const activeSegment = segments.find(
    (seg) => currentTime >= seg.startSec && currentTime <= seg.endSec
  );

  const activeWordIdx = Array.isArray(activeSegment?.words)
    ? activeSegment.words.findIndex(
        (w) => currentTime >= w.startSec && currentTime <= w.endSec
      )
    : -1;

  const clipProgress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const headline =
    clip.overlays?.headlineText ||
    (clip.hookStatement?.slice(0, 38).toUpperCase() + ' 🤣') ||
    'WATCH UNTIL THE END 🤣';

  return (
    <div
      className="relative aspect-[9/12] w-full overflow-hidden bg-black border-b border-zinc-800 select-none group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      {/* Dynamic Ambient Blurred Backdrop (Provides depth & fixes framing) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-55 pointer-events-none"
        style={{ backgroundImage: `url(${clip.thumbnailUrl})` }}
      />

      {/* Real HTML5 Video - Swappable between Fit (Ambient Blur) and Portrait */}
      <video
        ref={videoRef}
        src={clip.previewVideoUrl}
        poster={clip.thumbnailUrl}
        playsInline
        className={`absolute inset-0 w-full h-full transition-all duration-300 ${
          framingMode === 'fit-blur' ? 'object-contain z-10' : 'object-cover z-10'
        }`}
      />

      {/* Top Floating Action Bar */}
      <div className="absolute top-2 inset-x-2 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white shadow-lg border border-violet-400/40">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
            Playing
          </span>
          <span className="rounded-md bg-black/75 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono text-zinc-300 border border-white/10">
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1">
          {/* Framing Mode Toggle (Fixes Face Zoom) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFramingMode(framingMode === 'fit-blur' ? 'portrait' : 'fit-blur');
            }}
            className={`h-7 px-1.5 rounded-lg flex items-center gap-1 text-[9px] font-bold border backdrop-blur-md transition-all ${
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
            <Crop className="w-3 h-3 text-cyan-400" />
            <span>{framingMode === 'fit-blur' ? 'Fit' : 'Crop'}</span>
          </button>

          {/* Subtitles CC Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSubtitles(!showSubtitles);
            }}
            className={`h-7 w-7 rounded-lg flex items-center justify-center border backdrop-blur-md transition-transform hover:scale-105 ${
              showSubtitles
                ? 'bg-violet-600 border-violet-400 text-white'
                : 'bg-black/70 border-white/20 text-zinc-400'
            }`}
            title={showSubtitles ? 'Turn Subtitles OFF' : 'Turn Subtitles ON (CC)'}
          >
            <Subtitles className="w-3.5 h-3.5" />
          </button>

          {/* Subtitle Language Switcher */}
          {showSubtitles && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSubtitleLang(subtitleLang === 'en' ? 'orig' : 'en');
              }}
              className="h-7 px-1.5 rounded-lg bg-black/80 hover:bg-black text-cyan-300 flex items-center gap-1 border border-white/20 backdrop-blur-md text-[9px] font-mono font-bold"
              title="Switch Subtitle Language (English / Spoken)"
            >
              <Languages className="w-3 h-3" />
              <span>{subtitleLang === 'en' ? 'EN' : 'ORIG'}</span>
            </button>
          )}

          {/* Watermark / Channel Logo Shield Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShieldWatermark(!shieldWatermark);
            }}
            className={`h-7 w-7 rounded-lg flex items-center justify-center border backdrop-blur-md transition-transform hover:scale-105 ${
              shieldWatermark
                ? 'bg-emerald-600/90 border-emerald-400 text-white'
                : 'bg-black/70 border-white/20 text-zinc-400'
            }`}
            title={
              shieldWatermark
                ? 'Watermark Shield Active: Masking YouTube Channel Logos'
                : 'Turn on Watermark Shield'
            }
          >
            <Shield className="w-3.5 h-3.5" />
          </button>

          {/* AI Edit Studio Button */}
          {onOpenAIEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAIEdit();
              }}
              className="h-7 px-2 rounded-lg bg-gradient-to-r from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] text-white flex items-center gap-1 text-[10px] font-black border border-white/20 backdrop-blur-md transition-transform hover:scale-105"
              title="Open DaVinci Resolve-style AI Edit Studio"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Edit</span>
            </button>
          )}

          {/* Direct MP4 Download */}
          <button
            type="button"
            onClick={handleDownloadMP4}
            className="h-7 w-7 rounded-lg bg-black/80 hover:bg-black text-emerald-300 flex items-center justify-center border border-emerald-400/40 backdrop-blur-md transition-transform hover:scale-105"
            title="Download Short Video (MP4)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="h-7 w-7 rounded-lg bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-transform hover:scale-105"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="h-7 w-7 rounded-lg bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-transform hover:scale-105"
            title="Replay from start"
          >
            <RotateCcw className="w-3 h-3 text-zinc-300" />
          </button>

          {/* Expand Modal */}
          {onOpenModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal();
              }}
              className="h-7 w-7 rounded-lg bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-transform hover:scale-105"
              title="Full-Screen Quick Watch"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          )}

          {/* Close Inline Player */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-7 w-7 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center border border-rose-400/40 backdrop-blur-md transition-transform hover:scale-105"
            title="Close Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Headline Hook Banner Overlay - Catchy Big Letter Two-Tone Title (No Black Box, Direct on Video, Big Size) */}
      {(() => {
        const mainText = clip.overlays?.headlineHighlight ? clip.overlays.headlineText : splitHeadlineTwoTone(headline).main;
        const highlightText = clip.overlays?.headlineHighlight ? clip.overlays.headlineHighlight : splitHeadlineTwoTone(headline).highlight;
        const style = clip.overlays?.headlineStyle || 'yellow_white';
        const highlightColorClass = style === 'fire_orange'
          ? 'text-orange-400 drop-shadow-[0_0_14px_rgba(251,146,60,0.95)]'
          : style === 'neon_cyan'
          ? 'text-cyan-400 drop-shadow-[0_0_14px_rgba(34,211,238,0.95)]'
          : 'text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.95)]';

        return (
          <div className="absolute top-12 inset-x-2 text-center z-20 pointer-events-none">
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

      {/* External YouTuber Channel Logo / Watermark Shield (Eliminates Moving Channel Watermarks) */}
      {shieldWatermark && (
        <>
          {/* Active Frosted-Glass Dynamic Blur Overlay across Moving Watermark Zone (Y=78%..93%) */}
          <div
            className="absolute inset-x-0 bottom-[6%] h-[15%] pointer-events-none z-10 backdrop-blur-xl"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
            }}
          />
          <div className="absolute bottom-10 right-2 z-20 pointer-events-none">
            <div className="rounded-lg bg-black/80 backdrop-blur-md px-2 py-0.5 text-[8px] font-mono font-bold text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-lg">
              <Shield className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>Moving Logo Shield Active</span>
            </div>
          </div>
        </>
      )}

      {/* Word-by-Word Animated Karaoke Caption Track (No Black Box, Direct on Video, Big Size) */}
      {showSubtitles && (
        <div className="absolute bottom-8 inset-x-2 text-center z-20 pointer-events-none">
          {activeSegment ? (
            <div className="inline-block px-3 py-1 max-w-[98%] text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-400/30 shadow-lg">
                  {subtitleLang === 'en' ? '🌐 English' : '🎙️ Spoken'}
                </span>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wide leading-snug [text-shadow:_0_2px_10px_rgba(0,0,0,1),_0_0_16px_rgba(0,0,0,0.9),_0_0_4px_rgba(0,0,0,1)]">
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
            <div className="inline-block rounded-xl bg-black/40 px-2.5 py-1 text-[10px] text-zinc-300 backdrop-blur-sm border border-white/10 font-mono">
              ♪ [Speech & Audio Track Active]
            </div>
          )}
        </div>
      )}

      {/* Center Floating Play/Pause Status Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
          <div className="h-14 w-14 rounded-full bg-violet-600/90 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-pulse">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Retention Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-900 z-30 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-100 shadow-[0_0_8px_#22D3EE]"
          style={{ width: `${clipProgress}%` }}
        />
      </div>
    </div>
  );
};
