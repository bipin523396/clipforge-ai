'use client';

import React from 'react';
import { Clip, AspectRatio, CropSettings, ClipOverlay } from '@/types';
import {
  Crop,
  Layers,
  Sparkles,
  Sliders,
  Type,
  Palette,
  Maximize2,
  Check,
  Shield,
  Radio,
  Volume2,
  Wand2,
  Zap,
} from 'lucide-react';

interface InspectorPanelProps {
  clip: Clip;
  onUpdateClip: (updates: Partial<Clip>) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ clip, onUpdateClip }) => {
  const { aspectRatio, cropSettings, overlays, title } = clip;

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    onUpdateClip({ aspectRatio: ratio });
  };

  const handleCropChange = (updates: Partial<CropSettings>) => {
    onUpdateClip({
      cropSettings: { ...cropSettings, ...updates },
    });
  };

  const handleOverlayChange = (updates: Partial<ClipOverlay>) => {
    onUpdateClip({
      overlays: { ...overlays, ...updates },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#18181B] text-zinc-200 p-4 space-y-6 overflow-y-auto">
      {/* 1. Face Framing & Safe Headroom Optimizer (Fixes Face Zoom) */}
      <div className="space-y-3 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Face Framing & Headroom Optimizer</span>
            </p>
            <p className="text-[10px] text-zinc-400">Eliminates over-zoom; preserves natural speaker framing</p>
          </div>
        </div>

        {/* Framing Presets */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-semibold text-zinc-300">Framing Mode</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleCropChange({ backgroundMode: 'blur', scale: 1.0 })}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                cropSettings.backgroundMode === 'blur' && (cropSettings.scale || 1.0) <= 1.05
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Smart Fit (Ambient Blur)
              <span className="block text-[9px] font-normal text-zinc-500">Zero zoom • Natural head</span>
            </button>

            <button
              type="button"
              onClick={() => handleCropChange({ backgroundMode: 'none', scale: 1.25 })}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                (cropSettings.scale || 1.0) > 1.05
                  ? 'border-violet-400 bg-violet-950/80 text-violet-300 shadow'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Balanced Portrait
              <span className="block text-[9px] font-normal text-zinc-500">Safe headroom • Centered</span>
            </button>
          </div>
        </div>

        {/* Zoom Scale Slider */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300">Scale / Zoom ({((cropSettings.scale || 1.0) * 100).toFixed(0)}%)</span>
            <span className="text-cyan-400 font-mono text-[10px]">
              {(cropSettings.scale || 1.0) <= 1.0 ? 'Natural Full View' : 'Cropped'}
            </span>
          </div>
          <input
            type="range"
            min="0.85"
            max="2.0"
            step="0.05"
            value={cropSettings.scale || 1.0}
            onChange={(e) => handleCropChange({ scale: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-cyan-400"
          />
        </div>

        {/* AI Face Track Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-semibold text-white">AI Face & Speaker Tracking</p>
            <p className="text-[10px] text-zinc-500">Auto-centers speaker bounding box</p>
          </div>
          <input
            type="checkbox"
            checked={cropSettings.smartTrack ?? true}
            onChange={(e) => handleCropChange({ smartTrack: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 text-cyan-600 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* 2. YouTube Channel Logo & Watermark Shield (Removes Foreign YouTuber Logos) */}
      <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>YouTuber Logo & Watermark Shield</span>
            </p>
            <p className="text-[10px] text-zinc-400">Masks source channel handles & corner logos</p>
          </div>
          <input
            type="checkbox"
            checked={overlays.watermarkOpacity !== 0}
            onChange={(e) =>
              handleOverlayChange({
                watermarkOpacity: e.target.checked ? 1 : 0,
                watermarkPos: 'bottom-right',
              })
            }
            className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          <label className="block text-[11px] font-semibold text-zinc-300">Shield Corner Position</label>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            {[
              { id: 'bottom-right', label: 'Bottom Right' },
              { id: 'top-right', label: 'Top Right' },
              { id: 'bottom-left', label: 'Bottom Left' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleOverlayChange({ watermarkPos: p.id as any })}
                className={`py-1.5 rounded-lg border text-center font-semibold transition-all ${
                  (overlays.watermarkPos || 'bottom-right') === p.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Situational Audio & Voice Filter */}
      <div className="space-y-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
        <div>
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Situational Voice Audio Filter</span>
          </p>
          <p className="text-[10px] text-zinc-400">Normalizes loudness to -14 LUFS & matches voice situation</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2 rounded-xl bg-black/60 border border-cyan-500/30 text-cyan-300">
            <span className="block font-bold">Comedy / Punchline</span>
            <span className="text-[9px] text-zinc-400">Crisp presence + laugh leveler</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-zinc-800 text-zinc-300">
            <span className="block font-bold">Studio Clarity</span>
            <span className="text-[9px] text-zinc-500">Deep bass + noise cut</span>
          </div>
        </div>
      </div>

      {/* 4. Canvas Aspect Ratio */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Crop className="w-3.5 h-3.5 text-cyan-300" />
          <span>Canvas Aspect Ratio</span>
        </label>
        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          {[
            { id: '9:16', label: '9:16 Shorts' },
            { id: '1:1', label: '1:1 Square' },
            { id: '16:9', label: '16:9 Wide' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => handleAspectRatioChange(r.id as any)}
              className={`py-2 rounded-xl border text-center transition-all ${
                aspectRatio === r.id
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Visual Overlays Inspector */}
      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Visual Overlays</span>
        </label>

        {/* Top Headline Banner */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-zinc-300">Top Hook Headline</label>
          <input
            type="text"
            placeholder="🛑 MUST-WATCH MOMENT"
            value={overlays?.headlineText || ''}
            onChange={(e) => handleOverlayChange({ headlineText: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Channel Name Watermark */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-zinc-300">Channel Name Watermark (Burned on Video)</label>
          <input
            type="text"
            placeholder="e.g. @ShriHarivanshi108 or MY CHANNEL"
            value={overlays?.channelName || ''}
            onChange={(e) => handleOverlayChange({ channelName: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <p className="text-[10px] text-zinc-500">Permanently attached as a branded channel watermark onto the video.</p>
        </div>

        {/* Progress Bar Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-semibold text-white">Retention Progress Bar</p>
            <p className="text-[10px] text-zinc-500">Animated bottom duration bar</p>
          </div>
          <input
            type="checkbox"
            checked={overlays?.showProgressBar ?? true}
            onChange={(e) => handleOverlayChange({ showProgressBar: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 text-violet-600"
          />
        </div>

        {/* CTA Text */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-semibold text-zinc-300">Call-to-Action Text</label>
          <input
            type="text"
            placeholder="Follow @clipforge for daily secrets"
            value={overlays?.ctaText || ''}
            onChange={(e) => handleOverlayChange({ ctaText: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Video Title Meta */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Clip Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdateClip({ title: e.target.value })}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
