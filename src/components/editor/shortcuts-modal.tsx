'use client';

import React from 'react';
import { X, Command, Scissors, Play, FastForward, Rewind, Sparkles, Volume2, HelpCircle } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Playback & Navigation',
      shortcuts: [
        { key: 'Space', desc: 'Play / Pause Video' },
        { key: 'J', desc: 'Step Backward 1 Second' },
        { key: 'K', desc: 'Pause Playback' },
        { key: 'L', desc: 'Step Forward 1 Second' },
        { key: 'Home / 0', desc: 'Jump to Clip Beginning' },
      ],
    },
    {
      category: 'Editing & Fast Pacing',
      shortcuts: [
        { key: 'C or S', desc: 'Split / Cut Clip at Current Playhead' },
        { key: 'I', desc: 'Set Trim In-Point at Playhead' },
        { key: 'O', desc: 'Set Trim Out-Point at Playhead' },
        { key: 'B', desc: 'Auto-Trim Dead Space & Breaths (>250ms)' },
      ],
    },
    {
      category: 'Visual Movement & Story Hook',
      shortcuts: [
        { key: 'H', desc: 'Apply 3-Second Visual Hook Punch-in' },
        { key: 'Z', desc: 'Apply Subtle Camera Motion Zoom' },
        { key: 'M', desc: 'Mute / Unmute Audio' },
        { key: '?', desc: 'Toggle This Keyboard Shortcuts Menu' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl rounded-3xl border border-violet-500/40 bg-[#121215] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Keyboard Shortcuts & Pro Commands</h3>
              <p className="text-[11px] text-zinc-400">High-velocity shortcuts for cutting, trimming, and movement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {shortcutGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {grp.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grp.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs text-zinc-300">{sc.desc}</span>
                    <kbd className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono font-bold text-white shadow-sm shrink-0">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tiny Story Architecture Pro Tip */}
          <div className="p-4 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/30 to-cyan-950/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro Viral Storytelling Formula (15s – 45s Shorts)</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              <strong>Act 1: The Hook (0-3s)</strong> – Visual punch-in + curiosity hook statement.<br />
              <strong>Act 2: The Escalation (3s to 75%)</strong> – Fast pacing, cuts on beat, keyword pops, no dead space.<br />
              <strong>Act 3: The Payoff (Last 3-5s)</strong> – Punchline delivery + satisfying CTA resolution.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Press Esc or click outside to dismiss</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
