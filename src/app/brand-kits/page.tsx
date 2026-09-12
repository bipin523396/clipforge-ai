'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import { BrandKit, CaptionPreset } from '@/types';
import {
  Palette,
  Sparkles,
  Save,
  CheckCircle2,
  Upload,
  Type,
  Subtitles,
  Layers,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export default function BrandKitsPage() {
  const { brandKit, updateBrandKit, toast } = useApp();

  const [name, setName] = useState(brandKit.name);
  const [primaryColor, setPrimaryColor] = useState(brandKit.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(brandKit.secondaryColor);
  const [textColor, setTextColor] = useState(brandKit.textColor);
  const [backgroundColor, setBackgroundColor] = useState(brandKit.backgroundColor);
  const [fontFamily, setFontFamily] = useState(brandKit.fontFamily);
  const [watermarkPos, setWatermarkPos] = useState(brandKit.watermarkPos);
  const [defaultCtaText, setDefaultCtaText] = useState(brandKit.defaultCtaText);
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>(brandKit.captionPreset);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandKit({
      name,
      primaryColor,
      secondaryColor,
      textColor,
      backgroundColor,
      fontFamily,
      watermarkPos,
      defaultCtaText,
      captionPreset,
    });
    toast('Brand Kit Updated! 🎨', 'New presets will automatically apply to all newly created clips.', 'success');
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5" />
              <span>Workspace Brand Styling</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Brand Kits & Presets</h1>
            <p className="text-xs text-zinc-400">
              Configure brand colors, logos, caption defaults, and watermarks applied across your projects.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Brand Kit</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Brand Profile Details</h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Brand / Kit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Default Call to Action (CTA)</label>
                <input
                  type="text"
                  value={defaultCtaText}
                  onChange={(e) => setDefaultCtaText(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Color Palette</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Primary Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-12 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs uppercase text-zinc-200">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Secondary Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-9 w-12 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs uppercase text-zinc-200">{secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-9 w-12 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs uppercase text-zinc-200">{textColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Backdrop Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-9 w-12 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs uppercase text-zinc-200">{backgroundColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Watermark & Caption Defaults */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Watermark & Caption Defaults</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Watermark Position</label>
                  <select
                    value={watermarkPos}
                    onChange={(e) => setWatermarkPos(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="top-right">Top-Right (Recommended for 9:16)</option>
                    <option value="top-left">Top-Left</option>
                    <option value="bottom-right">Bottom-Right</option>
                    <option value="bottom-left">Bottom-Left</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Default Caption Preset</label>
                  <select
                    value={captionPreset}
                    onChange={(e) => setCaptionPreset(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="BOLD_CREATOR">Bold Creator (High-Energy)</option>
                    <option value="VIRAL_POP">Viral Pop (Emojis & Gold Pop)</option>
                    <option value="KARAOKE_GLOW">Karaoke Glow (Active Neon)</option>
                    <option value="MINIMAL">Minimalist Clean</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Live Brand Preview Card */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Brand Preview</span>
            </h3>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 aspect-[9/16] relative overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 filter blur-sm"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80')`,
                }}
              />

              {/* Watermark */}
              <div
                className={`absolute z-10 ${
                  watermarkPos === 'top-right'
                    ? 'top-4 right-4'
                    : watermarkPos === 'top-left'
                    ? 'top-4 left-4'
                    : watermarkPos === 'bottom-right'
                    ? 'bottom-8 right-4'
                    : 'bottom-8 left-4'
                }`}
              >
                <div
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow backdrop-blur-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  @{name.toLowerCase().replace(/\s+/g, '')}
                </div>
              </div>

              {/* Top Banner */}
              <div className="relative z-10 text-center pt-2">
                <div
                  className="inline-block rounded-xl px-3 py-1 text-[11px] font-black uppercase text-white shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  TOP HOOK BANNER
                </div>
              </div>

              {/* Simulated Caption */}
              <div className="relative z-10 text-center pb-8 px-2">
                <div className="rounded-xl bg-black/75 backdrop-blur-md p-3 border border-white/10">
                  <p className="text-xs font-black uppercase tracking-wide">
                    <span>THE </span>
                    <span style={{ color: secondaryColor }}>BEST MOMENTS </span>
                    <span>STAND OUT! 🔥</span>
                  </p>
                </div>
                {/* CTA */}
                <p className="mt-2 text-[10px] font-bold text-cyan-300">{defaultCtaText}</p>
              </div>

              {/* Bottom Brand Line */}
              <div
                className="absolute bottom-0 inset-x-0 h-1"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
