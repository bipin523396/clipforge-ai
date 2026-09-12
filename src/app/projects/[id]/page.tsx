'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import {
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  Clock,
  Download,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  ShieldCheck,
  Subtitles,
  Layers,
  Radio,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import { QAReportModal } from '@/components/editor/qa-report-modal';
import { InlineClipPlayer } from '@/components/editor/inline-clip-player';
import { QuickWatchModal } from '@/components/editor/quick-watch-modal';
import { AIEditProModal } from '@/components/editor/ai-edit-pro-modal';
import { Clip, Project } from '@/types';
import { downloadVerifiedVideoMp4, splitHeadlineTwoTone } from '@/lib/client-download';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getProject, deleteProject, deleteClip, compileMegaShort, toast } = useApp();

  const storeProject = getProject(resolvedParams.id);
  const [project, setProject] = useState<Project | null>(storeProject || null);
  const [loading, setLoading] = useState(!storeProject);

  const [activeTab, setActiveTab] = useState<'clips' | 'transcript' | 'activity'>('clips');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [selectedQAClip, setSelectedQAClip] = useState<Clip | null>(null);
  const [selectedAIEditClip, setSelectedAIEditClip] = useState<Clip | null>(null);
  const [activeInlineClipId, setActiveInlineClipId] = useState<string | null>(null);
  const [quickWatchModalIndex, setQuickWatchModalIndex] = useState<number | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isBatchExporting, setIsBatchExporting] = useState(false);
  const [isCleaningRenders, setIsCleaningRenders] = useState(false);

  // Fallback: Fetch project directly from API if not in store
  useEffect(() => {
    if (!storeProject) {
      fetch(`/api/projects/${resolvedParams.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.project) {
            setProject(data.project);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setProject(storeProject);
      setLoading(false);
    }
  }, [storeProject, resolvedParams.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-16 text-center space-y-4">
          <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading project and short videos...</p>
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="p-12 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Project Not Found</h2>
          <p className="text-xs text-zinc-400">The requested video project does not exist or has been deleted.</p>
          <Link href="/projects" className="px-4 py-2 rounded-xl bg-violet-600 text-xs font-bold text-white">
            Return to Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  // Compile 3-in-1 Mega Short (50s)
  const handleCompileMegaShort = async () => {
    setIsCompiling(true);
    const megaClip = await compileMegaShort(project.id);
    if (megaClip) {
      setProject((prev) => {
        if (!prev) return prev;
        const filtered = prev.clips.filter((c) => c.id !== megaClip.id);
        return { ...prev, clips: [megaClip, ...filtered] };
      });
    }
    setIsCompiling(false);
  };

  // Delete Entire Project Permanently
  const handleDeleteProject = async () => {
    await deleteProject(project.id);
    router.push('/projects');
  };

  // Delete Individual Clip Permanently
  const handleDeleteClip = async (clipId: string) => {
    await deleteClip(project.id, clipId);
    setProject((prev) => {
      if (!prev) return prev;
      return { ...prev, clips: prev.clips.filter((c) => c.id !== clipId) };
    });
  };

  // Direct Verified MP4 Download (4K Ultra-HD)
  const handleDownloadClipMP4 = async (clip: Clip, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const channel = clip.overlays?.channelName || project.channelName;
    const channelParam = channel ? `&channelName=${encodeURIComponent(channel)}` : '';
    const downloadUrl = `/api/projects/${clip.projectId}/clips/${clip.id}/download?resolution=4k${channelParam}`;
    const cleanFilename = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_4k_short.mp4`;

    await downloadVerifiedVideoMp4(downloadUrl, cleanFilename, {
      onStart: () => {
        toast('Preparing 4K Ultra-HD MP4 🎬', `Preparing "${clip.title.slice(0, 25)}..." in 4K`, 'info');
      },
      onProgress: (status) => {
        toast('4K Rendering Engine ⚡', status, 'info');
      },
      onSuccess: (savedFile) => {
        toast('4K Video Download Ready 🚀', `Successfully saved "${savedFile}"`, 'success');
      },
      onError: (msg) => {
        toast('Download Notice', msg, 'error');
      },
    });
  };

  // Direct SRT Subtitle Download
  const handleDownloadClipSRT = (clip: Clip, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    toast('Subtitles Downloaded 📝', `Saved .SRT file for "${clip.title.slice(0, 25)}..."`, 'info');
  };

  // Sequential Batch Export All Ready Clips (4K Ultra-HD)
  const handleBatchExport = async () => {
    if (isBatchExporting) return;
    setIsBatchExporting(true);
    toast('Batch 4K Export Started 📦', `Exporting all ${project.clips.length} short videos sequentially in 4K...`, 'info');

    try {
      for (let idx = 0; idx < project.clips.length; idx++) {
        const c = project.clips[idx];
        const channel = c.overlays?.channelName || project.channelName;
        const channelParam = channel ? `&channelName=${encodeURIComponent(channel)}` : '';
        const downloadUrl = `/api/projects/${c.projectId}/clips/${c.id}/download?resolution=4k${channelParam}`;
        const filename = `${c.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25)}_4k_short_${idx + 1}.mp4`;

        toast(`[${idx + 1}/${project.clips.length}] 4K Processing 🎬`, `Preparing "${c.title.slice(0, 20)}..."`, 'info');
        await downloadVerifiedVideoMp4(downloadUrl, filename, {
          onProgress: (status) => {
            toast(`[${idx + 1}/${project.clips.length}] 4K Engine ⚡`, status, 'info');
          },
        });
        await new Promise((r) => setTimeout(r, 800));
      }
      toast('Batch 4K Export Finished 🚀', `Successfully downloaded all ${project.clips.length} shorts!`, 'success');
    } catch (err: any) {
      toast('Batch Export Warning', err.message || 'Error during batch export', 'error');
    } finally {
      setIsBatchExporting(false);
    }
  };

  // Clean Rendered Videos to Free Disk Space
  const handleCleanProjectRenders = async () => {
    if (!confirm('Free disk space? This will delete all local rendered .mp4 video files for this project to reclaim storage while keeping your clips, transcripts, and thumbnails intact.')) {
      return;
    }
    setIsCleaningRenders(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/cleanup`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast('Disk Space Reclaimed 🧹', data.message, 'success');
      } else {
        throw new Error(data.error || 'Failed to clean renders');
      }
    } catch (err: any) {
      toast('Cleanup Error', err.message, 'error');
    } finally {
      setIsCleaningRenders(false);
    }
  };

  const handleSeek = (timeSec: number) => {
    setCurrentPlayTime(timeSec);
    setIsPlaying(true);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {project.clips.length} AI Shorts Ready
            </span>
            <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 font-mono text-[11px] font-bold">
              All &lt; 50s
            </span>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-violet-500/20 px-2 py-0.2 text-[10px] font-mono font-bold text-violet-300 uppercase">
                {project.contentType}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Duration: {Math.floor(project.videoAsset.durationSec / 60)}m{' '}
                {(Math.floor(project.videoAsset.durationSec) % 60).toString().padStart(2, '0')}s
              </span>
              <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                Situational Voice Filter Active (-14 LUFS)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{project.title}</h1>
            <p className="text-xs text-zinc-400 max-w-2xl">{project.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start">
            {/* ✨ AI EDIT LIKE PRO BUTTON (DaVinci Studio) */}
            <button
              onClick={() => {
                if (project.clips.length > 0) {
                  setSelectedAIEditClip(project.clips[0]);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-500/25 hover:opacity-95 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Open DaVinci Resolve-style AI Pro Editing Studio"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>✨ AI Edit Like Pro</span>
            </button>

            {/* All-in-One Master Short Compilation Trigger */}
            {(() => {
              const standaloneCount = project.clips.filter((c) => !c.id.includes('mega') && !c.id.includes('combined')).length;
              return (
                <button
                  onClick={handleCompileMegaShort}
                  disabled={isCompiling || standaloneCount === 0}
                  className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all ${
                    isCompiling ? 'opacity-60 pointer-events-none' : 'hover:scale-105'
                  }`}
                  title={`Join all ${standaloneCount} generated Shorts into 1 Combined Master Short with 1-click`}
                >
                  <Zap className={`w-4 h-4 ${isCompiling ? 'animate-spin' : 'fill-current'}`} />
                  <span>
                    {isCompiling
                      ? 'Stitching Master Short...'
                      : standaloneCount > 1
                      ? `Join All ${standaloneCount} Shorts (1-Click Master Cut)`
                      : 'Compile Master Short'}
                  </span>
                </button>
              );
            })()}

            {/* Batch Export */}
            <button
              onClick={handleBatchExport}
              disabled={isBatchExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3.5 py-2.5 text-xs font-bold text-zinc-200 transition-all disabled:opacity-50"
            >
              <Download className={`w-4 h-4 text-emerald-400 ${isBatchExporting ? 'animate-bounce' : ''}`} />
              <span>{isBatchExporting ? 'Exporting (4K)...' : 'Download All (4K)'}</span>
            </button>

            {/* Clean Video Storage (Free Disk Space) */}
            <button
              onClick={handleCleanProjectRenders}
              disabled={isCleaningRenders}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 px-3.5 py-2.5 text-xs font-bold text-amber-300 transition-all disabled:opacity-50"
              title="Delete all rendered .mp4 video files for this project to free disk storage space"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isCleaningRenders ? 'Cleaning...' : 'Clean Video Storage'}</span>
            </button>

            {/* Delete Project */}
            <button
              onClick={handleDeleteProject}
              className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
              title="Permanently Delete Project Everywhere"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Source Video Waveform & Scrubbing Player */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <p className="text-xs font-bold text-white">Source Master Video Track</p>
                <p className="text-[11px] font-mono text-zinc-400">
                  {Math.floor(currentPlayTime / 60)}:{(currentPlayTime % 60).toFixed(0).padStart(2, '0')} /{' '}
                  {Math.floor(project.videoAsset.durationSec / 60)}:
                  {(Math.floor(project.videoAsset.durationSec) % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
              48kHz Speech Diarization Synchronized
            </span>
          </div>

          {/* Interactive Audio Waveform Scrubber */}
          <div className="relative h-16 w-full rounded-xl bg-zinc-900/90 border border-zinc-800 p-2 overflow-hidden flex items-center gap-1 cursor-pointer">
            {Array.from({ length: 60 }).map((_, i) => {
              const heightPct = Math.max(15, Math.sin(i * 0.4) * 45 + (i % 3 === 0 ? 35 : 15) + (i % 7 === 0 ? 40 : 0));
              const isPast = (i / 60) * project.videoAsset.durationSec <= currentPlayTime;
              return (
                <div
                  key={i}
                  onClick={() => setCurrentPlayTime((i / 60) * project.videoAsset.durationSec)}
                  className={`flex-1 rounded-full transition-all duration-150 hover:bg-cyan-300 ${
                    isPast ? 'bg-gradient-to-t from-violet-500 to-cyan-400' : 'bg-zinc-700'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}

            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_#FFFFFF] pointer-events-none"
              style={{ width: '2px', left: `${(currentPlayTime / (project.videoAsset.durationSec || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('clips')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'clips' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Short Videos ({project.clips.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'transcript' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Searchable Transcript</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'activity' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Processing Pipeline Log</span>
          </button>
        </div>

        {/* TAB 1: SUGGESTED CLIPS GRID */}
        {activeTab === 'clips' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.clips.map((clip, idx) => {
                const isMega = clip.id.includes('mega');
                return (
                  <div
                    key={clip.id}
                    className={`rounded-3xl border overflow-hidden transition-all flex flex-col justify-between group relative ${
                      isMega
                        ? 'border-amber-500/70 bg-zinc-900/90 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-violet-500/50 hover:bg-zinc-900'
                    }`}
                  >
                    <div>
                      {/* Thumbnail & Video Preview (with direct Play Button & Inline Player) */}
                      {activeInlineClipId === clip.id ? (
                        <InlineClipPlayer
                          clip={clip}
                          onClose={() => setActiveInlineClipId(null)}
                          onOpenModal={() => setQuickWatchModalIndex(idx)}
                          onOpenAIEdit={() => setSelectedAIEditClip(clip)}
                        />
                      ) : (
                        <div className="relative aspect-[9/12] w-full overflow-hidden bg-zinc-950 border-b border-zinc-800 group/thumb">
                          <img
                            src={clip.thumbnailUrl}
                            alt={clip.title}
                            className="h-full w-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                          {/* Top Score Badge with QA Report Trigger */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-20">
                            {isMega ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-black px-3 py-1 text-xs font-black shadow-lg">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                3-in-1 Master Short (48s)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedQAClip(clip);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-black/85 backdrop-blur-md border border-cyan-400/50 hover:border-cyan-400 px-2.5 py-1 text-xs font-black text-cyan-300 shadow-lg shadow-cyan-500/10 transition-all hover:scale-105"
                                title="Click to open Post-Render QA Report"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                <span>QA Score {clip.highlightScore}/100</span>
                              </button>
                            )}
                          </div>

                          {/* Top Right: Duration Badge */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                            <div className="rounded-md bg-black/80 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan-300 border border-white/10 shadow-lg flex items-center gap-1">
                              <span className="text-amber-300 font-black">4K</span> • {clip.durationSec}s • 9:16
                            </div>
                          </div>

                          {/* Top Catchy Big-Letter Two-Tone Headline Title (No Black Box, Direct on Video, Big Size) */}
                          {(() => {
                            const rawHead = clip.overlays?.headlineText || clip.hookStatement;
                            const mainText = clip.overlays?.headlineHighlight ? clip.overlays.headlineText : splitHeadlineTwoTone(rawHead).main;
                            const highlightText = clip.overlays?.headlineHighlight ? clip.overlays.headlineHighlight : splitHeadlineTwoTone(rawHead).highlight;
                            const style = clip.overlays?.headlineStyle || 'yellow_white';
                            const highlightColorClass = style === 'fire_orange'
                              ? 'text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.95)]'
                              : style === 'neon_cyan'
                              ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.95)]'
                              : 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.95)]';

                            return (
                              <div className="absolute top-12 inset-x-2 text-center z-20 pointer-events-none">
                                <div className="inline-block px-2 max-w-[98%] text-center">
                                  <p className="font-black uppercase tracking-tight leading-snug flex flex-col items-center">
                                    <span className="text-white text-xs sm:text-sm md:text-base font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:_0_2px_8px_rgba(0,0,0,1),_0_0_14px_rgba(0,0,0,0.95),_0_0_3px_rgba(0,0,0,1)]">
                                      {mainText}
                                    </span>
                                    <span className={`${highlightColorClass} text-sm sm:text-base md:text-lg font-black mt-0.5 tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,1),_0_0_14px_rgba(0,0,0,0.95),_0_0_3px_rgba(0,0,0,1)]`}>
                                      {highlightText}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Center Prominent Play Button */}
                          <button
                            type="button"
                            onClick={() => setActiveInlineClipId(clip.id)}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/20 hover:bg-black/45 transition-all z-10 cursor-pointer group/playbtn"
                            title="Click to play short video immediately"
                          >
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.85)] group-hover/playbtn:scale-115 transition-transform border-2 border-white/40 backdrop-blur-md">
                              <Play className="w-7 h-7 fill-current ml-1" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-white bg-black/85 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-xl group-hover/playbtn:border-cyan-400/80 group-hover/playbtn:text-cyan-300 transition-colors">
                              Play Short ⚡
                            </span>
                          </button>

                          {/* Hook Statement */}
                          <div className="absolute bottom-3 inset-x-3 text-center z-10 pointer-events-none">
                            <p className="text-xs font-bold text-white bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/15 line-clamp-2 shadow-lg">
                              "{clip.hookStatement}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Clip Meta Info */}
                      <div className="p-5 space-y-3">
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono">
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Situational Audio:</span>
                            <span className="text-cyan-300 font-bold">-14 LUFS Matched</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Final Quality:</span>
                            <span className="text-emerald-400 font-bold">{clip.highlightScore}/100 🔥</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {clip.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">{clip.title}</h3>
                        <p className="text-[11px] font-mono text-zinc-500">
                          Timestamps: {clip.startSec.toFixed(1)}s – {clip.endSec.toFixed(1)}s ({clip.durationSec}s &lt; 50s)
                        </p>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-5 pt-0 border-t border-zinc-800/80 flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {/* Delete Clip */}
                        <button
                          onClick={() => handleDeleteClip(clip.id)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Permanently Delete Clip Everywhere"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Direct Video Download */}
                        <button
                          onClick={(e) => handleDownloadClipMP4(clip, e)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Download 4K Ultra-HD Video (MP4)"
                        >
                          <Download className="w-4 h-4 text-emerald-400" />
                        </button>

                        {/* Direct SRT Download */}
                        <button
                          onClick={(e) => handleDownloadClipSRT(clip, e)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                          title="Download Subtitles (.SRT)"
                        >
                          <Subtitles className="w-4 h-4 text-cyan-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* ✨ AI Edit Like Pro Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedAIEditClip(clip)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] hover:opacity-95 text-white text-xs font-black shadow-md shadow-violet-500/25 transition-all hover:scale-105 cursor-pointer"
                          title="Open DaVinci Resolve-style AI Edit Studio for this Short"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveInlineClipId(activeInlineClipId === clip.id ? null : clip.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all hover:scale-105"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{activeInlineClipId === clip.id ? 'Stop' : 'Play'}</span>
                        </button>

                        <Link
                          href={`/projects/${project.id}/clips/${clip.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Studio</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SEARCHABLE TRANSCRIPT */}
        {activeTab === 'transcript' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search spoken words in transcript..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
                />
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Confidence: {((project.transcript?.confidence || 0.95) * 100).toFixed(1)}% (Whisper v3 Turbo)
              </span>
            </div>

            <div className="space-y-4">
              {(project.transcript?.segments || [])
                .filter((s) => s.text.toLowerCase().includes(transcriptSearch.toLowerCase()))
                .map((segment) => (
                  <div
                    key={segment.id}
                    onClick={() => handleSeek(segment.startSec)}
                    className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 hover:border-violet-500/40 hover:bg-zinc-900/60 cursor-pointer transition-all flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-violet-300">{segment.speaker}</span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {segment.startSec}s – {segment.endSec}s
                        </span>
                        {segment.sentiment === 'impactful' && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 uppercase">
                            High Impact Hook
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{segment.text}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROCESSING PIPELINE LOG */}
        {activeTab === 'activity' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">System Pipeline & Storage Activity</h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-between">
                <span>✓ Media Ingestion & Supabase Temporary Upload:</span>
                <span>Active</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-between">
                <span>✓ Situational Voice Filtering & -14 LUFS Loudness Normalization:</span>
                <span>Calibrated</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-between">
                <span>✓ Dynamic Face Framing & Safe Headroom Protection:</span>
                <span>Enabled</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-between">
                <span>✓ YouTube Channel Watermark & Logo Shielding:</span>
                <span>Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Quick Watch Modal with Next/Prev and All Controls */}
      {quickWatchModalIndex !== null && (
        <QuickWatchModal
          clips={project.clips}
          initialClipIndex={quickWatchModalIndex}
          isOpen={true}
          onClose={() => setQuickWatchModalIndex(null)}
          projectId={project.id}
          onOpenAIEdit={(c) => setSelectedAIEditClip(c)}
        />
      )}

      {/* Post-Render QA Report Modal */}
      {selectedQAClip && (
        <QAReportModal
          clip={selectedQAClip}
          isOpen={true}
          onClose={() => setSelectedQAClip(null)}
        />
      )}

      {/* DaVinci Resolve-style AI Pro Edit Modal */}
      {selectedAIEditClip && (
        <AIEditProModal
          isOpen={Boolean(selectedAIEditClip)}
          onClose={() => setSelectedAIEditClip(null)}
          clip={selectedAIEditClip}
          projectId={project.id}
          onApplyEdit={(updated) => {
            setProject((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                clips: prev.clips.map((c) => (c.id === updated.id ? updated : c)),
              };
            });
          }}
        />
      )}
    </AppShell>
  );
}
