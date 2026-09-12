'use client';

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, CheckCircle2, Flame, ArrowUpRight, Wand2, Layers, Download, Subtitles, Volume2, Share2 } from 'lucide-react';

export const AnimatedHeroMockup: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Dynamic step progression
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Karaoke caption animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const wordInterval = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % 9);
    }, 450);
    return () => clearInterval(wordInterval);
  }, [isPlaying]);

  const words = [
    { text: 'THE', highlight: false },
    { text: 'BIGGEST', highlight: true, color: 'text-cyan-300' },
    { text: 'MISTAKE', highlight: true, color: 'text-violet-400' },
    { text: 'IS', highlight: false },
    { text: 'BUILDING', highlight: false },
    { text: 'IN', highlight: false },
    { text: 'ISOLATION', highlight: true, color: 'text-yellow-400' },
    { text: 'WITHOUT', highlight: false },
    { text: 'FEEDBACK!', highlight: true, color: 'text-emerald-400' },
  ];

  const sampleHighlights = [
    {
      title: 'The #1 Mistake Killing Startups',
      score: 96,
      hook: 'Tension in 1.2s',
      duration: '0:18',
      energy: 'High 🔥',
    },
    {
      title: '4 Hours Reduced to 4 Clicks',
      score: 92,
      hook: 'Problem-Solution',
      duration: '0:24',
      energy: 'Impact ⚡',
    },
    {
      title: 'The 21-Day Validation Rule',
      score: 88,
      hook: 'Actionable Advice',
      duration: '0:31',
      energy: 'Steady 💡',
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-zinc-700/60 bg-[#121215]/95 p-3 sm:p-5 shadow-[0_0_60px_-15px_rgba(139,92,246,0.3)] backdrop-blur-2xl transition-all">
      {/* Top Mock Window Header */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-zinc-400">clipforge-workspace / masterclass-ep42.mp4</span>
        </div>

        {/* Step Indicators */}
        <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveStep(1)}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              activeStep === 1 ? 'bg-violet-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. Ingest
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              activeStep === 2 ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2. AI Highlights (96/100)
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              activeStep === 3 ? 'bg-violet-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3. Dynamic Captions
          </button>
          <button
            onClick={() => setActiveStep(4)}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              activeStep === 4 ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            4. Ready to Publish
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>AI Engine Active</span>
        </div>
      </div>

      {/* Main Studio Grid Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: AI Moment Detector & Scores (5 Cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Discovered Moments (7)</span>
            </h4>
            <span className="text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded font-mono">1080p 60fps</span>
          </div>

          <div className="space-y-2.5">
            {sampleHighlights.map((hl, i) => (
              <div
                key={i}
                onClick={() => setActiveClipIndex(i)}
                className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 ${
                  activeClipIndex === i
                    ? 'border-violet-500/80 bg-gradient-to-r from-violet-950/50 to-zinc-900 shadow-md shadow-violet-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-semibold mb-1">
                      Clip #{i + 1} • {hl.duration}
                    </span>
                    <h5 className="text-sm font-semibold text-white leading-snug">{hl.title}</h5>
                  </div>
                  {/* Viral Score Badge */}
                  <div className="shrink-0 text-center rounded-lg bg-zinc-950 px-2.5 py-1 border border-violet-500/30">
                    <div className="flex items-center gap-0.5 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
                      <Flame className="w-3 h-3 text-cyan-400" />
                      <span>{hl.score}</span>
                    </div>
                    <span className="text-[9px] uppercase font-mono text-zinc-400">Score</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" /> {hl.hook}
                  </span>
                  <span className="text-zinc-400">{hl.energy}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Reframe & Hook Analysis Meter */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-zinc-300 flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> Speaker Face Tracking
              </span>
              <span className="text-emerald-400 font-mono font-bold">100% Centered</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full w-[94%]" />
            </div>
          </div>
        </div>

        {/* Center/Right: 9:16 Vertical Video Preview with Active Captions (4 Cols) */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-violet-500/40 bg-zinc-950 shadow-2xl shadow-violet-950/60 group">
            {/* Background Simulated Video Frame */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
            </div>

            {/* Top Hook Headline Overlay */}
            <div className="absolute top-3 inset-x-3 text-center">
              <div className="inline-block rounded-lg bg-violet-600/90 backdrop-blur-md px-2.5 py-1 shadow-lg border border-violet-400/40">
                <p className="text-[10px] font-black uppercase tracking-wider text-white">
                  🛑 DON'T MAKE THIS ERROR
                </p>
              </div>
            </div>

            {/* Face Tracking Bounding Box simulation */}
            <div className="absolute top-[28%] left-[26%] w-[48%] h-[32%] rounded-xl border border-dashed border-cyan-400/70 bg-cyan-500/10 pointer-events-none flex items-start justify-end p-1">
              <span className="text-[8px] font-mono text-cyan-300 bg-black/70 px-1 rounded">Speaker 1 [98%]</span>
            </div>

            {/* Dynamic Karaoke Word-by-Word Caption Preview */}
            <div className="absolute bottom-16 inset-x-3 text-center">
              <div className="rounded-xl bg-black/70 backdrop-blur-md p-2.5 border border-zinc-700/60 shadow-2xl">
                <p className="text-xs font-black uppercase tracking-wide leading-relaxed">
                  {words.map((w, idx) => (
                    <span
                      key={idx}
                      className={`inline-block mx-0.5 transition-all duration-200 ${
                        idx === activeWordIdx
                          ? 'scale-125 text-yellow-300 font-extrabold drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                          : idx < activeWordIdx
                          ? 'text-white'
                          : 'text-zinc-400'
                      }`}
                    >
                      {w.text}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${((activeWordIdx + 1) / words.length) * 100}%` }}
              />
            </div>

            {/* Watermark */}
            <div className="absolute top-3 right-3 text-[9px] font-bold text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
              @clipforge
            </div>

            {/* Mini Play/Pause overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute bottom-3 left-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          </div>
        </div>

        {/* Right Column: Instant Preset Styling & Multi-Channel Export (3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2.5">
            <h5 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Subtitles className="w-3.5 h-3.5 text-cyan-400" /> Caption Style Preset
            </h5>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="rounded-lg border border-violet-500 bg-violet-500/20 p-2 text-center text-violet-200 font-bold">
                Bold Creator
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-center text-zinc-400">
                Minimalist
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-center text-zinc-400">
                Karaoke Glow
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-center text-zinc-400">
                Viral Pop
              </div>
            </div>
          </div>

          {/* 1-Click Platform Destination Presets */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
            <h5 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-violet-400" /> Publish Presets
            </h5>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded bg-zinc-950 text-zinc-300">
                <span>TikTok (9:16)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-zinc-950 text-zinc-300">
                <span>Instagram Reels</span>
                <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-zinc-950 text-zinc-300">
                <span>YouTube Shorts</span>
                <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
              </div>
            </div>
          </div>

          {/* Export CTA Button simulation */}
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-all">
            <Download className="w-3.5 h-3.5" />
            <span>Export 1080p Clips</span>
          </button>
        </div>
      </div>
    </div>
  );
};
