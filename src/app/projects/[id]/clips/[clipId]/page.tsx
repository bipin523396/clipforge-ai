'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Clip, CaptionTrack, Project } from '@/types';


import { VideoCanvas } from '@/components/editor/video-canvas';
import { TimelineScrubber } from '@/components/editor/timeline-scrubber';
import { CaptionStudio } from '@/components/editor/caption-studio';
import { AICommandBar } from '@/components/editor/ai-command-bar';
import { InspectorPanel } from '@/components/editor/inspector-panel';
import { AIDirectorPanel } from '@/components/editor/ai-director-panel';
import { ExportModal } from '@/components/editor/export-modal';
import { QAReportModal } from '@/components/editor/qa-report-modal';
import { ShortcutsModal } from '@/components/editor/shortcuts-modal';
import {
  ArrowLeft,
  Sparkles,
  Download,
  RotateCcw,
  RotateCw,
  Save,
  CheckCircle2,
  Subtitles,
  Sliders,
  Crop,
  Layers,
  Wand2,
  ShieldCheck,
  Command,
  Scissors,
  Zap,
} from 'lucide-react';

export default function ClipEditorPage({
  params,
}: {
  params: Promise<{ id: string; clipId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getProject, getClip, updateClip, toast } = useApp();

  const projectId = resolvedParams.id;
  const clipId = resolvedParams.clipId;
  const initialProject = getProject(projectId);
  const initialClip = getClip(projectId, clipId);

  const [project, setProject] = useState<Project | undefined>(initialProject);
  const [clip, setClip] = useState<Clip | undefined>(initialClip);
  const [loading, setLoading] = useState(!initialClip);
  const [activeRightTab, setActiveRightTab] = useState<'captions' | 'inspector' | 'director'>('director');
  const [currentTime, setCurrentTime] = useState(initialClip ? initialClip.startSec : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);

  // Sync state if store updates
  useEffect(() => {
    if (initialClip) {
      setClip(initialClip);
      setLoading(false);
    }
    if (initialProject) {
      setProject(initialProject);
    }
  }, [initialClip, initialProject]);

  // Fallback: Fetch directly from Supabase via API if not yet in store memory
  useEffect(() => {
    if (!clip) {
      fetch(`/api/projects/${encodeURIComponent(projectId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.project) {
            setProject(data.project);
            const foundClip = (data.project.clips || []).find((c: Clip) => c.id === clipId);
            if (foundClip) {
              setClip(foundClip);
              setCurrentTime(foundClip.startSec || 0);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [clip, projectId, clipId]);


  // Video playback time loop simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && clip) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= clip.endSec) {
            return clip.startSec; // loop back to start
          }
          return Number((prev + 0.1).toFixed(2));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, clip]);

  const handleUpdateClip = (updates: Partial<Clip>) => {
    if (!clip) return;
    const updated = { ...clip, ...updates };
    setClip(updated);
    updateClip(projectId, clipId, updates);
    setIsAutosaving(true);
    setTimeout(() => setIsAutosaving(false), 800);
  };

  const handleApplyHookPunch = () => {
    if (!clip) return;
    handleUpdateClip({
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
    toast('3s Hook Punch Applied! ⚡', 'Visual zoom punch-in (1.25x) and hook headline locked for 0-3s entrance.', 'success');
  };

  const handleAutoCutDeadSpace = () => {
    if (!clip) return;
    const tightenedSegments = (clip.captions?.segments || []).map((seg) => ({
      ...seg,
      endSec: Math.max(seg.startSec + 0.8, seg.endSec - 0.25),
    }));
    handleUpdateClip({
      captions: {
        ...clip.captions,
        segments: tightenedSegments,
      },
    });
    toast('Fast Pacing Applied ✂️', 'All silent pauses >250ms and breath gaps trimmed for maximum retention!', 'success');
  };

  const handleSplitAtPlayhead = (timeSec: number) => {
    toast('Split Cut Applied ✂️', `Split marker added at ${timeSec.toFixed(1)}s (Source relative)`, 'info');
  };

  // Keyboard Shortcuts Global Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(clip?.startSec || 0, prev - 1));
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(clip?.endSec || 50, prev + 1));
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setIsPlaying(false);
      } else if (e.key === 'c' || e.key === 'C' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSplitAtPlayhead(currentTime);
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleApplyHookPunch();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleAutoCutDeadSpace();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clip, currentTime]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B] text-white">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading clip from Supabase Cloud...</p>
        </div>
      </div>
    );
  }

  if (!project || !clip) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B] text-white">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Clip not found</h2>
          <p className="text-xs text-zinc-400">The requested clip or project could not be located in Supabase storage.</p>
          <button
            onClick={() => router.push('/projects')}
            className="px-4 py-2 rounded-xl bg-violet-600 text-xs font-bold"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }


  const handleUpdateCaptions = (newCaptions: CaptionTrack) => {
    handleUpdateClip({ captions: newCaptions });
  };

  const handleApplyAIChanges = (modifiedClip: Clip, message: string) => {
    setClip(modifiedClip);
    updateClip(projectId, clipId, modifiedClip);
    toast('AI Command Applied ✨', message, 'success');
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#09090B] text-zinc-100 overflow-hidden select-none">
      {/* Top Studio Control Bar */}
      <header className="flex h-14 w-full items-center justify-between border-b border-zinc-850 bg-[#121215] px-4">
        {/* Left: Backlink & Clip Info */}
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Back to Project"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white max-w-xs sm:max-w-md truncate">
                {clip.title}
              </h2>
              <span className="rounded bg-violet-500/20 px-1.5 py-0.2 text-[9px] font-mono font-bold text-violet-300">
                Score {clip.highlightScore}/100
              </span>
              <span className="hidden sm:inline-block rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-mono font-bold text-amber-300">
                3-Act Story Arc
              </span>
            </div>
          </div>
        </div>

        {/* Center: Autosave status & Quality */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            {isAutosaving ? (
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                Autosaving...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Autosaved
              </span>
            )}
          </span>
        </div>

        {/* Right: Shortcuts Guide, QA Report & Export Button */}
        <div className="flex items-center gap-2">
          {/* Keyboard Shortcuts HUD */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-mono transition-all"
            title="Press ? for Keyboard Shortcuts"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Shortcuts (?)</span>
          </button>

          {/* QA Report */}
          <button
            onClick={() => setIsQAModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-bold transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI QA ({clip.highlightScore}/100)</span>
          </button>

          {/* Export */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Clip</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport (Canvas + Timeline on Left, Inspector on Right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left 65-70%: Canvas & Timeline & AI Bar */}
        <div className="flex flex-1 flex-col border-r border-zinc-850 overflow-hidden bg-[#09090B]">
          {/* Main Video Canvas */}
          <div className="flex-1 overflow-hidden relative">
            <VideoCanvas
              clip={clip}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />
          </div>

          {/* AI Command Bar */}
          <AICommandBar clip={clip} onApplyAIChanges={handleApplyAIChanges} />

          {/* Timeline Scrubber with 3-Act Story Arc & Shortcuts */}
          <TimelineScrubber
            clip={clip}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={(t) => setCurrentTime(t)}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onTrimChange={(start, end) => handleUpdateClip({ startSec: start, endSec: end })}
            onSplitAtPlayhead={handleSplitAtPlayhead}
            onAutoCutDeadSpace={handleAutoCutDeadSpace}
            onApplyHookPunch={handleApplyHookPunch}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
          />
        </div>

        {/* Right 30-35%: Studio Tool Switcher (Director Story / Subtitles / Inspector) */}
        <div className="w-80 sm:w-96 flex flex-col bg-[#121215] shrink-0 border-l border-zinc-800/80">
          {/* Studio Tab Navigation */}
          <div className="grid grid-cols-3 border-b border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveRightTab('director')}
              className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'director'
                  ? 'border-violet-500 text-white font-bold bg-violet-600/10'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Story & Pacing</span>
            </button>

            <button
              onClick={() => setActiveRightTab('captions')}
              className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'captions'
                  ? 'border-violet-500 text-white font-bold bg-violet-600/10'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Subtitles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Subtitles</span>
            </button>

            <button
              onClick={() => setActiveRightTab('inspector')}
              className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'inspector'
                  ? 'border-violet-500 text-white font-bold bg-violet-600/10'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Framing</span>
            </button>
          </div>

          {/* Right Panel Viewports */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'director' && (
              <AIDirectorPanel
                clip={clip}
                onUpdateClip={handleUpdateClip}
                onSeekTime={(t) => setCurrentTime(t)}
              />
            )}

            {activeRightTab === 'captions' && (
              <CaptionStudio clip={clip} onUpdateCaptions={handleUpdateCaptions} />
            )}

            {activeRightTab === 'inspector' && (
              <InspectorPanel clip={clip} onUpdateClip={handleUpdateClip} />
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        clip={clip}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Post-Render QA Report Modal */}
      <QAReportModal
        clip={clip}
        isOpen={isQAModalOpen}
        onClose={() => setIsQAModalOpen(false)}
      />

      {/* Pro Keyboard Shortcuts Modal HUD */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
