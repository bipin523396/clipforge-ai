'use client';

import React, { useState } from 'react';
import { Clip } from '@/types';
import { AIEditCommandEngine } from '@/lib/ai/ai-command-engine';
import { Sparkles, Send, Wand2, Loader2 } from 'lucide-react';

interface AICommandBarProps {
  clip: Clip;
  onApplyAIChanges: (updatedClip: Clip, message: string) => void;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ clip, onApplyAIChanges }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const engine = new AIEditCommandEngine();

  const quickPrompts = [
    '⚡ Make captions more energetic',
    '✂️ Trim the first 3 seconds',
    '🎯 Center the speaker',
    '🔥 Create a stronger hook',
    '🌍 Translate captions to Tamil',
    '🧼 Remove filler words',
  ];

  const handleExecute = async (commandToRun?: string) => {
    const targetCommand = commandToRun || prompt;
    if (!targetCommand.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await engine.processCommand(targetCommand, clip);
      if (result.success) {
        onApplyAIChanges(result.updatedClip, result.message);
        setPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-[#121215] p-3 space-y-2.5">
      {/* Input Prompt Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecute();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Wand2 className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Ask AI: 'Make captions more energetic', 'Center speaker', 'Translate to Tamil'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
            className="w-full rounded-xl border border-violet-500/40 bg-zinc-950 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isProcessing}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Apply</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        <span className="text-zinc-500 text-[10px] uppercase font-mono mr-1">Quick AI:</span>
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleExecute(q)}
            disabled={isProcessing}
            className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-zinc-300 hover:border-cyan-500/40 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
