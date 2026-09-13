'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import {
  LongVideoProject,
  LongVideoEditPlan,
  IndexedVideoEvent,
} from '@/types/long-video';
import {
  Film,
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Download,
  Send,
  Sliders,
  Layers,
  Scissors,
  Eye,
  ShieldAlert,
  Flame,
  User,
  Zap,
  RefreshCw,
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react';

export default function LongVideoStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<LongVideoProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Video Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [activePlayerMode, setActivePlayerMode] = useState<'source' | 'rendered'>('rendered');
  const [isMuted, setIsMuted] = useState(false);
  const hasAutoSelected = useRef(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/long-video/projects/${projectId}`);
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        if (!hasAutoSelected.current) {
          if (data.project.renderedOutput) {
            setActivePlayerMode('rendered');
          } else {
            setActivePlayerMode('source');
          }
          hasAutoSelected.current = true;
        }
      } else {
        setError(data.error || 'Project not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching project');
    }
  };

  useEffect(() => {
    fetchProject();
    const interval = setInterval(fetchProject, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [project?.chatHistory?.length]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || project?.durationSec || 0);
    }
  };

  const seekTo = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleSendPrompt = async (promptToSend?: string) => {
    const text = (promptToSend || promptInput).trim();
    if (!text || isSendingChat || !project) return;

    setIsSendingChat(true);
    setPromptInput('');

    try {
      const res = await fetch(`/api/long-video/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to process chat command');
      }

      if (data.project) {
        setProject(data.project);
      }
    } catch (err: any) {
      alert(`AI Director Error: ${err.message}`);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleTriggerRender = async () => {
    if (!project?.activePlan) {
      alert('Please send an AI chat command to generate an edit plan first!');
      return;
    }

    setIsRendering(true);
    try {
      const res = await fetch(`/api/long-video/projects/${projectId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: project.activePlan }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to queue render');
      }

      if (data.project) {
        setProject(data.project);
      }
    } catch (err: any) {
      alert(`Render Error: ${err.message}`);
    } finally {
      setIsRendering(false);
    }
  };

  const formatSec = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isIndexing = project?.status === 'indexing';
  const isRenderingStatus = project?.status === 'rendering';
  const isReady = project?.status === 'ready' || project?.status === 'completed';
  const hasRendered = Boolean(project?.renderedOutput);
  const catalog = project?.indexedCatalog;
  const activePlan = project?.activePlan;

  const currentVideoSrc = activePlayerMode === 'rendered' && project?.renderedOutput
    ? `/api/long-video/projects/${projectId}/stream?mode=rendered`
    : `/api/long-video/projects/${projectId}/stream?mode=source`;

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div className="space-y-1">
            <Link
              href="/long-video"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Long Video Projects</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{project?.title || 'Long Video Studio'}</h1>
            </div>
            <p className="text-xs text-zinc-500 font-mono truncate max-w-xl">{project?.sourceUrl}</p>
          </div>

          <div className="flex items-center gap-3">
            {isIndexing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>Multi-Modal Indexing ({project?.progressPct}%)</span>
              </div>
            )}
            {isRenderingStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30 animate-pulse">
                <Wand2 className="w-3.5 h-3.5 animate-spin text-violet-300" />
                <span>FFmpeg Stitching ({project?.progressPct}%)</span>
              </div>
            )}
            {isReady && !isRenderingStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Index Active • AI Director Ready</span>
              </div>
            )}
          </div>
        </div>

        {/* Indexing Banner if in progress */}
        {isIndexing && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>One-Time Multi-Modal Video Analysis in Progress</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{project?.progressPct}%</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-mono">{project?.stageMessage || 'Processing audio, visuals, and scoreboard text...'}</p>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${project?.progressPct || 10}%` }}
              />
            </div>
          </div>
        )}

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: Video Preview & Multi-Modal Event Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Video Player Card */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl space-y-3 p-4">
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Studio Canvas</span>
                  </span>
                  {hasRendered && (
                    <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-[11px] font-mono">
                      <button
                        onClick={() => setActivePlayerMode('source')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          activePlayerMode === 'source' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Full Source
                      </button>
                      <button
                        onClick={() => setActivePlayerMode('rendered')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          activePlayerMode === 'rendered' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Master Edit 🎬
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-xs font-mono text-zinc-400">
                  {formatSec(currentTime)} / {formatSec(videoDuration || project?.durationSec || 0)}
                </span>
              </div>

              {/* Video Player Frame */}
              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-zinc-900 group">
                <video
                  ref={videoRef}
                  key={currentVideoSrc}
                  src={currentVideoSrc}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  playsInline
                  className="w-full h-full object-contain"
                  poster={project?.thumbnailUrl}
                />

                {/* Center Play Overlay */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="h-14 w-14 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                  </div>
                </button>
              </div>

              {/* Player Scrubber & Controls */}
              <div className="flex items-center gap-3 px-2 pt-1">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={videoDuration || project?.durationSec || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
                </button>
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Multi-Modal Timeline Visualizer */}
            {catalog && (
              <div className="rounded-3xl border border-zinc-850 bg-zinc-900/60 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Multi-Modal Video Event Map ({catalog.events.length} Actions)
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-yellow-300">
                      <span className="h-2 w-2 rounded-full bg-yellow-400" /> Boundaries/Shots
                    </span>
                    <span className="flex items-center gap-1 text-cyan-300">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" /> Deliveries
                    </span>
                    <span className="flex items-center gap-1 text-purple-300">
                      <span className="h-2 w-2 rounded-full bg-purple-400" /> Replays
                    </span>
                  </div>
                </div>

                {/* Visual Timeline Strip */}
                <div className="relative h-12 w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 p-1 flex items-center">
                  {/* Highlight active plan segments in vibrant emerald */}
                  {activePlan?.segments.map((seg) => {
                    const totalDur = project.durationSec || 600;
                    const leftPct = (seg.startSec / totalDur) * 100;
                    const widthPct = Math.max(1.5, ((seg.endSec - seg.startSec) / totalDur) * 100);

                    return (
                      <div
                        key={seg.id}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className="absolute h-full bg-cyan-500/25 border-x border-cyan-400/80 pointer-events-none"
                      />
                    );
                  })}

                  {/* Event Markers */}
                  {catalog.events.map((ev) => {
                    const totalDur = project.durationSec || 600;
                    const leftPct = (ev.startSec / totalDur) * 100;

                    let color = 'bg-cyan-400 hover:bg-cyan-300';
                    if (ev.isBoundary) color = 'bg-yellow-400 hover:bg-yellow-300 h-8';
                    if (ev.isReplay) color = 'bg-purple-400 hover:bg-purple-300';

                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => seekTo(ev.startSec)}
                        style={{ left: `${leftPct}%` }}
                        title={`${ev.label} (${formatSec(ev.startSec)} - ${formatSec(ev.endSec)})`}
                        className={`absolute top-2 w-1.5 rounded-full transition-all cursor-pointer ${color} ${
                          ev.isBoundary ? 'h-7 z-10' : 'h-5'
                        }`}
                      />
                    );
                  })}

                  {/* Playhead position */}
                  <div
                    style={{ left: `${(currentTime / (project.durationSec || 600)) * 100}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-lg shadow-rose-500/50 pointer-events-none z-20"
                  />
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  💡 Click any colored event pin on the timeline strip above to jump video playback directly to that ball, shot, or replay.
                </p>
              </div>
            )}

            {/* Active Edit Plan Cutlist Card */}
            {activePlan && (
              <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-zinc-900 to-zinc-950 p-6 space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono text-cyan-400">
                      <Scissors className="w-4 h-4" />
                      <span>Active Edit Cutlist ({activePlan.segments.length} Sequences)</span>
                    </div>
                    <h3 className="text-base font-black text-white">Target: {activePlan.target.person} ({activePlan.target.activity})</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-mono font-black text-white">
                      {Math.floor(activePlan.totalDurationSec / 60)}m {Math.round(activePlan.totalDurationSec % 60)}s
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Planned Master Duration</span>
                  </div>
                </div>

                {/* Plan parameters badges */}
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                    ⏱️ Context: +{activePlan.include.beforeEventSec}s before / +{activePlan.include.afterEventSec}s after
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    activePlan.include.replays ? 'bg-purple-950/40 border-purple-500/30 text-purple-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}>
                    {activePlan.include.replays ? '✓ Replays Included' : '✕ Replays Excluded'}
                  </span>
                  {activePlan.include.boundariesOnly && (
                    <span className="px-2.5 py-1 rounded-lg bg-yellow-950/40 border border-yellow-500/30 text-yellow-300 font-bold">
                      ⭐ Only Boundaries (4s & 6s)
                    </span>
                  )}
                  {activePlan.output.blurWatermark && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 font-bold">
                      🛡️ Watermark Blur Active
                    </span>
                  )}
                </div>

                {/* Segments List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activePlan.segments.map((seg, idx) => (
                    <div
                      key={seg.id}
                      onClick={() => seekTo(seg.startSec)}
                      className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/70 hover:border-cyan-500/50 hover:bg-zinc-900 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {seg.label}
                          </span>
                          {seg.isBoundary && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-500 text-black font-mono">
                              BOUNDARY
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate pl-7">{seg.reason}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {formatSec(seg.startSec)} - {formatSec(seg.endSec)}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{seg.durationSec}s cut</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Render Trigger CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800">
                  <span className="text-xs text-zinc-400">
                    Ready to compile these {activePlan.segments.length} sequences into your final video?
                  </span>
                  <button
                    type="button"
                    onClick={handleTriggerRender}
                    disabled={isRendering || isRenderingStatus}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 text-xs font-bold text-white shadow-xl shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isRendering || isRenderingStatus ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering Master Video...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Render & Export Edit ({activePlan.segments.length} Cuts)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Master Rendered Output Download Card if completed */}
            {project?.renderedOutput && (
              <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Master Long Video Render Complete</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    {Math.floor(project.renderedOutput.durationSec / 60)}m {Math.round(project.renderedOutput.durationSec % 60)}s
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  All {project.renderedOutput.segmentsCount} targeted sequences have been cut, seamless cross-transitions applied, watermarks masked, and exported in full HD MP4.
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={project.renderedOutput.supabaseVideoUrl || project.renderedOutput.videoPath}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Master Edited Video</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePlayerMode('rendered');
                      seekTo(0);
                      videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-emerald-400 fill-current" />
                    <span>Preview in Canvas Player</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Conversational AI Director Chatbot (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col h-[750px] shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800/80 bg-gradient-to-r from-cyan-950/30 to-violet-950/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">AI Editing Director</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">Conversational Multi-Modal Editor</p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                Online
              </span>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 border-b border-zinc-850 bg-zinc-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-mono text-zinc-400 uppercase shrink-0">Try:</span>
              {[
                'Show only Sanju Samson batting',
                'Remove all replays',
                'Keep only boundaries',
                'Keep 3s before delivery and 5s after shot',
                'Blur channel logo in top-right',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(suggestion)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 border border-zinc-700/60 text-[10px] text-zinc-300 shrink-0 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Messages List */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {project?.chatHistory.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                        isUser
                          ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-medium shadow-md'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Attached Plan Card in message */}
                      {msg.plan && (
                        <div className="rounded-xl border border-cyan-500/30 bg-black/40 p-3 space-y-2 font-mono text-[11px]">
                          <div className="flex items-center justify-between text-cyan-300 font-bold">
                            <span>📋 Edit Plan Generated</span>
                            <span>{msg.plan.segments.length} clips</span>
                          </div>
                          <div className="text-zinc-400 space-y-0.5 text-[10px]">
                            <p>• Target: {msg.plan.target.person} ({msg.plan.target.activity})</p>
                            <p>• Total Time: {Math.floor(msg.plan.totalDurationSec / 60)}m {Math.round(msg.plan.totalDurationSec % 60)}s</p>
                            <p>• Replays: {msg.plan.include.replays ? 'Included' : 'Excluded'}</p>
                          </div>
                        </div>
                      )}

                      <span className="block text-[9px] text-zinc-500 font-mono text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="rounded-2xl p-3.5 bg-zinc-900 border border-zinc-800 text-xs text-cyan-300 flex items-center gap-2 animate-pulse">
                    <Wand2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing indexed timeline and compiling edit plan...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="p-3 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. 'Show only Sanju Samson batting, remove replays'..."
                disabled={isSendingChat || isIndexing}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!promptInput.trim() || isSendingChat || isIndexing}
                className="p-2.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
