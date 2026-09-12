'use client';

import React, { useState } from 'react';
import { CaptionPreset, CaptionTrack, Clip } from '@/types';
import {
  Subtitles,
  Sparkles,
  Type,
  Palette,
  Sliders,
  Plus,
  Trash2,
  Smile,
  Layers,
  Check,
} from 'lucide-react';

interface CaptionStudioProps {
  clip: Clip;
  onUpdateCaptions: (captions: CaptionTrack) => void;
}

export const CaptionStudio: React.FC<CaptionStudioProps> = ({ clip, onUpdateCaptions }) => {
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'words' | 'styling'>('presets');
  const captions = clip.captions;

  const presets: { id: CaptionPreset; name: string; desc: string; preview: string }[] = [
    {
      id: 'BOLD_CREATOR',
      name: 'Bold Creator',
      desc: 'High-contrast white text with electric cyan active word pop.',
      preview: '⚡ THE BIGGEST MISTAKE',
    },
    {
      id: 'VIRAL_POP',
      name: 'Viral Pop',
      desc: 'Extra-large font, dynamic emojis, and vivid gold highlight.',
      preview: '🔥 4 HOURS TO 4 CLICKS!',
    },
    {
      id: 'KARAOKE_GLOW',
      name: 'Karaoke Glow',
      desc: 'Smooth luminous violet active word glow with subtle backdrop.',
      preview: '✨ Word-by-word active glow',
    },
    {
      id: 'MINIMAL',
      name: 'Minimalist Clean',
      desc: 'Subtle clean typography without borders or shadow.',
      preview: 'Clean modern subtitle text',
    },
    {
      id: 'HIGH_CONTRAST',
      name: 'High Contrast Box',
      desc: 'Solid black backdrop box with bright yellow punch.',
      preview: 'BOXED SUBTITLE',
    },
    {
      id: 'DOCUMENTARY',
      name: 'Cinematic Doc',
      desc: 'Refined serif/sans styling for narrative and storytelling.',
      preview: 'Narrative documentary caption',
    },
  ];

  const applyPreset = (presetId: CaptionPreset) => {
    let updated: Partial<CaptionTrack> = { preset: presetId };

    switch (presetId) {
      case 'BOLD_CREATOR':
        updated = {
          ...updated,
          fontSize: 50,
          textColor: '#FFFFFF',
          highlightColor: '#22D3EE',
          strokeColor: '#000000',
          strokeWidth: 4,
          backgroundColor: 'transparent',
          wordAnimation: true,
        };
        break;
      case 'VIRAL_POP':
        updated = {
          ...updated,
          fontSize: 54,
          textColor: '#FFFFFF',
          highlightColor: '#FBBF24',
          strokeColor: '#000000',
          strokeWidth: 5,
          backgroundColor: 'transparent',
          wordAnimation: true,
          autoEmojis: true,
        };
        break;
      case 'KARAOKE_GLOW':
        updated = {
          ...updated,
          fontSize: 46,
          textColor: '#FFFFFF',
          highlightColor: '#C084FC',
          strokeColor: '#000000',
          strokeWidth: 3,
          backgroundColor: 'rgba(0,0,0,0.5)',
          wordAnimation: true,
        };
        break;
      case 'MINIMAL':
        updated = {
          ...updated,
          fontSize: 42,
          textColor: '#F4F4F5',
          highlightColor: '#10B981',
          strokeColor: '#000000',
          strokeWidth: 0,
          backgroundColor: 'transparent',
          wordAnimation: false,
        };
        break;
      case 'HIGH_CONTRAST':
        updated = {
          ...updated,
          fontSize: 48,
          textColor: '#FEF08A',
          highlightColor: '#FFFFFF',
          strokeColor: '#000000',
          strokeWidth: 2,
          backgroundColor: '#000000',
          wordAnimation: true,
        };
        break;
      case 'DOCUMENTARY':
        updated = {
          ...updated,
          fontSize: 40,
          textColor: '#E4E4E7',
          highlightColor: '#A78BFA',
          strokeColor: '#000000',
          strokeWidth: 2,
          backgroundColor: 'rgba(0,0,0,0.6)',
          wordAnimation: false,
        };
        break;
    }

    onUpdateCaptions({ ...captions, ...updated });
  };

  const handleWordChange = (segIdx: number, wordIdx: number, newWord: string) => {
    const newSegments = [...captions.segments];
    if (!newSegments[segIdx]?.words?.[wordIdx]) return;
    newSegments[segIdx].words[wordIdx].word = newWord;
    newSegments[segIdx].text = newSegments[segIdx].words.map((w) => w.word).join(' ');
    onUpdateCaptions({ ...captions, segments: newSegments });
  };

  const toggleWordHighlight = (segIdx: number, wordIdx: number) => {
    const newSegments = [...captions.segments];
    if (!newSegments[segIdx]?.words?.[wordIdx]) return;
    const curr = newSegments[segIdx].words[wordIdx].highlight;
    newSegments[segIdx].words[wordIdx].highlight = !curr;
    onUpdateCaptions({ ...captions, segments: newSegments });
  };

  return (
    <div className="flex flex-col h-full bg-[#18181B] text-zinc-200">
      {/* Sub Tabs Header */}
      <div className="flex border-b border-zinc-800 p-2 gap-1 bg-zinc-900/60">
        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'presets'
              ? 'bg-violet-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Style Presets
        </button>
        <button
          onClick={() => setActiveSubTab('words')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'words'
              ? 'bg-violet-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Edit Words ({captions.segments.reduce((acc, s) => acc + (s.words?.length || 0), 0)})
        </button>
        <button
          onClick={() => setActiveSubTab('styling')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'styling'
              ? 'bg-violet-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Typography
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* PRESETS TAB */}
        {activeSubTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">
              Select an AI caption preset optimized for short-form retention:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {presets.map((p) => {
                const isSelected = captions.preset === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 shadow-md shadow-violet-500/10'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        {p.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-2">{p.desc}</p>
                    <div className="rounded-lg bg-black/60 p-2 text-center text-xs font-black tracking-wide border border-white/5">
                      {p.preview}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORDS TAB */}
        {activeSubTab === 'words' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Click any word to edit text. Click <span className="text-amber-300 font-bold">✨ Highlight</span> to emphasize keywords.
            </p>

            <div className="space-y-3">
              {captions.segments.map((segment, segIdx) => (
                <div
                  key={segment.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Segment #{segIdx + 1}</span>
                    <span>
                      {segment.startSec}s – {segment.endSec}s
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(segment.words || []).map((w, wIdx) => (
                      <div
                        key={wIdx}
                        className={`group relative inline-flex items-center rounded-lg border px-2 py-1 text-xs transition-all ${
                          w.highlight
                            ? 'border-amber-400 bg-amber-400/20 text-amber-200 font-bold'
                            : 'border-zinc-700 bg-zinc-950 text-white'
                        }`}
                      >
                        <input
                          type="text"
                          value={w.word}
                          onChange={(e) => handleWordChange(segIdx, wIdx, e.target.value)}
                          className="bg-transparent border-0 focus:outline-none w-auto max-w-[90px] font-inherit text-center"
                        />
                        <button
                          onClick={() => toggleWordHighlight(segIdx, wIdx)}
                          className="ml-1 opacity-40 hover:opacity-100 text-[10px]"
                          title="Toggle Highlight Color"
                        >
                          ✨
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STYLING TAB */}
        {activeSubTab === 'styling' && (
          <div className="space-y-4 text-xs">
            {/* Font Size & Position */}
            <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-zinc-300">Font Size ({captions.fontSize}px)</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="64"
                  value={captions.fontSize}
                  onChange={(e) =>
                    onUpdateCaptions({ ...captions, fontSize: parseInt(e.target.value) })
                  }
                  className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-zinc-300">Vertical Position Y ({captions.positionY}%)</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="85"
                  value={captions.positionY}
                  onChange={(e) =>
                    onUpdateCaptions({ ...captions, positionY: parseInt(e.target.value) })
                  }
                  className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <div>
                <label className="block text-zinc-400 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={captions.textColor}
                    onChange={(e) =>
                      onUpdateCaptions({ ...captions, textColor: e.target.value })
                    }
                    className="h-8 w-10 bg-transparent border-0 cursor-pointer"
                  />
                  <span className="font-mono uppercase text-[11px]">{captions.textColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Active Pop Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={captions.highlightColor}
                    onChange={(e) =>
                      onUpdateCaptions({ ...captions, highlightColor: e.target.value })
                    }
                    className="h-8 w-10 bg-transparent border-0 cursor-pointer"
                  />
                  <span className="font-mono uppercase text-[11px]">{captions.highlightColor}</span>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Word-by-Word Active Animation</p>
                  <p className="text-[10px] text-zinc-500">Karaoke-style pop on current spoken word</p>
                </div>
                <input
                  type="checkbox"
                  checked={captions.wordAnimation}
                  onChange={(e) =>
                    onUpdateCaptions({ ...captions, wordAnimation: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-700 text-violet-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div>
                  <p className="font-semibold text-white">Auto-Insert Viral Emojis</p>
                  <p className="text-[10px] text-zinc-500">Adds 🔥, ⚡, 🚀 on sentiment peaks</p>
                </div>
                <input
                  type="checkbox"
                  checked={captions.autoEmojis}
                  onChange={(e) =>
                    onUpdateCaptions({ ...captions, autoEmojis: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-700 text-violet-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
