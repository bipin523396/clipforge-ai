'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Layers,
  ZoomIn,
  Image as ImageIcon,
  Type,
  Sliders,
  CheckSquare,
  Square,
  ShieldCheck,
  Download,
  Flame,
  Zap,
  Film,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Radio,
  BookOpen,
  Target,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { Clip } from '@/types';
import {
  AIEditPlan,
  AIEditScene,
  StoryRole,
  VisualHierarchyTier,
  MultiVersionAIEditResponse,
} from '@/lib/server/ai-edit-planner';
import { YouTubeProIcon } from '@/components/brand-logo';

interface AIEditProModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: Clip;
  projectId: string;
  sourceVideoPath?: string;
  onApplyEdit?: (updatedClip: Clip) => void;
}

export const AIEditProModal: React.FC<AIEditProModalProps> = ({
  isOpen,
  onClose,
  clip,
  projectId,
  onApplyEdit,
}) => {
  // Multi-Version State
  const [versions, setVersions] = useState<MultiVersionAIEditResponse['versions'] | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<'maximum_viral' | 'professional' | 'story_arc'>('professional');
  const [storyArcBreakdown, setStoryArcBreakdown] = useState<MultiVersionAIEditResponse['storyArcBreakdown'] | null>(null);

  const [plan, setPlan] = useState<AIEditPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'story_arc' | 'inspector'>('controls');

  // Playhead & Scrubber State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // AI Editing Controls Toggles
  const [autoBroll, setAutoBroll] = useState(true);
  const [webImages, setWebImages] = useState(true);
  const [aiVisuals, setAiVisuals] = useState(true);
  const [sceneChanges, setSceneChanges] = useState(true);
  const [zoomPunchIn, setZoomPunchIn] = useState(true);

  const [animatedCaptions, setAnimatedCaptions] = useState(true);
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  const [proTypography, setProTypography] = useState(true);

  const [originalAudio, setOriginalAudio] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [autoDucking, setAutoDucking] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Render state
  const [isRendering, setIsRendering] = useState(false);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [renderSuccessMsg, setRenderSuccessMsg] = useState<string | null>(null);

  // Fetch 3-Version Story Edit Plans on open
  useEffect(() => {
    if (!isOpen || !clip) return;

    const fetchPlans = async () => {
      setLoadingPlan(true);
      try {
        const res = await fetch('/api/ai-edit/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clipId: clip.id,
            title: clip.title,
            hookStatement: clip.hookStatement,
            startSec: clip.startSec || 0,
            endSec: clip.endSec || 30,
            segments: clip.captions?.segments || [],
          }),
        });
        const data = await res.json();
        if (data.success && data.versions) {
          setVersions(data.versions);
          setStoryArcBreakdown(data.storyArcBreakdown || null);
          setPlan(data.versions[selectedVersion] || data.plan);
        }
      } catch (err) {
        console.warn('[Fetch AI Edit Plan Error]:', err);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlans();
  }, [isOpen, clip]);

  // Sync plan when version changes
  const handleSelectVersion = (version: 'maximum_viral' | 'professional' | 'story_arc') => {
    setSelectedVersion(version);
    if (versions && versions[version]) {
      setPlan(versions[version]);
    }
  };

  // Video playback loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const duration = clip.durationSec || 30;
          if (prev >= duration) {
            return 0; // loop back
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, clip]);

  if (!isOpen) return null;

  const clipDuration = clip.durationSec || 30;

  // Find active scene at current playhead timestamp
  const activeScene = plan?.scenes.find(
    (s) => currentTime >= s.startSec && currentTime < s.endSec
  ) || plan?.scenes[0];

  // Trigger Full AI Edit Render for the selected version
  const handleGenerateAIEdit = async () => {
    if (!plan) return;
    setIsRendering(true);
    setRenderSuccessMsg(null);

    try {
      const res = await fetch('/api/ai-edit/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          clipId: clip.id,
          plan,
          startSec: clip.startSec || 0,
          endSec: clip.endSec || 30,
          originalAudioVolume: originalAudio ? 100 : 0,
          bgMusicVolume: backgroundMusic ? (activeScene?.musicLevelPct || 15) : 0,
          autoDucking,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setRenderedUrl(data.result.videoUrl);
        setRenderSuccessMsg(`✨ ${plan.versionLabel} Rendered & Synchronized!`);
        if (onApplyEdit) {
          onApplyEdit({
            ...clip,
            videoUrl: data.result.videoUrl,
          });
        }
      } else {
        alert(data.error || 'AI Edit rendering failed');
      }
    } catch (err: any) {
      alert(err.message || 'Render request failed');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-[1440px] h-[95vh] rounded-2xl bg-[#09080E] border border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white font-sans">
        
        {/* TOP BAR: DaVinci Studio + Story-Aware Intelligence Engine */}
        <div className="h-14 border-b border-zinc-800/90 px-5 flex items-center justify-between bg-zinc-950/90 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <YouTubeProIcon className="w-6 h-6" />
              <span className="font-black tracking-wider text-sm flex items-center gap-1.5">
                <span>AI EDIT PRO STUDIO</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gradient-to-r from-violet-600/30 to-cyan-500/30 border border-violet-500/40 text-cyan-300">
                  Story Brain v2.0
                </span>
              </span>
            </div>

            <div className="h-4 w-[1px] bg-zinc-800 mx-1 hidden sm:block" />

            <span className="text-xs font-semibold text-zinc-400 truncate max-w-[240px] hidden md:block">
              {clip.title}
            </span>
          </div>

          {/* Center: 3-VERSION SELECTOR PILLS */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            {[
              { id: 'maximum_viral', label: '⚡ Max Viral', desc: '1.5-2.5s Pacing' },
              { id: 'professional', label: '💼 Professional', desc: 'YouTube Standard' },
              { id: 'story_arc', label: '🎥 Story Arc', desc: 'Cinematic Flow' },
            ].map((v) => {
              const isSel = selectedVersion === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectVersion(v.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSel
                      ? 'bg-gradient-to-r from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] text-white shadow-md shadow-violet-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                  title={v.desc}
                >
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {renderedUrl && (
              <a
                href={renderedUrl}
                download={`${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}_ai_pro.mp4`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
            )}

            <button
              onClick={handleGenerateAIEdit}
              disabled={isRendering}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isRendering ? 'animate-spin' : ''}`} />
              <span>{isRendering ? 'Rendering...' : '✨ Generate AI Edit'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              title="Close AI Edit Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VERSION SUB-HEADER BANNER */}
        <div className="px-5 py-2 bg-gradient-to-r from-violet-950/30 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">{plan?.versionLabel}</span>
            <span className="text-zinc-400 hidden sm:inline">• {plan?.versionDescription}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-zinc-500">Edit Frequency:</span>
            <span className="text-cyan-300 font-bold">{plan?.summary.selectivePacingRatio}</span>
            <span className="text-zinc-500 hidden md:inline">({plan?.summary.averagePacingSec})</span>
          </div>
        </div>

        {/* MAIN WORKSPACE: 2-COLUMN GRID (TIMELINE & PREVIEW on left, STORY DRAWER on right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT 8 COLS: PREVIEW CANVAS & DAVINCI MULTI-TRACK TIMELINE */}
          <div className="lg:col-span-8 flex flex-col border-r border-zinc-800/80 bg-[#07060A] overflow-hidden">
            
            {/* 1. TOP HALF: VIDEO PREVIEW CANVAS */}
            <div className="flex-1 relative flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 overflow-hidden">
              {/* 9:16 Vertical Video Frame with Dynamic Zoom / Punch-in / B-roll Simulation */}
              <div className="relative aspect-[9/16] h-full max-h-[44vh] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black flex items-center justify-center group/player">
                
                {/* Source or Rendered Video */}
                <video
                  ref={videoRef}
                  src={renderedUrl || clip.videoUrl}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    activeScene?.visualAction === 'punch_in' && zoomPunchIn ? 'scale-125' : 'scale-100'
                  }`}
                  muted={!originalAudio}
                  playsInline
                />

                {/* B-Roll / Web Visual Overlay (Tier 3 Stock / Web Asset) */}
                {activeScene?.visualAction === 'broll_cut' && autoBroll && activeScene.brollUrl && (
                  <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 animate-in fade-in duration-200">
                    <img
                      src={activeScene.brollUrl}
                      alt={activeScene.brollQuery || 'B-roll'}
                      className="w-full h-full object-cover opacity-90 scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                    <div className="absolute bottom-6 inset-x-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold shadow-lg">
                        <ImageIcon className="w-3 h-3 text-cyan-400" />
                        <span>TIER 3 B-ROLL: {activeScene.brollQuery?.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Motion Graphic Callout Overlay (Tier 4 Generated Graphic) */}
                {activeScene?.visualAction === 'graphic_callout' && activeScene.graphicText && (
                  <div className="absolute inset-x-4 top-1/3 text-center z-30 pointer-events-none animate-in zoom-in-95 duration-200">
                    <div className="inline-block px-5 py-3.5 rounded-2xl bg-black/90 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.65)] backdrop-blur-md">
                      <span className="text-[10px] font-mono text-amber-300 font-black tracking-widest block mb-0.5 uppercase">
                        ⚡ STATISTICAL BREAKTHROUGH
                      </span>
                      <p className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300 [text-shadow:_0_0_15px_rgba(251,191,36,0.8)]">
                        {activeScene.graphicText}
                      </p>
                      <span className="text-[9px] font-mono text-zinc-300 block mt-1">
                        Visual Hierarchy Tier 4 (Motion Graphic)
                      </span>
                    </div>
                  </div>
                )}

                {/* Animated Kinetic Typography (Tier 5) */}
                {animatedCaptions && activeScene?.emphasisPhrase && (
                  <div className="absolute top-10 inset-x-3 text-center z-30 pointer-events-none">
                    <span className="inline-block px-4 py-2 rounded-xl bg-black/85 border border-white/20 text-white font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,1)] [text-shadow:_0_0_12px_rgba(255,255,255,0.7)] animate-in fade-in">
                      {activeScene.emphasisPhrase}
                    </span>
                  </div>
                )}

                {/* Story Role Badge */}
                {activeScene?.storyRole && (
                  <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-violet-950/90 border border-violet-400/60 text-violet-300 font-mono text-[9px] font-black shadow-lg">
                      <Target className="w-3 h-3 text-cyan-300" />
                      <span>{activeScene.storyRole.toUpperCase()}</span>
                    </span>

                    {soundEffects && activeScene?.sfx && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-950/90 border border-amber-400/60 text-amber-300 font-mono text-[9px] font-black shadow-lg">
                        <Zap className="w-3 h-3" />
                        <span>{activeScene.sfx.toUpperCase()}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Punch-In Zoom Active Indicator */}
                {activeScene?.visualAction === 'punch_in' && zoomPunchIn && (
                  <div className="absolute top-3 right-3 z-30">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950/85 border border-rose-400/50 text-rose-300 font-mono text-[9px] font-black shadow-lg">
                      <ZoomIn className="w-3 h-3 text-rose-400" />
                      <span>PUNCH-IN (1.22x)</span>
                    </span>
                  </div>
                )}

                {/* Current Dialogue Subtitle */}
                <div className="absolute bottom-3 inset-x-3 text-center z-20 pointer-events-none">
                  <p className="text-xs font-bold text-white bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 line-clamp-2 shadow-lg">
                    "{activeScene?.speech || clip.hookStatement}"
                  </p>
                </div>

                {/* Dynamic Music Intensity Readout */}
                <div className="absolute bottom-12 right-3 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/90 font-mono font-bold text-[10px] text-amber-300 border border-amber-500/30">
                    🎵 Music Arc: {activeScene?.musicLevelPct || 18}%
                  </span>
                </div>
              </div>
            </div>

            {/* Playback Controls Strip */}
            <div className="h-10 px-5 border-y border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTime(0)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Reset to 0:00"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs font-bold text-zinc-300">
                  00:00:{Math.floor(currentTime).toString().padStart(2, '0')}:{(Math.round((currentTime % 1) * 30)).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Story-Aware Multi-Track Timeline</span>
                </span>
                <span className="hidden sm:inline text-zinc-500">• 30 FPS Non-Linear Edit</span>
              </div>
            </div>

            {/* 2. BOTTOM HALF: DAVINCI RESOLVE MULTI-TRACK TIMELINE */}
            <div className="h-[34vh] bg-[#050408] flex flex-col overflow-y-auto p-4 space-y-2 select-none relative">
              
              {/* Timecode Ruler */}
              <div className="relative h-6 border-b border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 px-2">
                {Array.from({ length: 9 }).map((_, idx) => {
                  const sec = (idx / 8) * clipDuration;
                  return (
                    <span key={idx} className="flex flex-col items-center">
                      <span>{sec.toFixed(0)}s</span>
                      <span className="w-[1px] h-1.5 bg-zinc-700 mt-0.5" />
                    </span>
                  );
                })}

                {/* Scrubber Playhead Line */}
                <div
                  className="absolute top-0 bottom-[-180px] w-[2px] bg-[#00F5FF] shadow-[0_0_10px_#00F5FF] z-40 pointer-events-none"
                  style={{ left: `${(currentTime / Math.max(1, clipDuration)) * 100}%` }}
                >
                  <div className="w-3 h-3 bg-[#00F5FF] rotate-45 -ml-[5px] -mt-1 shadow-md" />
                </div>
              </div>

              {/* TRACK 1: VIDEO TRACK (V1) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                    <Film className="w-3.5 h-3.5 text-violet-400" />
                    <span>VIDEO TRACK (V1)</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">5-Tier Visual Selection Hierarchy</span>
                </div>
                
                {/* Visual Block Segments */}
                <div
                  className="relative h-11 rounded-lg bg-zinc-900/80 border border-zinc-800/90 overflow-hidden flex cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    setCurrentTime(Number((pct * clipDuration).toFixed(1)));
                  }}
                >
                  {plan?.scenes.map((scene) => {
                    const widthPct = ((scene.endSec - scene.startSec) / clipDuration) * 100;
                    const isPunch = scene.visualAction === 'punch_in';
                    const isBroll = scene.visualAction === 'broll_cut';
                    const isGraphic = scene.visualAction === 'graphic_callout';

                    const bgClass = isPunch
                      ? 'bg-rose-600/35 border-rose-500/60 text-rose-200'
                      : isBroll
                      ? 'bg-emerald-600/35 border-emerald-500/60 text-emerald-200'
                      : isGraphic
                      ? 'bg-amber-600/35 border-amber-500/60 text-amber-200'
                      : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400';

                    return (
                      <div
                        key={scene.id}
                        style={{ width: `${widthPct}%` }}
                        className={`h-full border-r relative px-2 flex flex-col justify-center overflow-hidden transition-all ${bgClass} hover:brightness-125`}
                        title={`Scene ${scene.sceneIndex}: ${scene.storyRole.toUpperCase()} - ${scene.visualAction} (${scene.durationSec}s)`}
                      >
                        <span className="font-mono font-black text-[9px] uppercase truncate">
                          {isPunch && '🔍 TIER 1: PUNCH'}
                          {isBroll && '🖼️ TIER 3: B-ROLL'}
                          {isGraphic && '📊 TIER 4: GRAPHIC'}
                          {!isPunch && !isBroll && !isGraphic && '👤 TIER 1: FOOTAGE'}
                        </span>
                        <span className="text-[8px] text-zinc-400 truncate font-mono">
                          {scene.storyRole.toUpperCase()} • {scene.startSec}s-{scene.endSec}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TRACK 2: AUDIO TRACK (A1 - Spoken Dialogue) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AUDIO TRACK (A1)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">48kHz Voice Diarization</span>
                </div>
                <div
                  className="relative h-9 rounded-lg bg-zinc-900/80 border border-zinc-800/90 overflow-hidden flex items-center gap-[2px] px-1 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    setCurrentTime(Number((pct * clipDuration).toFixed(1)));
                  }}
                >
                  {Array.from({ length: 70 }).map((_, i) => {
                    const h = Math.max(20, Math.sin(i * 0.35) * 40 + (i % 2 === 0 ? 30 : 10) + (i % 5 === 0 ? 30 : 0));
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-full bg-gradient-to-t from-emerald-600 to-cyan-400 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* TRACK 3: MUSIC TRACK (A2 - Dynamic Story-Mapped Waveform Arc) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>MUSIC TRACK (A2)</span>
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold font-mono">
                    Dynamic Story Arc: Hook (35%) → Conflict (10%) → Payoff Swell (30%) + Auto Ducking
                  </span>
                </div>
                <div
                  className="relative h-9 rounded-lg bg-zinc-900/80 border border-zinc-800/90 overflow-hidden flex items-center gap-[2px] px-1 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    setCurrentTime(Number((pct * clipDuration).toFixed(1)));
                  }}
                >
                  {Array.from({ length: 70 }).map((_, i) => {
                    // Story-Mapped Music Envelope:
                    // 0..10: Hook (high 75%)
                    // 11..25: Context (moderate 45%)
                    // 26..45: Conflict (dip 25%)
                    // 46..55: Turning Point build (rising 60%)
                    // 56..65: Payoff Climax (peak 85%)
                    // 66..70: Resolution (fade 40%)
                    let envelope = 45;
                    if (i < 10) envelope = 80;
                    else if (i < 25) envelope = 45;
                    else if (i < 45) envelope = 25; // Conflict drop
                    else if (i < 55) envelope = 65; // Riser
                    else if (i < 65) envelope = 90; // Payoff Climax
                    else envelope = 40;

                    const h = Math.max(15, envelope + Math.sin(i * 0.8) * 10);
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-full bg-gradient-to-t from-amber-600 via-orange-500 to-yellow-300 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* TRACK 4: CAPTIONS TRACK (T1 - Typography) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                    <Type className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CAPTIONS TRACK (T1)</span>
                  </span>
                  <span className="text-[10px] text-cyan-400">Kinetic Typography & Word Highlights</span>
                </div>
                <div
                  className="relative h-7 rounded-lg bg-zinc-900/80 border border-zinc-800/90 overflow-hidden flex cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    setCurrentTime(Number((pct * clipDuration).toFixed(1)));
                  }}
                >
                  {plan?.scenes.map((scene) => {
                    const widthPct = ((scene.endSec - scene.startSec) / clipDuration) * 100;
                    return (
                      <div
                        key={scene.id}
                        style={{ width: `${widthPct}%` }}
                        className="h-full border-r border-cyan-500/30 bg-cyan-950/40 px-2 flex items-center overflow-hidden"
                      >
                        <span className="text-[9px] font-mono text-cyan-300 font-bold truncate">
                          "{scene.emphasisPhrase || scene.speech.slice(0, 15)}"
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT 4 COLS: AI EDITING DRAWER / STORY ARC / INSPECTOR */}
          <div className="lg:col-span-4 flex flex-col bg-zinc-950 border-t lg:border-t-0 border-zinc-800 overflow-hidden">
            
            {/* Drawer 3-Tab Header */}
            <div className="h-12 border-b border-zinc-800 flex items-center px-3 bg-zinc-900/70 shrink-0 gap-1.5">
              <button
                onClick={() => setActiveTab('controls')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'controls'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>AI Controls</span>
              </button>

              <button
                onClick={() => setActiveTab('story_arc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'story_arc'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                <span>Story Arc (6 Beats)</span>
              </button>

              <button
                onClick={() => setActiveTab('inspector')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>EDL Plan ({plan?.scenes.length || 0})</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* TAB 1: AI CONTROLS */}
              {activeTab === 'controls' && (
                <>
                  {/* EDITORIAL VERSION SELECTOR EXPLANATION */}
                  <div className="rounded-2xl border border-violet-500/40 bg-violet-950/20 p-4 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      <span>Active Cut: {plan?.versionLabel}</span>
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {plan?.versionDescription}
                    </p>
                  </div>

                  {/* 5-TIER VISUAL HIERARCHY CHECKBOXES */}
                  <div className="space-y-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4">
                    <span className="block text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span>Visual Selection Hierarchy</span>
                      <span className="text-[10px] text-violet-400 font-mono">5 Tiers Active</span>
                    </span>
                    
                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'zoomPunchIn', label: 'Tier 1: Existing Camera Reframing & Zooms', state: zoomPunchIn, setter: setZoomPunchIn },
                        { id: 'aiVisuals', label: 'Tier 2 & 4: Motion Graphics & Data Charts', state: aiVisuals, setter: setAiVisuals },
                        { id: 'autoBroll', label: 'Tier 3: Stock B-roll & Contextual Web Assets', state: autoBroll, setter: setAutoBroll },
                        { id: 'sceneChanges', label: 'Scene Transitions & Pattern Interrupts', state: sceneChanges, setter: setSceneChanges },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={item.state}
                            onChange={(e) => item.setter(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* TYPOGRAPHY CHECKBOXES */}
                  <div className="space-y-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4">
                    <span className="block text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                      Kinetic Typography (Tier 5)
                    </span>

                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'animatedCaptions', label: 'Animated 2-Tone Kinetic Captions', state: animatedCaptions, setter: setAnimatedCaptions },
                        { id: 'highlightKeywords', label: 'Keyword Glow & High-Impact Emphasis', state: highlightKeywords, setter: setHighlightKeywords },
                        { id: 'proTypography', label: 'Broadcast-Grade Bold Typography', state: proTypography, setter: setProTypography },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={item.state}
                            onChange={(e) => item.setter(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* AUDIO & SOUND DESIGN CHECKBOXES */}
                  <div className="space-y-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4">
                    <span className="block text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span>Dynamic Audio & Story Arc</span>
                      <span className="text-[10px] text-amber-400 font-mono">Smart Mixing</span>
                    </span>

                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'originalAudio', label: 'Original Spoken Audio Track', state: originalAudio, setter: setOriginalAudio },
                        { id: 'backgroundMusic', label: 'Story-Mapped Music Arc (Dynamic Volume)', state: backgroundMusic, setter: setBackgroundMusic },
                        { id: 'autoDucking', label: 'Sidechain Auto-Ducking (-14dB on Speech)', state: autoDucking, setter: setAutoDucking },
                        { id: 'soundEffects', label: 'Sound Effects (Whoosh Impact, Stat Pop)', state: soundEffects, setter: setSoundEffects },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={item.state}
                            onChange={(e) => item.setter(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: STORY ARC BREAKDOWN (6 NARRATIVE BEATS) */}
              {activeTab === 'story_arc' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-950/40 to-cyan-950/30 border border-violet-500/30 text-xs text-zinc-300 space-y-1">
                    <span className="text-cyan-300 font-bold block font-mono">
                      STORY-AWARE NARRATIVE SEQUENCE
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      The AI analyzes what each moment means, ensuring the Short follows a cohesive narrative arc rather than random clip splicing.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {storyArcBreakdown?.map((beat, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{beat.label}</span>
                          </span>
                          <span className="text-cyan-300 font-bold">
                            {beat.timeRange[0].toFixed(1)}s - {beat.timeRange[1].toFixed(1)}s
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400">
                          {beat.description}
                        </p>

                        <div className="p-2 rounded-lg bg-black/60 border border-white/5 text-xs text-zinc-300 italic">
                          "{beat.keyMomentText}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SCENE-BY-SCENE EDIT DECISION LIST (EDL) */}
              {activeTab === 'inspector' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30 text-xs text-zinc-300 space-y-1 font-mono">
                    <span className="text-cyan-300 font-bold block">EDIT DECISION LIST (EDL)</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Individual scenes can be regenerated or tweaked without destroying the master timeline.
                    </span>
                  </div>

                  {plan?.scenes.map((scene) => {
                    const isSelected = activeScene?.id === scene.id;
                    return (
                      <div
                        key={scene.id}
                        onClick={() => setCurrentTime(scene.startSec)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/20 shadow-md ring-1 ring-cyan-400'
                            : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-white">Scene #{scene.sceneIndex}</span>
                          <span className="text-cyan-300">
                            {scene.startSec.toFixed(1)}s - {scene.endSec.toFixed(1)}s ({scene.durationSec.toFixed(1)}s)
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 font-semibold leading-snug">
                          "{scene.speech}"
                        </p>

                        {/* Dual Score Badges */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Viral: {scene.viralScore}% 🔥
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Story Fit: {scene.compatibilityScore}% 🎯
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800">
                            Music: {scene.musicLevelPct}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            scene.visualAction === 'punch_in'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : scene.visualAction === 'broll_cut'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : scene.visualAction === 'graphic_callout'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {scene.visualAction.toUpperCase()}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            {scene.visualHierarchyTier.replace(/_/g, ' ').toUpperCase()}
                          </span>

                          {scene.sfx && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              SFX: {String(scene.sfx).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-zinc-400 italic">
                          💡 {scene.reasoning}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Card */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 space-y-2">
              {renderSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{renderSuccessMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateAIEdit}
                disabled={isRendering}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isRendering ? 'animate-spin' : ''}`} />
                <span>{isRendering ? 'Rendering AI Edit...' : `✨ Render ${plan?.versionLabel || 'AI Pro Cut'}`}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
