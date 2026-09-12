'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import { PipelineJob } from '@/lib/server/job-queue';
import { ViralMoment } from '@/types';
import {
  Sparkles,
  Zap,
  Cpu,
  TrendingUp,
  Film,
  Check,
  AlertCircle,
  Clock,
  ArrowLeft,
  FileVideo,
  Layers,
  Search,
  Terminal,
  RefreshCw,
  Flame,
  CheckCircle2,
  ChevronRight,
  Filter,
  Sliders,
  Play,
  Globe,
  Plus,
} from 'lucide-react';

export default function MomentDiscoveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || `disc-job-${projectId}`;
  const router = useRouter();
  const { toast } = useApp();

  const [job, setJob] = useState<PipelineJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [minScoreFilter, setMinScoreFilter] = useState(75);
  const [isSearchingDeeper, setIsSearchingDeeper] = useState(false);

  // Poll for discovery progress
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pipeline/jobs/${jobId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.job && isMounted) {
          setJob(data.job);

          // Handle seamless redirection when auto-render triggered a generation job or completed
          if (data.job.generationJobId && data.job.id !== data.job.generationJobId) {
            clearInterval(interval);
            router.replace(`/projects/${projectId}/processing?jobId=${data.job.generationJobId}`);
            return;
          }

          if (data.job.status === 'completed') {
            clearInterval(interval);
            router.replace(`/projects/${projectId}`);
            return;
          }

          // If discovery completed and no moments selected yet, auto-select requested count
          if ((data.job.status === 'discovery_completed' || data.job.status === 'rendering_shorts') && data.job.discoveredMoments?.length > 0) {
            const autoCount = data.job.discoveryOptions?.requestedCount || 3;
            setSelectedIds((prev) => (prev.length === 0 ? (data.job.selectedMomentIds?.length > 0 ? data.job.selectedMomentIds : data.job.discoveredMoments.slice(0, autoCount).map((m: ViralMoment) => m.id)) : prev));
            // Auto-adjust minScoreFilter if default 75 is higher than all moments
            const minScoreInJob = Math.min(...data.job.discoveredMoments.map((m: any) => m.viralScore || 80));
            setMinScoreFilter((prev) => (prev > minScoreInJob ? Math.max(60, minScoreInJob) : prev));
          } else if (data.job.status === 'failed') {
            setError(data.job.error || 'Discovery job failed');
          }
        }
      } catch (err) {
        console.warn('[Discovery Poll Error]:', err);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId]);

  const toggleSelectMoment = (momentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(momentId) ? prev.filter((id) => id !== momentId) : [...prev, momentId]
    );
  };

  const handleSelectAll = () => {
    if (!job?.discoveredMoments) return;
    const filtered = job.discoveredMoments.filter((m) => m.viralScore >= minScoreFilter);
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((m) => m.id));
    }
  };

  const handleGenerateShorts = async () => {
    let targetMomentIds = [...selectedIds];

    const desiredCount = job?.discoveryOptions?.requestedCount || 3;

    // If none explicitly checked, auto-select from available moments
    if (targetMomentIds.length === 0) {
      if (moments.length > 0) {
        targetMomentIds = moments.slice(0, desiredCount).map((m) => m.id);
        setSelectedIds(targetMomentIds);
      } else if (job?.discoveredMoments && job.discoveredMoments.length > 0) {
        targetMomentIds = job.discoveredMoments.slice(0, desiredCount).map((m) => m.id);
        setSelectedIds(targetMomentIds);
      }
    }

    setIsGenerating(true);
    try {
      // If job still has 0 moments, run deep search to generate fallback moments
      if (!job?.discoveredMoments || job.discoveredMoments.length === 0) {
        const deepRes = await fetch('/api/pipeline/search-deeper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });
        const deepData = await deepRes.json();
        if (deepData.success && deepData.moments?.length > 0) {
          targetMomentIds = deepData.moments.slice(0, desiredCount).map((m: any) => m.id);
          setSelectedIds(targetMomentIds);
        }
      }

      const response = await fetch('/api/pipeline/generate-shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discoveryJobId: jobId,
          selectedMomentIds: targetMomentIds,
          stylePreset: job?.discoveryOptions.stylePreset || 'energetic',
          aspectRatio: job?.discoveryOptions.aspectRatio || '9:16',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Generation trigger failed');
      }

      toast('Rendering Queued 🎬', `Generating Shorts from original video stream...`, 'success');
      router.push(`/projects/${projectId}/processing?jobId=${data.jobId}`);
    } catch (err: any) {
      console.error('[Generate Shorts Error]:', err);
      toast('Generation Failed', err.message || 'Error triggering rendering', 'error');
      setIsGenerating(false);
    }
  };

  const handleSearchDeeper = async () => {
    setIsSearchingDeeper(true);
    try {
      const response = await fetch('/api/pipeline/search-deeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed deep search');
      }
      toast('Deep Search Completed 🔍', `Found ${data.momentsCount} moments total across full video!`, 'success');
      // Refresh job state
      const jobRes = await fetch(`/api/pipeline/jobs/${jobId}`);
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        if (jobData.success && jobData.job) {
          setJob(jobData.job);
        }
      }
    } catch (err: any) {
      toast('Deep Search Failed', err.message || 'Error running deeper search', 'error');
    } finally {
      setIsSearchingDeeper(false);
    }
  };

  const isDiscoveryCompleted = job?.status === 'discovery_completed';
  const moments = (job?.discoveredMoments || []).filter((m) => m.viralScore >= minScoreFilter);
  const meta = job?.videoMetadata;

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-violet-500/10 text-violet-300 border border-violet-500/30">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              {isDiscoveryCompleted ? 'Discovery Complete' : 'AI Discovery Running'}
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Discovery Pipeline Error</span>
            </div>
            <p className="text-xs text-zinc-300 font-mono">{error}</p>
          </div>
        )}

        {/* IN-PROGRESS DISCOVERY MONITOR */}
        {!isDiscoveryCompleted && (
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Phase 1: Full-Video AI Moment Discovery</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">{job?.title || 'Ingesting & Analyzing Video'}</h1>
                <p className="text-xs text-zinc-400 font-mono truncate max-w-xl">{job?.sourceUrl}</p>
              </div>

              <div className="text-right sm:self-center shrink-0">
                <div className="text-3xl sm:text-4xl font-black text-white font-mono">{job?.progress || 10}%</div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Probing Media Streams</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                  style={{ width: `${job?.progress || 10}%` }}
                />
              </div>
              <p className="text-xs font-mono text-cyan-300 animate-pulse">{job?.currentStageText || 'Probing source video...'}</p>
            </div>

            {/* Verified Media Stream Details */}
            {meta && (
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={meta.thumbnailUrl}
                  alt={meta.title}
                  className="h-16 w-28 rounded-xl object-cover border border-zinc-800 shrink-0"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{meta.title}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 flex-wrap">
                    <span>Duration: {Math.floor(meta.durationSec / 60)}m {meta.durationSec % 60}s</span>
                    <span>Resolution: {meta.width}x{meta.height}</span>
                    <span>Channel: {meta.uploader}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase font-mono">
                  ✓ Source Verified
                </span>
              </div>
            )}
          </div>
        )}

        {/* COMPLETED DISCOVERY RESULTS VIEW (SEARCH ≠ GENERATE) */}
        {isDiscoveryCompleted && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Discovery Summary Banner */}
            <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-zinc-900 to-cyan-950/30 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ {job?.discoveredMoments.length} Viral Moments Found
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    Full Video: {Math.floor((meta?.durationSec || 180) / 60)}m {(meta?.durationSec || 180) % 60}s
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{job?.title}</h1>
                <p className="text-xs text-zinc-300 max-w-2xl">
                  Select which viral moments to turn into vertical Shorts. Each chosen moment receives a custom Edit Decision List and non-destructive FFmpeg rendering from authentic source media.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={handleSearchDeeper}
                  disabled={isSearchingDeeper}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-zinc-700 bg-zinc-900/90 text-xs font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-40"
                >
                  <Search className={`w-4 h-4 text-cyan-400 ${isSearchingDeeper ? 'animate-spin' : ''}`} />
                  <span>{isSearchingDeeper ? 'Searching Deeper...' : '🔍 Search Deeper'}</span>
                </button>

                <button
                  onClick={handleGenerateShorts}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-xs sm:text-sm font-black text-white shadow-xl shadow-violet-500/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Film className="w-4 h-4" />
                  <span>
                    {isGenerating
                      ? 'Rendering Shorts...'
                      : selectedIds.length > 0
                      ? `Generate Selected (${selectedIds.length}) Shorts 🔥`
                      : moments.length > 0
                      ? `Generate All (${moments.length}) Shorts 🔥`
                      : 'Auto-Generate Shorts 🔥'}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter & Selection Control Bar */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-200 hover:text-white transition-colors"
                >
                  {selectedIds.length === moments.length && moments.length > 0 ? 'Deselect All' : `Select All (${moments.length})`}
                </button>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Min Score:</span>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    value={minScoreFilter}
                    onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                    className="accent-violet-500 w-24 h-1.5 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-white text-xs">{minScoreFilter}+</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-500 font-mono">
                  Showing {moments.length} of {job?.discoveredMoments?.length || 0} moments
                </span>
              </div>
            </div>

            {/* Discovered Moments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moments.length === 0 && (
                <div className="col-span-full rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/60 p-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-white">
                      {job?.discoveredMoments && job.discoveredMoments.length > 0
                        ? `No moments matched Min Score ≥ ${minScoreFilter}`
                        : 'No Moments Found Initially'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {job?.discoveredMoments && job.discoveredMoments.length > 0
                        ? 'Lower the Min Score slider or click below to view all moments.'
                        : 'Click below to instantly generate 5 high-potential viral moments from the source video.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {job?.discoveredMoments && job.discoveredMoments.length > 0 ? (
                      <button
                        onClick={() => setMinScoreFilter(60)}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
                      >
                        Show All Discovered Moments
                      </button>
                    ) : (
                      <button
                        onClick={handleSearchDeeper}
                        disabled={isSearchingDeeper}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-xs font-bold text-white transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isSearchingDeeper ? 'Generating Moments...' : '✨ Generate 5 Viral Moments Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              {moments.map((moment, idx) => {
                const isSelected = selectedIds.includes(moment.id);
                return (
                  <div
                    key={moment.id}
                    onClick={() => toggleSelectMoment(moment.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative ${
                      isSelected
                        ? 'border-violet-500 bg-gradient-to-b from-violet-950/30 to-zinc-950 shadow-lg shadow-violet-500/10'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-violet-600 border-violet-500 text-white'
                                : 'border-zinc-700 bg-zinc-900 text-transparent group-hover:border-zinc-500'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/40 px-2.5 py-0.5 text-xs font-black font-mono text-cyan-300">
                            <Flame className="w-3.5 h-3.5 text-cyan-400" />
                            Score {moment.viralScore}/100
                          </span>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300">
                            {moment.hookType}
                          </span>
                        </div>

                        <div className="text-right font-mono text-xs font-bold text-zinc-400">
                          {Math.floor(moment.startSec / 60)}:{(moment.startSec % 60).toFixed(0).padStart(2, '0')} ➔{' '}
                          {Math.floor(moment.endSec / 60)}:{(moment.endSec % 60).toFixed(0).padStart(2, '0')}{' '}
                          <span className="text-zinc-600">({moment.durationSec.toFixed(1)}s)</span>
                        </div>
                      </div>

                      {/* Hook Statement */}
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-200 transition-colors">
                          "{moment.hookStatement}"
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{moment.reason}</p>
                      </div>

                      {/* 7-Pillar Progress Mini-Bars */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-900 text-[10px] font-mono">
                        <div>
                          <span className="text-zinc-500 block">Hook:</span>
                          <span className="text-emerald-400 font-bold">{moment.scores.hook}/20</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Curiosity:</span>
                          <span className="text-cyan-300 font-bold">{moment.scores.curiosity}/15</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Retention:</span>
                          <span className="text-violet-300 font-bold">{moment.scores.retention}/15</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Value:</span>
                          <span className="text-white font-bold">{moment.scores.value}/15</span>
                        </div>
                      </div>
                    </div>

                    {/* Trend Tag & Bottom Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-900/80 text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>Topic: <strong className="text-zinc-200">{moment.extractedTopic}</strong></span>
                      </div>

                      <span
                        className={`text-[11px] font-bold ${
                          isSelected ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}
                      >
                        {isSelected ? '✓ Selected for Short' : '+ Click to Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Real Backend Log Stream */}
        <div className="rounded-3xl border border-zinc-800 bg-[#09090b] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real Discovery Worker Telemetry & Logs</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {job?.logs.length || 0} events recorded
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto pr-2">
            {job?.logs && job.logs.length > 0 ? (
              job.logs.map((log, lIdx) => (
                <div key={lIdx} className="flex items-start gap-2.5 text-zinc-400">
                  <span className="text-zinc-600 shrink-0 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 text-[9px] shrink-0 uppercase">
                    {log.provider}
                  </span>
                  <span className="text-zinc-300 leading-snug">{log.message}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 italic">Waiting for initial worker response...</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
