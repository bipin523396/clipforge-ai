'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import {
  BarChart3,
  TrendingUp,
  Download,
  Flame,
  Share2,
  Eye,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { workspace, projects, toast } = useApp();
  const [dateRange, setDateRange] = useState('30d');

  const allClips = projects.flatMap((p) => p.clips);
  const totalClips = allClips.length;
  const totalViews = 387400;
  const avgEngagement = '8.7%';
  const avgViralScore = 91.4;

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Clip Title,Score,Duration,Views,Engagement,Shares\n' +
      allClips
        .map(
          (c) =>
            `"${c.title}",${c.highlightScore},${c.durationSec},${c.views || 100000},${
              c.engagementRate || 8.5
            }%,${c.shares || 2000}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clipforge_analytics_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Analytics CSV Exported 📊', 'Downloaded performance report.', 'success');
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Performance Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Analytics & Video Insights</h1>
            <p className="text-xs text-zinc-400">Track short-form reach, audience retention, and highlight score benchmarks.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Core KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Estimated Views</span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {(totalViews / 1000).toFixed(1)}K
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last period
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Avg Engagement</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300">{avgEngagement}</div>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Top 5% creator benchmark
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Avg Highlight Score</span>
            <div className="text-2xl sm:text-3xl font-black text-violet-300 flex items-center gap-1">
              <Flame className="w-6 h-6 text-cyan-400" />
              <span>{avgViralScore}</span>
            </div>
            <p className="text-[11px] text-zinc-500">Based on hook & pacing models</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Clips Published</span>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalClips}</div>
            <p className="text-[11px] text-zinc-500">Across TikTok, Reels & Shorts</p>
          </div>
        </div>

        {/* Visual Charts & Score Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Cross-Platform Performance Bar Simulation */}
          <div className="lg:col-span-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Viewership Velocity</h3>
                <p className="text-xs text-zinc-400">Aggregated performance across connected social channels.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-violet-400">
                  <span className="h-2 w-2 rounded-full bg-violet-400" /> TikTok
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" /> Instagram Reels
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Shorts
                </span>
              </div>
            </div>

            {/* Simulated Bar Chart */}
            <div className="h-48 w-full flex items-end gap-3 pt-6 px-2">
              {[
                { day: 'Mon', v: 45, c: 30, e: 25 },
                { day: 'Tue', v: 65, c: 45, e: 35 },
                { day: 'Wed', v: 85, c: 60, e: 50 },
                { day: 'Thu', v: 70, c: 55, e: 40 },
                { day: 'Fri', v: 95, c: 80, e: 65 },
                { day: 'Sat', v: 110, c: 90, e: 80 },
                { day: 'Sun', v: 125, c: 100, e: 95 },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full max-w-[32px] flex flex-col justify-end gap-1 h-full">
                    <div
                      className="w-full bg-emerald-400/80 rounded-t-sm transition-all group-hover:brightness-125"
                      style={{ height: `${item.e * 0.4}%` }}
                    />
                    <div
                      className="w-full bg-cyan-400/80 transition-all group-hover:brightness-125"
                      style={{ height: `${item.c * 0.4}%` }}
                    />
                    <div
                      className="w-full bg-violet-500/80 rounded-b-sm transition-all group-hover:brightness-125"
                      style={{ height: `${item.v * 0.4}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 4 Cols: Highlight Score Breakdown Distribution */}
          <div className="lg:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Score Distribution</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span className="font-bold text-emerald-400">Viral Tier (90–100)</span>
                  <span className="font-mono">75% (6 clips)</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[75%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span className="font-bold text-cyan-300">Strong Tier (80–89)</span>
                  <span className="font-mono">25% (2 clips)</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[25%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Standard Tier (70–79)</span>
                  <span className="font-mono">0% (0 clips)</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-600 rounded-full w-[0%]" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-3 mt-4 text-[11px] text-zinc-400">
              <p className="font-semibold text-violet-300 mb-1">AI Recommendation:</p>
              Your videos with high-tension question hooks in the first 1.5s perform 34% better on TikTok.
            </div>
          </div>
        </div>

        {/* Top Performing Clips Table */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Full Video Performance Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="p-3">Clip Title</th>
                  <th className="p-3 text-center">Viral Score</th>
                  <th className="p-3 text-center">Est. Views</th>
                  <th className="p-3 text-center">Engagement</th>
                  <th className="p-3 text-center">Shares</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {allClips.map((clip, i) => (
                  <tr key={`${clip.projectId || 'proj'}-${clip.id}-${i}`} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 font-semibold text-white max-w-xs truncate">{clip.title}</td>
                    <td className="p-3 text-center">
                      <span className="rounded-full bg-violet-500/20 text-cyan-300 px-2 py-0.5 font-mono font-bold">
                        {clip.highlightScore}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-white">
                      {clip.views ? `${(clip.views / 1000).toFixed(1)}k` : '142.8k'}
                    </td>
                    <td className="p-3 text-center text-emerald-400 font-semibold">
                      {clip.engagementRate ? `${clip.engagementRate}%` : '8.9%'}
                    </td>
                    <td className="p-3 text-center font-mono text-zinc-400">{clip.shares || 4120}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/projects/${clip.projectId}/clips/${clip.id}`}
                        className="text-cyan-400 font-bold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
