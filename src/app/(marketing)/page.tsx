'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AnimatedHeroMockup } from '@/components/animated-hero-mockup';
import {
  Sparkles,
  ArrowRight,
  Play,
  Flame,
  Wand2,
  Crop,
  Subtitles,
  Languages,
  Palette,
  Layers,
  Radio,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Star,
  Quote,
  Shield,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [activeUseCase, setActiveUseCase] = useState<'podcasters' | 'streamers' | 'marketers' | 'educators' | 'musicians' | 'agencies'>('podcasters');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const useCases = {
    podcasters: {
      title: 'For Podcasters & Long-form Interviewers',
      desc: 'Stop spending 12 hours every week scrubbing through 2-hour episodes. ClipForge AI extracts the highest-voltage banter, debate hooks, and golden soundbites instantly.',
      features: ['Speaker diarization with split-screen reframing', 'Viral hook extraction scoring (0-100)', 'Word-by-word animated karaoke captions'],
      quote: '“We went from posting 1 clip a week to 15 vertical shorts across TikTok and Reels. Our podcast downloads doubled in 30 days.”',
      author: 'Marcus Vance, Host of The Modern Frontier Show',
    },
    streamers: {
      title: 'For Twitch, Kick & YouTube Streamers',
      desc: 'Never let your epic clutch plays or hilarious chat reactions get buried in 8-hour VODs. ClipForge AI tags high-energy audio spikes and chat reactions automatically.',
      features: ['Live Studio background clipping while streaming', 'Facecam + gameplay vertical framing presets', 'Sound effect & reaction emoji highlight badges'],
      quote: '“While I’m live, ClipForge has already drafted 6 viral moments ready for TikTok approval the minute I end broadcast.”',
      author: 'Kira ‘PixelVibe’ Lin, Competitive Gaming Streamer',
    },
    marketers: {
      title: 'For B2B & Growth Marketing Teams',
      desc: 'Turn product demos, webinars, customer testimonials, and company all-hands into high-converting organic video collateral that fills your pipeline.',
      features: ['Corporate brand kits & custom font styling', 'Multi-channel metadata & hashtag generators', '1080p watermark-free batch exports'],
      quote: '“Repurposing our webinars used to require a dedicated freelance agency. Now our junior SDR creates 10 shorts in 20 minutes.”',
      author: 'Elena Rostova, VP of Growth at PulseStack',
    },
    educators: {
      title: 'For Course Creators & Keynote Speakers',
      desc: 'Slice 60-minute lectures into bite-sized educational nuggets that teach one core concept per video, driving signups to your premium courses.',
      features: ['Slide & speaker auto-layout switching', 'Multilingual translation in 10+ languages', 'Custom branded intro/outro card templates'],
      quote: '“Our educational shorts on LinkedIn are driving over 40% of our new academy enrollments.”',
      author: 'Dr. Tariq Ahmed, AI Academy Founder',
    },
    musicians: {
      title: 'For Musicians, Producers & Audio Artists',
      desc: 'Highlight chorus drops, acoustic jam sessions, and behind-the-scenes studio breakthroughs with rhythm-synchronized animated captions.',
      features: ['Audio beat detection for snappy cuts', 'Cinematic widescreen background blur', 'Custom typography and color themes'],
      quote: '“ClipForge helped my studio acoustic session go viral on Instagram Reels with 1.2M views.”',
      author: 'Devon Cruz, Indie Artist & Producer',
    },
    agencies: {
      title: 'For Social Media & Creative Agencies',
      desc: 'Scale clip production for 50+ client brands simultaneously with workspace RBAC, segregated brand kits, and bulk queue processing.',
      features: ['Unlimited client brand kits & custom logos', 'Team member roles (Owner, Admin, Editor)', 'Priority rendering queue and API webhooks'],
      quote: '“We replaced three separate editing subscriptions with ClipForge AI Studio. It is our agency’s secret weapon.”',
      author: 'Sophie Martin, Founder of Apex Social Agency',
    },
  };

  const faqs = [
    {
      q: 'How does ClipForge AI detect the best highlights in a video?',
      a: 'Our multi-agent pipeline analyzes audio energy peaks, speech pacing, emotional inflection, topic transitions, hook question phrasing, and visual scene changes. Each segment receives an explainable 0–100 highlight score breakdown covering hook strength, standalone context, and clarity.',
    },
    {
      q: 'Does ClipForge AI support automatic vertical 9:16 reframing?',
      a: 'Yes! Our computer vision tracking identifies the primary speaker or faces in horizontal 16:9 recordings and automatically centers them into 9:16 vertical or 1:1 square aspect ratios, complete with blurred background fills or custom brand gradients.',
    },
    {
      q: 'Can I translate captions into languages like Tamil, Hindi, Spanish, or French?',
      a: 'Absolutely. ClipForge AI supports timestamp-preserving translation across English, Tamil, Hindi, Spanish, French, German, Portuguese, Arabic, Japanese, and Korean, allowing you to reach global audiences effortlessly.',
    },
    {
      q: 'What is Live Studio clipping mode?',
      a: 'Live Studio lets you connect an ongoing RTMP or livestream URL. As the broadcast runs in real-time, our backend ingests the stream and surfaces draft short clips for moderation and 1-click social publishing before your stream even finishes.',
    },
    {
      q: 'Can I customize brand colors, logos, and fonts for multiple clients?',
      a: 'Yes. Workspace brand kits let you upload logos, specify primary/secondary hex colors, select custom Google fonts, configure watermark positions, and save custom caption templates that apply automatically across all new clips.',
    },
    {
      q: 'Can I download the raw MP4 and subtitle SRT/VTT files?',
      a: 'Yes! You can download high-definition MP4 video files (up to 4K on Studio plans) as well as standardized .SRT and .VTT caption files with precise timestamps.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Glowing Background Orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-violet-600/20 via-purple-600/15 to-cyan-500/20 blur-[130px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-medium text-violet-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>Next-Gen Video Repurposing Engine 2.0</span>
              <span className="hidden sm:inline text-zinc-500">•</span>
              <span className="hidden sm:inline text-cyan-300 font-semibold">Live Clipping Studio Available</span>
            </div>
          </div>

          {/* Hero Headline & Copy */}
          <div className="mt-8 text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Turn every long video into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300">
                short-form content
              </span>{' '}
              that performs.
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Upload a recording or connect a stream. ClipForge AI finds standout moments, edits them into ready-to-publish shorts, and keeps your brand consistent.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-violet-600/25 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Create clips free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-7 py-3.5 text-base font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-md"
              >
                <Play className="w-4 h-4 fill-current text-cyan-400" />
                <span>Try Live Demo</span>
              </Link>
            </div>

            {/* Micro guarantees */}
            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free 300 minutes included
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1080p 60fps exports
              </span>
            </div>
          </div>

          {/* Interactive Animated Product Mockup */}
          <div className="mt-14 lg:mt-20">
            <AnimatedHeroMockup />
          </div>
        </div>
      </section>

      {/* Social Proof Section (Generic Verified Placeholder Logos) */}
      <section className="border-y border-zinc-850 bg-zinc-950/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8">
            Powering short-form workflows for 3,500+ top creator studios & media teams
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-center opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center justify-center gap-2 font-black text-sm text-zinc-300">
              <span className="h-4 w-4 rounded-full bg-violet-500" /> APEX MEDIA
            </div>
            <div className="flex items-center justify-center gap-2 font-black text-sm text-zinc-300">
              <span className="h-4 w-4 rounded-md bg-cyan-400" /> VELOCITY PODS
            </div>
            <div className="flex items-center justify-center gap-2 font-black text-sm text-zinc-300">
              <span className="h-4 w-4 rounded-tr-lg bg-emerald-400" /> STRATA AUDIO
            </div>
            <div className="flex items-center justify-center gap-2 font-black text-sm text-zinc-300">
              <span className="h-4 w-4 rounded-sm bg-purple-400" /> PULSE LABS
            </div>
            <div className="flex items-center justify-center gap-2 font-black text-sm text-zinc-300">
              <span className="h-4 w-4 rounded-full bg-yellow-400" /> NEXUS CREATIVE
            </div>
            <div className="flex items-center justify-center gap-2 font-black text-sm text-zinc-300">
              <span className="h-4 w-4 rounded-md bg-pink-400" /> ELEVATE MEDIA
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Grid */}
      <section id="features" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Full-Stack AI Video Engine</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Everything you need to turn raw recordings into viral gold.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg">
              Engineered with explainable AI scoring, custom typography controls, and cross-platform publishing presets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: AI Highlight Discovery */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-violet-500/50 hover:bg-zinc-900 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Highlight Discovery</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Detects peak emotional intensity, debate punchlines, topic shifts, and questions with an explainable 0–100 viral score breakdown.
              </p>
            </div>

            {/* Feature 2: Smart Auto Reframing */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-5 group-hover:scale-110 transition-transform">
                <Crop className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Intelligent Auto-Reframing</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Follows the active speaker with face tracking in 9:16 vertical, 1:1 square, or split-screen layouts with smart blurred backdrops.
              </p>
            </div>

            {/* Feature 3: Dynamic Animated Captions */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Subtitles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Editable Word-Level Captions</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                99% accurate speech-to-text with karaoke glow, bold creator presets, auto emoji insertion, and keyword highlight controls.
              </p>
            </div>

            {/* Feature 4: Multilingual Subtitles */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-purple-500/50 hover:bg-zinc-900 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-5 group-hover:scale-110 transition-transform">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multilingual Subtitles</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Translate captions into Tamil, Hindi, Spanish, French, German, Arabic, Japanese, and Korean while preserving word timestamps.
              </p>
            </div>

            {/* Feature 5: Workspace Brand Kits */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-pink-500/50 hover:bg-zinc-900 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Workspace Brand Kits</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Store logo watermarks, custom hex palettes, typography preferences, intro/outro cards, and default call-to-action overlays.
              </p>
            </div>

            {/* Feature 6: Batch 1080p Exports */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-amber-500/50 hover:bg-zinc-900 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Batch Exports & Publishing</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Export 5–20 clips in one click. Generate platform-tailored viral hooks, descriptions, hashtags, and optimal posting times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section id="workflow" className="py-20 border-t border-zinc-850 bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Streamlined Creator Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">From raw video to published short in 4 steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 relative">
              <span className="text-4xl font-black text-violet-500/30 font-mono">01</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Upload or Connect</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drop an MP4/MOV file, paste a YouTube link, or connect an ongoing live stream broadcast.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 relative">
              <span className="text-4xl font-black text-cyan-400/30 font-mono">02</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">AI Identifies Moments</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our intelligence pipeline transcribes, diarizes, and scores every punchy segment from 0 to 100.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 relative">
              <span className="text-4xl font-black text-emerald-400/30 font-mono">03</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Fine-tune in Editor</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Use natural language AI commands, customize caption fonts, reframe speakers, and add headline banners.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 relative">
              <span className="text-4xl font-black text-purple-400/30 font-mono">04</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Export and Publish</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Download 1080p MP4s, download SRT subtitles, or push directly to TikTok, Instagram Reels, and YouTube Shorts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Clipping Section Showcase */}
      <section className="py-20 border-t border-zinc-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-zinc-900 to-cyan-950/30 p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                  <span>LIVE CLIPPING STUDIO</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Generate draft short clips during your broadcast in real-time.
                </h2>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  ClipForge AI ingests live stream RTMP/HLS feeds, detects standout highlights while you are still speaking, and places them into your moderator deck. Approve, trim, or publish shorts before your stream concludes.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/live"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-95 transition-opacity"
                  >
                    <span>Launch Live Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Live Mock Card */}
              <div className="rounded-2xl border border-zinc-700/70 bg-zinc-950/80 p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-white">Live Stream Ingest Active</span>
                  </div>
                  <span className="font-mono text-xs text-zinc-400">Latency: 140ms</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="rounded-xl border border-violet-500/40 bg-zinc-900/80 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-300 uppercase">New Highlight (Score 96)</span>
                      <p className="font-bold text-white">"OpenAI API latency breakthrough discussion"</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">Approved</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Detected 2 mins ago</span>
                      <p className="font-medium text-zinc-300">"Audience Q&A: Algorithm pacing breakdown"</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 font-semibold">Pending Review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Interactive Tabs */}
      <section id="solutions" className="py-20 border-t border-zinc-850 bg-zinc-950/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Engineered for Creators</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Tailored for your content format</h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {(['podcasters', 'streamers', 'marketers', 'educators', 'musicians', 'agencies'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveUseCase(key)}
                className={`rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold capitalize transition-all ${
                  activeUseCase === key
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Active Tab Content Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">{useCases[activeUseCase].title}</h3>
            <p className="text-zinc-400 text-sm sm:text-base mb-6 leading-relaxed">
              {useCases[activeUseCase].desc}
            </p>

            <div className="space-y-2.5 mb-8">
              {useCases[activeUseCase].features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Testimonial Quote */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-5">
              <Quote className="w-5 h-5 text-violet-400 mb-2" />
              <p className="text-sm italic text-zinc-300 mb-2">{useCases[activeUseCase].quote}</p>
              <p className="text-xs font-semibold text-cyan-300">— {useCases[activeUseCase].author} <span className="text-zinc-400 font-normal">(Demo Testimonial)</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 border-t border-zinc-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Scale your content without breaking the bank</h2>
            <p className="text-zinc-400 text-sm">Choose the plan that fits your processing volume.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            {/* Starter */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
              <div>
                <h4 className="text-lg font-bold text-white">Starter</h4>
                <p className="text-xs text-zinc-400 mt-1">For hobbyists and beginner creators</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-white">$19</span>
                  <span className="text-xs text-zinc-400"> / month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 120 processing minutes / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 720p HD exports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto word captions</li>
                <li className="flex items-center gap-2 text-zinc-400"><CheckCircle2 className="w-4 h-4 text-zinc-400" /> ClipForge watermark included</li>
              </ul>
              <Link href="/signup" className="block w-full text-center py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700">
                Get Started
              </Link>
            </div>

            {/* Creator (Most Popular) */}
            <div className="rounded-2xl border-2 border-violet-500 bg-gradient-to-b from-violet-950/40 to-zinc-900 p-6 space-y-5 relative shadow-xl shadow-violet-500/10">
              <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-0.5 text-[10px] font-black uppercase text-zinc-950">
                Most Popular
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Creator</h4>
                <p className="text-xs text-zinc-400 mt-1">For active podcasters & creators</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-white">$49</span>
                  <span className="text-xs text-zinc-400"> / month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 600 processing minutes / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1080p 60fps exports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No watermark</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3 Workspace Brand Kits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multilingual translation</li>
              </ul>
              <Link href="/signup" className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20">
                Start Creator Trial
              </Link>
            </div>

            {/* Studio */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
              <div>
                <h4 className="text-lg font-bold text-white">Studio</h4>
                <p className="text-xs text-zinc-400 mt-1">For teams, networks & agencies</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-white">$129</span>
                  <span className="text-xs text-zinc-400"> / month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2,000 processing minutes / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4K Ultra-HD exports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live Studio mode included</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Brand Kits & Team RBAC</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated API & Webhooks</li>
              </ul>
              <Link href="/signup" className="block w-full text-center py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700">
                Contact Studio Sales
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/pricing" className="text-sm font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1">
              <span>View full feature comparison matrix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 border-t border-zinc-850 bg-zinc-950/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Frequently Asked Questions</span>
            <h2 className="text-3xl font-black text-white">Got questions? We've got answers.</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-4 ${
                      openFaq === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-r from-violet-900/50 via-purple-900/40 to-cyan-900/50 p-10 sm:p-14 text-center space-y-6 shadow-2xl relative">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to transform your long videos into viral shorts?
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto">
              Join thousands of podcasters, streamers, and marketing teams scaling organic video reach with ClipForge AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="rounded-xl bg-white px-8 py-3.5 text-sm font-black text-zinc-950 shadow-xl hover:bg-zinc-100 hover:scale-105 transition-all"
              >
                Start Creating Free Today
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/20 bg-black/40 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-black/60 transition-all"
              >
                Explore Demo Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
