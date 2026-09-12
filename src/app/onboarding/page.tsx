'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand-logo';
import { useApp } from '@/lib/store';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Tv,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Music2,
  Users,
  Palette,
  Subtitles,
  Upload,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateWorkspace, updateBrandKit } = useApp();
  const [step, setStep] = useState<number>(1);

  // Step 1: Role
  const [role, setRole] = useState<string>('podcaster');
  // Step 2: Content Category & Platforms
  const [category, setCategory] = useState<string>('tech');
  const [platform, setPlatform] = useState<string>('tiktok');
  // Step 3: Language & Caption preset
  const [language, setLanguage] = useState<string>('en');
  const [captionPreset, setCaptionPreset] = useState<any>('BOLD_CREATOR');
  // Step 4: Brand Name & Colors
  const [brandName, setBrandName] = useState<string>('My Creator Studio');
  const [primaryColor, setPrimaryColor] = useState<string>('#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState<string>('#22D3EE');

  const handleFinish = () => {
    updateWorkspace({ name: brandName });
    updateBrandKit({
      name: brandName,
      primaryColor,
      secondaryColor,
      captionPreset,
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[750px] rounded-full bg-violet-600/10 blur-[140px]" />

      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between relative z-10 border-b border-zinc-800/80 pb-4">
        <BrandLogo size="md" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Step {step} of 4</span>
          <div className="h-2 w-32 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Wizard Step Box */}
      <div className="max-w-2xl mx-auto w-full my-8 relative z-10">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* STEP 1: Persona */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Personalize Your Workspace</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">What best describes you?</h2>
                <p className="text-xs sm:text-sm text-zinc-400">We'll tailor highlight models and clip pacing to your niche.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'podcaster', label: 'Podcaster', icon: Tv, desc: 'Interviews & Shows' },
                  { id: 'streamer', label: 'Streamer', icon: Gamepad2, desc: 'Gaming & Reactions' },
                  { id: 'marketer', label: 'Marketer', icon: Briefcase, desc: 'B2B & SaaS Demos' },
                  { id: 'educator', label: 'Educator', icon: GraduationCap, desc: 'Courses & Keynotes' },
                  { id: 'musician', label: 'Musician', icon: Music2, desc: 'Performances & Jams' },
                  { id: 'agency', label: 'Agency', icon: Users, desc: 'Client Campaigns' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setRole(item.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/15'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-violet-300' : 'text-zinc-400'}`} />
                      <p className="font-bold text-sm text-white">{item.label}</p>
                      <p className="text-[11px] text-zinc-400">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Content Niche & Platforms */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Publishing Target</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Where do you post short-form videos?</h2>
                <p className="text-xs sm:text-sm text-zinc-400">Select your primary channel for automated copy and aspect presets.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Primary Channel</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'tiktok', label: 'TikTok (9:16)' },
                      { id: 'reels', label: 'Instagram Reels' },
                      { id: 'shorts', label: 'YouTube Shorts' },
                      { id: 'x', label: 'X / Twitter' },
                      { id: 'linkedin', label: 'LinkedIn Video' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          platform === p.id
                            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Content Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="tech">Technology & AI</option>
                    <option value="business">Business & Startups</option>
                    <option value="gaming">Gaming & Esports</option>
                    <option value="education">Education & Science</option>
                    <option value="entertainment">Comedy & Entertainment</option>
                    <option value="lifestyle">Health, Fitness & Lifestyle</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Subtitles & Languages */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Captions & Localization</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Choose your caption aesthetic</h2>
                <p className="text-xs sm:text-sm text-zinc-400">All captions feature word-by-word active timing and auto-emojis.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Primary Audio & Subtitle Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs sm:text-sm text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="en">English (US / UK / Global)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="pt">Portuguese (Português)</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="ja">Japanese (日本語)</option>
                    <option value="ko">Korean (한국어)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Default Caption Style Preset</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'BOLD_CREATOR', name: 'Bold Creator', preview: '⚡ THE BIGGEST MISTAKE' },
                      { id: 'VIRAL_POP', name: 'Viral Pop', preview: '🔥 4 HOURS TO 4 CLICKS' },
                      { id: 'KARAOKE_GLOW', name: 'Karaoke Glow', preview: '✨ Word-by-word pop' },
                      { id: 'MINIMAL', name: 'Minimalist Clean', preview: 'Clean modern subtitle' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setCaptionPreset(style.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          captionPreset === style.id
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <p className="font-bold text-xs text-white">{style.name}</p>
                        <p className="mt-1 font-mono text-[11px] text-zinc-300">{style.preview}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Brand Kit Setup */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Brand Identity</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Set up your brand style</h2>
                <p className="text-xs sm:text-sm text-zinc-400">Automatically applied to watermark, headline banners, and accents.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Workspace / Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-12 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-zinc-300 uppercase">{primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Secondary Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-10 w-12 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-zinc-300 uppercase">{secondaryColor}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Logo
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Default Watermark Preview</p>
                      <p className="text-[11px] text-zinc-500">Top-right 9:16 overlay</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-xs font-black text-zinc-950 shadow-lg shadow-emerald-500/25 hover:opacity-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enter Studio Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-zinc-500">
        ClipForge AI SaaS • All settings can be adjusted later in Workspace Settings.
      </div>
    </div>
  );
}
