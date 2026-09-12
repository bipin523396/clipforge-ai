'use client';

import React, { useState } from 'react';
import { Clip } from '@/types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Scissors,
  Volume2,
  Video,
  Type,
  Sparkles,
  Sliders,
  Zap,
  Flame,
  Target,
  Music,
  HelpCircle,
} from 'lucide-react';

interface TimelineScrubberProps {
  clip: Clip;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onTrimChange?: (startSec: number, endSec: number) => void;
  onSplitAtPlayhead?: (timeSec: number) => void;
  onAutoCutDeadSpace?: () => void;
  onApplyHookPunch?: () => void;
  onOpenShortcuts?: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  clip,
  currentTime,
  isPlaying,
  onSeek,
  onTogglePlay,
  onTrimChange,
  onSplitAtPlayhead,
  onAutoCutDeadSpace,
  onApplyHookPunch,
  onOpenShortcuts,
}) => {
  const duration = Math.max(1, clip.durationSec || 16.5);
  const relativeTime = Math.max(0, Math.min(duration, currentTime - clip.startSec));
  const playheadPercent = Math.max(0, Math.min(100, (relativeTime / duration) * 100));

  const [trimStart, setTrimStart] = useState(clip.startSec);
  const [trimEnd, setTrimEnd] = useState(clip.endSec);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const newRelativeTime = clickRatio * duration;
    onSeek(clip.startSec + newRelativeTime);
  };

  const handleSetInPoint = () => {
    setTrimStart(currentTime);
    if (onTrimChange) onTrimChange(currentTime, trimEnd);
  };

  const handleSetOutPoint = () => {
    setTrimEnd(currentTime);
    if (onTrimChange) onTrimChange(trimStart, currentTime);
  };

  // 3-Act Tiny Story Milestones
  const hookEndSec = Math.min(3.0, duration * 0.2);
  const escalationEndSec = duration * 0.78;
  const hookPct = (hookEndSec / duration) * 100;
  const escalationPct = ((escalationEndSec - hookEndSec) / duration) * 100;
  const payoffPct = 100 - hookPct - escalationPct;

  return (
    <div className="border-t border-zinc-800 bg-[#121215] p-4 select-none space-y-3">
      {/* 1. 3-Act Tiny Story Architecture Bar (Hook ➔ Escalation ➔ Payoff) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <strong className="text-white">Tiny Story Architecture</strong> (Beginning, Middle & End)
          </span>
          <span className="text-cyan-400 font-bold text-[10px]">
            {relativeTime <= hookEndSec
              ? '⚡ Act 1: The Hook (0-3s)'
              : relativeTime <= escalationEndSec
              ? '🔥 Act 2: Escalation & Conflict'
              : '🎯 Act 3: Climax & Resolution Payoff'}
          </span>
        </div>

        <div className="h-4 w-full rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex font-mono text-[9px] font-bold">
          {/* Act 1: The Hook */}
          <div
            className="h-full bg-amber-500/20 text-amber-300 border-r border-amber-500/40 flex items-center justify-center px-1 truncate cursor-pointer hover:bg-amber-500/30 transition-colors"
            style={{ width: `${hookPct}%` }}
            onClick={() => onSeek(clip.startSec)}
            title="Act 1: The Hook (0-3s) — Scroll-stopping visual entrance & statement"
          >
            ⚡ Act 1: The Hook (0-3s)
          </div>

          {/* Act 2: Escalation & Fast Pacing */}
          <div
            className="h-full bg-violet-500/20 text-violet-300 border-r border-violet-500/40 flex items-center justify-center px-1 truncate cursor-pointer hover:bg-violet-500/30 transition-colors"
            style={{ width: `${escalationPct}%` }}
            onClick={() => onSeek(clip.startSec + hookEndSec)}
            title="Act 2: Escalation & Conflict — Fast pacing, no dead space, dynamic movement"
          >
            🔥 Act 2: Escalation & Pacing
          </div>

          {/* Act 3: Payoff & Resolution */}
          <div
            className="h-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center px-1 truncate cursor-pointer hover:bg-emerald-500/30 transition-colors"
            style={{ width: `${payoffPct}%` }}
            onClick={() => onSeek(clip.startSec + escalationEndSec)}
            title="Act 3: Payoff & Resolution — High-impact punchline and follow CTA"
          >
            🎯 Act 3: Payoff
          </div>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        {/* Playhead Timecode & Trim Display */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-black text-sm">{relativeTime.toFixed(1)}s</span>
            <span className="text-zinc-500 text-xs">/ {duration.toFixed(1)}s</span>
          </div>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
            Source: {clip.startSec.toFixed(1)}s ➔ {clip.endSec.toFixed(1)}s
          </span>
        </div>

        {/* Center Playback Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSeek(Math.max(clip.startSec, currentTime - 1))}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Step Back 1s (J)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onTogglePlay}
            className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => onSeek(Math.min(clip.endSec, currentTime + 1))}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Step Forward 1s (L)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSeek(clip.startSec)}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 ml-0.5"
            title="Reset to Start (0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pro Editing Action Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Split / Cut at Playhead */}
          <button
            onClick={() => onSplitAtPlayhead && onSplitAtPlayhead(currentTime)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white hover:border-cyan-500/50 hover:bg-zinc-800 transition-all"
            title="Split / Cut at Playhead (C)"
          >
            <Scissors className="w-3 h-3 text-cyan-400" />
            <span>Split (C)</span>
          </button>

          {/* Auto-Cut Dead Space & Breaths */}
          <button
            onClick={onAutoCutDeadSpace}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-950/40 border border-violet-500/40 text-[11px] font-mono text-violet-300 hover:bg-violet-900/50 transition-all"
            title="Auto-Cut Pauses & Breaths >250ms (B)"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-current" />
            <span>Cut Pauses (B)</span>
          </button>

          {/* Apply Hook Punch-in */}
          <button
            onClick={onApplyHookPunch}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] font-mono text-amber-300 hover:bg-amber-900/50 transition-all"
            title="Apply 3s Hook Punch-in (H)"
          >
            <Target className="w-3 h-3 text-amber-400" />
            <span>Hook Punch (H)</span>
          </button>

          {/* Keyboard Shortcuts Guide */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              title="Keyboard Shortcuts Cheat Sheet (?)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          {/* Trim In/Out */}
          <button
            onClick={handleSetInPoint}
            className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-white"
            title="Set In Point (I)"
          >
            [ In
          </button>
          <button
            onClick={handleSetOutPoint}
            className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-white"
            title="Set Out Point (O)"
          >
            Out ]
          </button>
        </div>
      </div>

      {/* Main Multi-Track Non-Destructive Timeline Viewport */}
      <div className="space-y-1.5">
        {/* Track 1: EDL & Visual Movement Track */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className="w-20 flex items-center gap-1 text-purple-400 shrink-0">
            <Sparkles className="w-3 h-3" /> Movement
          </span>
          <div
            onClick={handleTimelineClick}
            className="relative h-4 flex-1 bg-zinc-950 border border-zinc-900 rounded overflow-hidden cursor-pointer flex items-center"
          >
            {clip.edl?.actions.map((act, aIdx) => {
              const startRel = Math.max(0, act.timeRange[0]);
              const endRel = Math.min(duration, act.timeRange[1]);
              const leftPct = (startRel / duration) * 100;
              const widthPct = Math.max(3, ((endRel - startRel) / duration) * 100);
              return (
                <div
                  key={aIdx}
                  className="absolute h-full rounded text-[8px] font-bold px-1 flex items-center bg-purple-500/20 text-purple-300 border-x border-purple-500/40 truncate"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                >
                  {act.editType.replace('_', ' ')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: Dynamic Captions Track */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className="w-20 flex items-center gap-1 text-yellow-400 shrink-0">
            <Type className="w-3 h-3" /> Subtitles
          </span>
          <div
            onClick={handleTimelineClick}
            className="relative h-5 flex-1 bg-zinc-950 border border-zinc-900 rounded overflow-hidden cursor-pointer flex items-center"
          >
            {clip.captions.segments.map((seg, i) => {
              const segStartRel = Math.max(0, seg.startSec);
              const segEndRel = Math.min(duration, seg.endSec);
              const leftPct = (segStartRel / duration) * 100;
              const widthPct = Math.max(2, ((segEndRel - segStartRel) / duration) * 100);
              return (
                <div
                  key={i}
                  className="absolute h-full rounded text-[9px] px-1.5 flex items-center bg-yellow-500/15 text-yellow-300 border-x border-yellow-500/30 truncate"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                >
                  {seg.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 3: Video & Audio Waveform Track with Playhead & Beat-Sync */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className="w-20 flex items-center gap-1 text-cyan-400 shrink-0">
            <Video className="w-3 h-3" /> Waveform
          </span>
          <div
            onClick={handleTimelineClick}
            className="relative h-8 flex-1 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden cursor-pointer flex items-center"
          >
            {/* Beat Sync Markers (Every 0.47s = 128 BPM) */}
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-35 pointer-events-none">
              {Array.from({ length: 48 }).map((_, i) => {
                const heightPct = 20 + Math.sin(i * 0.4) * 35 + ((i % 5) * 8);
                const isBeat = i % 4 === 0;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full ${isBeat ? 'bg-amber-400' : 'bg-cyan-400'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                );
              })}
            </div>

            {/* Playhead Needle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-300 to-violet-500 z-30 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-75"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full bg-cyan-300 shadow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
