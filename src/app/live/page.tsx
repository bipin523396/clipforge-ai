'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import {
  Radio,
  Sparkles,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Activity,
  Sliders,
  Share2,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function LiveStudioPage() {
  const { liveSession, updateLiveSession, approveLiveMoment, rejectLiveMoment, toast } = useApp();
  const [streamUrl, setStreamUrl] = useState(liveSession.rtmpSourceUrl);
  const [minScore, setMinScore] = useState(liveSession.minScoreThreshold || 80);
  const [autoExport, setAutoExport] = useState(liveSession.autoExport);

  const handleSimulateNewMoment = () => {
    const newMomentId = `lm-${Date.now()}`;
    const sampleTitles = [
      'Hot Take: Why vertical video will replace 80% of traditional marketing',
      'Audience Superchat: Reacting to unexpected product launch announcement',
      'Unbelievable reaction to new real-time voice latency benchmark',
    ];
    const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];

    const newMoment = {
      id: newMomentId,
      timestamp: '01:18:45',
      durationSec: 22,
      title: randomTitle,
      score: Math.floor(Math.random() * 12) + 88, // 88-99
      status: 'pending' as const,
      previewUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&auto=format&fit=crop&q=80',
      snippet: 'This is the inflection point where everything shifts into high gear.',
    };

    updateLiveSession({
      moments: [newMoment, ...liveSession.moments],
    });

    toast('New Live Highlight Detected! ⚡', `AI surfaced: "${randomTitle}" (Score ${newMoment.score})`, 'success');
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Broadcast Clipping</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Live Studio Control Deck</h1>
            <p className="text-xs text-zinc-400">
              Ingest live streams, detect moments in near-real-time, and moderate vertical shorts while broadcasting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateNewMoment}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:opacity-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Live Spike</span>
            </button>
          </div>
        </div>

        {/* Stream Health & Ingest Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase">Stream Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-base font-bold text-white">Live Ingesting</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-mono">0 dropped frames</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase">Bitrate / FPS</span>
            <div className="text-base font-bold text-white mt-1 font-mono">
              {liveSession.ingestBitrate} kbps • {liveSession.fps} FPS
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">H.264 / AAC 48kHz</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase">Ingest Latency</span>
            <div className="text-base font-bold text-cyan-300 mt-1 font-mono">
              {liveSession.latencyMs} ms
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Low-latency HLS pipeline</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase">Broadcast Uptime</span>
            <div className="text-base font-bold text-white mt-1 font-mono">
              01:08:40
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Session ID: live-441</p>
          </div>
        </div>

        {/* Main Live Deck: Left Stream Preview, Right Live Moments Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Live Broadcast Monitor */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>Incoming Master Feed</span>
                </span>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 uppercase">
                  LIVE
                </span>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center group">
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
                  alt="Live feed"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-white">Weekly Tech Roundtable AMA</p>
                    <p className="text-[11px] font-mono text-zinc-400">Stream Key: ••••••••••••</p>
                  </div>
                </div>
              </div>

              {/* Ingest Source config */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-[11px] font-semibold text-zinc-400">RTMP Ingest Source</label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Moderation Preferences */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real-Time Detection Thresholds</span>
              </span>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Min Viral Score ({minScore}/100)</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div>
                  <p className="font-semibold text-white">Auto-Export Approved Moments</p>
                  <p className="text-[10px] text-zinc-500">Push to TikTok/Reels queue upon approval</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoExport}
                  onChange={(e) => setAutoExport(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 text-violet-600"
                />
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Real-Time Moment Detector Stream */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Detected Live Moments Queue ({liveSession.moments.length})</span>
                </h3>
                <p className="text-xs text-zinc-400">Approve moments to trigger immediate 9:16 reframe & captions.</p>
              </div>
            </div>

            <div className="space-y-3">
              {liveSession.moments.map((moment) => (
                <div
                  key={moment.id}
                  className={`rounded-3xl border p-4 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${
                    moment.status === 'approved'
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : moment.status === 'rejected'
                      ? 'border-zinc-850 bg-zinc-950/40 opacity-40'
                      : 'border-zinc-800 bg-zinc-900/70 hover:border-violet-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-14 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                      <img src={moment.previewUrl} alt={moment.title} className="h-full w-full object-cover" />
                      <div className="absolute top-1 left-1 rounded bg-black/80 px-1 text-[8px] font-mono text-cyan-300 font-bold">
                        {moment.score}
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {moment.timestamp} • {moment.durationSec}s
                        </span>
                        {moment.status === 'approved' && (
                          <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                            Approved
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{moment.title}</h4>
                      <p className="text-[11px] text-zinc-400 italic line-clamp-1">"{moment.snippet}"</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {moment.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => rejectLiveMoment(moment.id)}
                          className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Dismiss Moment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => approveLiveMoment(moment.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-zinc-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Clip</span>
                        </button>
                      </>
                    ) : moment.status === 'approved' ? (
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs font-bold hover:bg-violet-600 hover:text-white transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Publish Short</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-600">Dismissed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
