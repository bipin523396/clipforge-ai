'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import { PipelineJob } from '@/lib/server/job-queue';
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
  ExternalLink,
} from 'lucide-react';

const PIPELINE_STEPS = [
  { key: 'validating', name: 'Validate Media & Extract Metadata', provider: 'Metadata Engine' },
  { key: 'fetching_video', name: 'Download Authorized Media Stream', provider: 'yt-dlp Downloader' },
  { key: 'extracting_audio', name: 'Extract 16kHz WAV Audio Track', provider: 'FFmpeg Core' },
  { key: 'transcribing', name: 'Word-Level Speech-to-Text Diarization', provider: 'Whisper Engine' },
  { key: 'analyzing', name: 'Groq Fast Pass Candidate Discovery', provider: 'Groq ⚡ (llama-3.3-70b)' },
  { key: 'deduplicating', name: 'Cloudflare Semantic Deduplication', provider: 'Cloudflare Workers AI 🤖' },
  { key: 'ranking', name: 'Cerebras 100-Point 7-Pillar Deep Rubric', provider: 'Cerebras 🧠 (llama3.1-70b)' },
  { key: 'researching', name: 'SerpApi Search Velocity & Trend Intel', provider: 'SerpApi 🔎 / Zenserp 🔄' },
  { key: 'creating_edit_plan', name: 'AI Editing Director (Second-by-Second EDL)', provider: 'AI Editing Director 🎬' },
  { key: 'rendering', name: 'FFmpeg 9:16 Vertical Video Rendering', provider: 'FFmpeg Render Engine' },
];

export default function ProcessingStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || `job-${projectId}`;
  const router = useRouter();
  const { addProject, toast } = useApp();

  const [job, setJob] = useState<PipelineJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pipeline/jobs/${jobId}`);
        if (!res.ok) {
          if (res.status === 404 && pollCount > 15) {
            setError('Job record not found. Please try launching a new pipeline.');
          }
          return;
        }

        const data = await res.json();
        if (data.success && data.job && isMounted) {
          setJob(data.job);
          setPollCount((prev) => prev + 1);

          // Handle completion
          if (data.job.status === 'completed') {
            clearInterval(interval);
            if (data.job.project) {
              addProject(data.job.project);
            }
            toast('Processing Completed 🔥', `Generated ${(data.job.generatedClips || []).length} rendered short videos!`, 'success');
            setTimeout(() => {
              router.push(`/projects/${projectId}`);
            }, 800);
            return;
          } else if (data.job.status === 'failed') {
            clearInterval(interval);
            setError(data.job.error || 'Pipeline job failed.');
          } else if (data.job.generationJobId && data.job.id !== data.job.generationJobId) {
            // The discovery job spawned a generation job. Switch polling to the generation job.
            router.replace(`/projects/${projectId}/processing?jobId=${data.job.generationJobId}`);
          }
        }
      } catch (err: any) {
        console.warn('[Job Poll Error]:', err);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId, projectId, pollCount, router, addProject, toast]);

  const progress = job ? job.progress : 5;
  const currentStageText = job ? job.currentStageText : 'Connecting to background worker...';
  const meta = job?.videoMetadata;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Top Header & Breadcrumbs */}
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
              Real Server Worker Active
            </span>
          </div>
        </div>

        {/* Error Alert if Failed */}
        {error && (
          <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Processing Job Failed</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-mono">{error}</p>
            <div className="pt-2 flex gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Main Processing Status Card */}
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Job ID: {jobId}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{job?.title || 'Processing Video Episode'}</h1>
              <p className="text-xs text-zinc-400 font-mono break-all">{job?.sourceUrl}</p>
            </div>

            <div className="text-right sm:self-center shrink-0">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">{progress}%</div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">Zero-Cost Token Routing</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-mono text-cyan-300 animate-pulse">{currentStageText}</p>
          </div>

          {/* Real Extracted Metadata Pill (When available) */}
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
                  <span>FPS: {meta.fps}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase font-mono">
                ✓ Video Verified
              </span>
            </div>
          )}
        </div>

        {/* Real Step-by-Step Architecture Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span>Real Multi-Provider Pipeline Execution</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = job && isStepCompleted(job.status, step.key, job.progress);
              const isCurrent = job && job.status === step.key;

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-zinc-200'
                      : isCurrent
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-white shadow-lg shadow-cyan-500/10'
                      : 'border-zinc-800/60 bg-zinc-950/40 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                          ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                          : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-[11px] truncate">{step.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{step.provider}</p>
                    </div>
                  </div>

                  <div className="ml-2 shrink-0">
                    {isDone ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Backend Log Stream */}
        <div className="rounded-3xl border border-zinc-800 bg-[#09090b] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real Backend Worker Telemetry & Logs</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {job?.logs.length || 0} events recorded
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px] max-h-56 overflow-y-auto pr-2">
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

function isStepCompleted(currentStatus: string, stepKey: string, progressPct: number): boolean {
  if (currentStatus === 'completed' || progressPct === 100) return true;
  const order = [
    'queued',
    'validating',
    'fetching_video',
    'extracting_audio',
    'transcribing',
    'analyzing',
    'deduplicating',
    'ranking',
    'researching',
    'creating_edit_plan',
    'rendering',
    'completed',
  ];
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepKey);
  return currentIdx > stepIdx;
}
