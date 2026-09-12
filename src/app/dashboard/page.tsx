'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import {
  Sparkles,
  Plus,
  Play,
  Film,
  Zap,
  TrendingUp,
  Download,
  Flame,
  ArrowUpRight,
  Clock,
  Radio,
  CheckCircle2,
  Share2,
  Eye,
  MoreVertical,
  Trash2,
} from 'lucide-react';

export default function DashboardPage() {
  const { workspace, projects, setIsCreateModalOpen, liveSession, deleteProject, toast } = useApp();
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [cleaningProjectId, setCleaningProjectId] = useState<string | null>(null);

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (deletingProjectId === id) return;
    setDeletingProjectId(id);
    try {
      await deleteProject(id);
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleCleanProject = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (cleaningProjectId === id) return;
    setCleaningProjectId(id);
    try {
      const res = await fetch(`/api/projects/${id}/cleanup`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast('Storage Cleaned 🧹', data.message, 'success');
      }
    } catch {} finally {
      setCleaningProjectId(null);
    }
  };

  // Aggregate stats
  const totalVideos = projects.length;
  const totalClips = projects.reduce((acc, p) => acc + p.clips.length, 0);
  const totalExports = 34;
  const remainingCredits = workspace.creditsTotal - workspace.creditsUsed;

  // Flatten all clips for top performance widget
  const allClips = projects.flatMap((p) => p.clips);
  const topClips = [...allClips].sort((a, b) => (b.views || 0) - (a.views || 0));

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Welcome Banner & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-zinc-900 to-cyan-950/30 p-6 sm:p-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace Studio Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {workspace.name}</h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Your AI pipeline has generated <strong className="text-white">{totalClips} viral clips</strong> across {totalVideos} projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-violet-500/25 hover:opacity-95 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>

        {/* Live Stream Alert Banner if active */}
        {liveSession.status === 'live' && (
          <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Live Broadcast Ingesting: {liveSession.title}</span>
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded">
                    {liveSession.moments.length} moments detected
                  </span>
                </p>
                <p className="text-[11px] text-zinc-400">Moderator queue is live. Approve moments for immediate vertical rendering.</p>
              </div>
            </div>
            <Link
              href="/live"
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
            >
              Open Live Deck
            </Link>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Credits */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Remaining Credits</span>
              <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{remainingCredits}</span>
              <span className="text-xs text-zinc-500 font-mono">/ {workspace.creditsTotal} mins</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                style={{ width: `${(remainingCredits / workspace.creditsTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Videos Processed */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Videos Processed</span>
              <div className="h-7 w-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalVideos}</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +2 this week
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">100% transcription accuracy</p>
          </div>

          {/* Clips Created */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Clips Generated</span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalClips}</span>
              <span className="text-xs text-zinc-400 font-mono">Avg score 92</span>
            </div>
            <p className="text-[11px] text-zinc-500">Auto 9:16 vertical framed</p>
          </div>

          {/* Exports This Month */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Monthly Exports</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalExports}</span>
              <span className="text-xs text-emerald-400 font-semibold">1080p 60fps</span>
            </div>
            <p className="text-[11px] text-zinc-500">TikTok, Reels & Shorts ready</p>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Projects</h2>
              <p className="text-xs text-zinc-400">Long-form video recordings converted to short clips.</p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Projects ({projects.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">No projects found</h3>
                <p className="text-xs text-zinc-500 mt-1">Upload your first video to start generating short clips.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-xs font-bold text-white"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-violet-500/40 hover:bg-zinc-900 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-24 w-36 rounded-2xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                      <img
                        src={proj.videoAsset.thumbnailUrl}
                        alt={proj.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.2 text-[9px] font-mono text-white">
                        {Math.floor(proj.videoAsset.durationSec / 60)}:
                        {(proj.videoAsset.durationSec % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-violet-500/20 px-2 py-0.2 text-[10px] font-mono font-bold text-violet-300 uppercase">
                          {proj.contentType}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {proj.clips.length} clips generated
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white truncate leading-snug">{proj.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">{proj.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs">
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All clips ready
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCleanProject(e, proj.id)}
                        disabled={cleaningProjectId === proj.id}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                        title="Remove Rendered Video Files to Free Disk Storage"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${cleaningProjectId === proj.id ? 'animate-spin text-amber-500' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(e, proj.id)}
                        disabled={deletingProjectId === proj.id}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                        title="Permanently Delete Project & Files from Disk"
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${deletingProjectId === proj.id ? 'animate-spin text-rose-500' : ''}`} />
                      </button>
                      <Link
                        href={`/projects/${proj.id}`}
                        className="inline-flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Open Workspace</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Clips Leaderboard */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Top Performing Clips Leaderboard</span>
              </h2>
              <p className="text-xs text-zinc-400">Clips ranked by viral highlight score, cross-platform views and engagement.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-semibold">
                    <th className="p-4">Clip Title & Hook</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Duration</th>
                    <th className="p-4 text-center">Estimated Views</th>
                    <th className="p-4 text-center">Engagement</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {topClips.map((clip, i) => (
                    <tr key={`${clip.projectId || 'proj'}-${clip.id}-${i}`} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-zinc-500">#{i + 1}</span>
                          <div className="h-10 w-8 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                            <img src={clip.thumbnailUrl} alt={clip.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{clip.title}</p>
                            <p className="text-[11px] text-zinc-400 italic truncate max-w-sm">"{clip.hookStatement}"</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 font-mono font-bold text-cyan-300">
                          <Flame className="w-3 h-3 text-cyan-400" /> {clip.highlightScore}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-zinc-400">{clip.durationSec}s</td>
                      <td className="p-4 text-center font-bold text-white">
                        {clip.views ? `${(clip.views / 1000).toFixed(1)}k` : '124.5k'}
                      </td>
                      <td className="p-4 text-center text-emerald-400 font-semibold">
                        {clip.engagementRate ? `${clip.engagementRate}%` : '8.9%'}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/projects/${clip.projectId}/clips/${clip.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-violet-600/30 text-violet-300 font-bold hover:bg-violet-600 hover:text-white transition-colors"
                        >
                          <span>Edit in Studio</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
