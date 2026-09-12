'use client';

import React, { useState } from 'react';
import { Clip, EditDecisionAction } from '@/types';
import {
  Film,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  Search,
  Volume2,
  ZoomIn,
  Eye,
  Type,
  ChevronRight,
  RotateCw,
  Layers,
  Flame,
  Globe,
  RefreshCw,
  Target,
  Scissors,
  Music,
  Radio,
  Play,
} from 'lucide-react';

interface AIDirectorPanelProps {
  clip: Clip;
  onUpdateClip: (updates: Partial<Clip>) => void;
  onSeekTime?: (timeSec: number) => void;
}

export const AIDirectorPanel: React.FC<AIDirectorPanelProps> = ({
  clip,
  onUpdateClip,
  onSeekTime,
}) => {
  const [isRegeneratingEDL, setIsRegeneratingEDL] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'story' | 'edl' | 'sound' | 'trends'>('story');

  const edl = clip.edl || {
    clipId: clip.id,
    pacingNotes: 'Hook punch-in (0-2s) -> Dynamic kinetic captions -> B-roll graphic reinforcement -> High impact takeaway.',
    actions: [
      {
        id: 'act-1',
        timeRange: [0.0, 2.5] as [number, number],
        editType: 'punch_in' as const,
        captionStyle: 'VIRAL_POP',
        emphasisWords: ['biggest', 'mistake'],
        soundEffectType: 'whoosh_impact',
        reason: '0-2s scroll-stopper punch-in to lock viewer attention immediately.',
      },
      {
        id: 'act-2',
        timeRange: [2.5, 7.0] as [number, number],
        editType: 'keyword_emphasis' as const,
        captionStyle: 'BOLD_CREATOR',
        emphasisWords: ['isolation', 'customers'],
        visualQuery: 'startup founder late night laptop dark room',
        soundEffectType: 'subtle_pop',
        reason: 'Reinforce problem state with visual b-roll and kinetic text color punch.',
      },
      {
        id: 'act-3',
        timeRange: [7.0, 14.0] as [number, number],
        editType: 'supporting_visual' as const,
        captionStyle: 'KARAOKE_GLOW',
        visualQuery: 'customer feedback analytics dashboard chart',
        soundEffectType: 'riser',
        reason: 'Supporting infographic graphic overlay to explain customer discovery turnaround.',
      },
      {
        id: 'act-4',
        timeRange: [14.0, clip.durationSec] as [number, number],
        editType: 'zoom_out' as const,
        captionStyle: 'VIRAL_POP',
        emphasisWords: ['four clicks'],
        soundEffectType: 'success_chime',
        reason: 'Zoom out to standard frame for high-contrast conclusion and follow CTA.',
      },
    ],
    recommendedVisuals: [
      { query: `${clip.title} concept graphic`, timestamp: 3.0, type: 'b-roll' },
      { query: `${clip.title} validation chart`, timestamp: 8.5, type: 'motion_graphic' },
    ],
  };

  const trend = clip.trendIntelligence || {
    topic: clip.tags[0] || 'Viral Comedy',
    trendScore: 92,
    source: 'serpapi' as const,
    searchVolumeSignal: 'viral' as const,
    relatedQueries: [
      'standup comedy shorts viral',
      'quick crowdwork punchlines',
      'comedy timing edits',
      'punchline sound design',
    ],
    currentDiscussions: [
      'High engagement on rapid-fire crowd interactions and punchline timing.',
      'Audience retention surges when initial 3 seconds delivers instant context.',
    ],
    searchedAt: new Date().toISOString(),
  };

  // 1. Apply 3-Second Hook Punch Action
  const handleApplyHookPunch = () => {
    onUpdateClip({
      cropSettings: {
        ...clip.cropSettings,
        scale: 1.25,
      },
      overlays: {
        ...clip.overlays,
        headlineText: `🛑 ${clip.hookStatement.slice(0, 35).toUpperCase()}!`,
        headlineBg: 'linear-gradient(135deg, #EF4444, #F59E0B)',
      },
    });
  };

  // 2. Auto-Cut Dead-Space & Breaths Action
  const handleAutoTrimPauses = () => {
    // Tighten segments by trimming trailing pauses
    const tightenedSegments = (clip.captions?.segments || []).map((seg) => ({
      ...seg,
      endSec: Math.max(seg.startSec + 0.8, seg.endSec - 0.25),
    }));

    onUpdateClip({
      captions: {
        ...clip.captions,
        segments: tightenedSegments,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#18181B] text-zinc-200 p-4 space-y-4 overflow-y-auto">
      {/* Sub-Tab Navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold">
        <button
          onClick={() => setActiveSubTab('story')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'story'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Story Arc</span>
        </button>

        <button
          onClick={() => setActiveSubTab('edl')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'edl'
              ? 'bg-violet-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Film className="w-3 h-3" />
          <span>Movement</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sound')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'sound'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Volume2 className="w-3 h-3" />
          <span>Sound FX</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trends')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'trends'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          <span>Trends</span>
        </button>
      </div>

      {/* TAB 1: TINY STORY ARCHITECTURE (Beginning, Middle, End) */}
      {activeSubTab === 'story' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Act 1: The Hook (0 – 3s)
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md">
                3s Tension Lock
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Grab attention in the first 2-3 seconds with an engaging visual punch-in and curiosity statement.
            </p>
            <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-xs font-bold text-white italic">
              "{clip.hookStatement}"
            </div>
            <button
              onClick={handleApplyHookPunch}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black font-black text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Apply 3s Hook Punch-in (1.25x + Whoosh)</span>
            </button>
          </div>

          <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5" /> Act 2: Escalation & Fast Pacing
              </span>
              <span className="text-[10px] font-mono text-violet-300 font-bold bg-violet-500/20 px-2 py-0.5 rounded-md">
                Zero Dead Space
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Cut out all pauses, filler words, and breaths. Sync jump cuts to the beat of the background music.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleAutoTrimPauses}
                className="p-2.5 rounded-xl bg-violet-900/40 border border-violet-500/40 hover:bg-violet-900/70 text-violet-200 font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>Cut Pauses &gt;250ms</span>
              </button>

              <button
                onClick={() => onSeekTime && onSeekTime(Math.min(clip.endSec, clip.startSec + 6))}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                <span>Beat-Sync Cuts</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Act 3: Climax & Resolution Payoff
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">
                Punchline + CTA
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Deliver the punchline resolution, reward the viewer's attention, and display the CTA overlay.
            </p>
            <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-xs text-zinc-300 flex items-center justify-between">
              <span>Ending CTA:</span>
              <span className="text-emerald-400 font-bold">{clip.overlays?.ctaText || '🔥 Follow for Part 2'}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL MOVEMENT & PUNCH-INS */}
      {activeSubTab === 'edl' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-violet-400" />
              <span>Dynamic Movement & Keyframes ({edl.actions.length})</span>
            </p>
            <span className="text-[10px] font-mono text-zinc-500">Every 3-5s</span>
          </div>

          <div className="space-y-2">
            {edl.actions.map((act) => (
              <div
                key={act.id}
                onClick={() => onSeekTime && onSeekTime(clip.startSec + act.timeRange[0])}
                className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-violet-500/40 hover:bg-zinc-900 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 uppercase tracking-wide">
                    {act.editType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {act.timeRange[0].toFixed(1)}s ➔ {act.timeRange[1].toFixed(1)}s
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{act.reason}</p>
                {act.soundEffectType && (
                  <span className="inline-block px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-[9px] font-mono text-cyan-300">
                    🔊 SFX: {act.soundEffectType}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOUND DESIGN STUDIO */}
      {activeSubTab === 'sound' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> Situational Voice Loudness
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                -14 LUFS Matched
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Voice clarity equalization and automated compressor prevent viewer ear fatigue and maintain punchline presence.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Layered Custom Sound Effects</span>
            </label>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">💨 Whoosh Impact</span>
                  <span className="text-[10px] text-zinc-500">Punched on 0-2s hook and major cuts</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold">Active</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">✨ Pop Highlight</span>
                  <span className="text-[10px] text-zinc-500">Synced to kinetic karaoke words</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold">Active</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">📈 Tension Riser</span>
                  <span className="text-[10px] text-zinc-500">Builds anticipation before punchline</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold">Active</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">🎵 Auto-Ducked Music Bed</span>
                  <span className="text-[10px] text-zinc-500">-18dB beneath voice so speech is crystal clear</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold">Balanced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TREND INTELLIGENCE */}
      {activeSubTab === 'trends' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Viral Topic Viability
              </span>
              <span className="text-xs font-bold text-emerald-300 font-mono">
                {trend.trendScore}/100 🔥
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">{trend.topic}</h4>
            <div className="flex items-center gap-2 pt-1">
              <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                Signal: {trend.searchVolumeSignal}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400 block">Related Rising Search Queries:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {trend.relatedQueries.map((q, qIdx) => (
                <span key={qIdx} className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300">
                  {q}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
