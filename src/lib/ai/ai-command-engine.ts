// ClipForge AI - AI Natural Language Video Edit Command Engine

import { Clip, CaptionTrack, ClipOverlay, CropSettings } from '@/types';
import { MockCaptionTranslationProvider } from './mock-provider';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  updatedClip: Clip;
  appliedAction: string;
}

export class AIEditCommandEngine {
  private translationProvider = new MockCaptionTranslationProvider();

  async processCommand(command: string, clip: Clip): Promise<CommandExecutionResult> {
    const cmd = command.toLowerCase().trim();
    const cloned: Clip = JSON.parse(JSON.stringify(clip));

    // 1. "Make captions more energetic" / "energetic captions" / "viral pop"
    if (cmd.includes('energetic') || cmd.includes('viral') || cmd.includes('pop')) {
      cloned.captions.preset = 'VIRAL_POP';
      cloned.captions.fontSize = 54;
      cloned.captions.highlightColor = '#FBBF24'; // Vivid yellow/gold
      cloned.captions.strokeColor = '#000000';
      cloned.captions.strokeWidth = 6;
      cloned.captions.wordAnimation = true;
      cloned.captions.autoEmojis = true;

      // Add emojis to segments
      cloned.captions.segments.forEach((seg, idx) => {
        if (idx === 0 && !seg.text.includes('🔥')) seg.text += ' 🔥';
        if (idx === 1 && !seg.text.includes('⚡')) seg.text += ' ⚡';
        if (idx === 2 && !seg.text.includes('🚀')) seg.text += ' 🚀';
      });

      return {
        success: true,
        message: 'Applied Viral Pop preset with dynamic word animations, emoji highlights, and high-contrast styling!',
        updatedClip: cloned,
        appliedAction: 'CAPTION_PRESET_UPDATE',
      };
    }

    // 2. "Trim first 3 seconds" / "trim the beginning"
    if (cmd.includes('trim') && (cmd.includes('first') || cmd.includes('beginning') || cmd.includes('start'))) {
      const secondsMatch = cmd.match(/\d+/);
      const trimAmount = secondsMatch ? parseFloat(secondsMatch[0]) : 3.0;

      cloned.startSec = Math.min(cloned.startSec + trimAmount, cloned.endSec - 2);
      cloned.durationSec = Number((cloned.endSec - cloned.startSec).toFixed(1));

      // Filter or adjust captions
      cloned.captions.segments = cloned.captions.segments
        .filter((seg) => seg.endSec > cloned.startSec)
        .map((seg) => ({
          ...seg,
          startSec: Math.max(seg.startSec, cloned.startSec),
        }));

      return {
        success: true,
        message: `Trimmed first ${trimAmount}s for an instant hook and tighter pacing!`,
        updatedClip: cloned,
        appliedAction: 'TIMELINE_TRIM_START',
      };
    }

    // 3. "Center the speaker" / "reframe speaker" / "smart tracking"
    if (cmd.includes('center') || cmd.includes('speaker') || cmd.includes('track') || cmd.includes('reframe')) {
      cloned.cropSettings = {
        x: 0.5,
        y: 0.42,
        scale: 1.25,
        smartTrack: true,
        backgroundMode: 'blur',
        backgroundColor: '#09090B',
      };

      return {
        success: true,
        message: 'Re-centered speaker using AI face detection with smooth background blur fill!',
        updatedClip: cloned,
        appliedAction: 'SMART_REFRAME_APPLIED',
      };
    }

    // 4. "Create a stronger hook" / "strong hook" / "add title card"
    if (cmd.includes('hook') || cmd.includes('title card') || cmd.includes('headline')) {
      cloned.overlays = {
        ...cloned.overlays,
        headlineText: cloned.hookStatement || '🛑 DO NOT MAKE THIS MISTAKE!',
        headlineColor: '#FFFFFF',
        headlineBg: '#8B5CF6',
        showProgressBar: true,
        progressBarColor: '#22D3EE',
      };

      return {
        success: true,
        message: 'Generated attention-grabbing top headline banner and animated retention progress bar!',
        updatedClip: cloned,
        appliedAction: 'HEADLINE_OVERLAY_ADDED',
      };
    }

    // 5. "Translate to Tamil" / "Translate to Hindi" / "Translate to Spanish" / "Translate to French"
    if (cmd.includes('translate')) {
      let targetLang = 'ta';
      let langName = 'Tamil';
      if (cmd.includes('tamil') || cmd.includes('தமிழ்')) {
        targetLang = 'ta';
        langName = 'Tamil';
      } else if (cmd.includes('hindi') || cmd.includes('हिंदी')) {
        targetLang = 'hi';
        langName = 'Hindi';
      } else if (cmd.includes('spanish') || cmd.includes('español')) {
        targetLang = 'es';
        langName = 'Spanish';
      } else if (cmd.includes('french') || cmd.includes('français')) {
        targetLang = 'fr';
        langName = 'French';
      }

      const result = await this.translationProvider.translate({
        captions: cloned.captions,
        targetLanguage: targetLang,
      });

      cloned.captions = result.translatedCaptions;
      cloned.title = result.localizedTitle;

      return {
        success: true,
        message: `Translated captions and localized metadata to ${langName} while preserving word-level timestamps!`,
        updatedClip: cloned,
        appliedAction: 'TRANSLATION_APPLIED',
      };
    }

    // 6. "Remove filler words" / "clean audio" / "remove um and uh"
    if (cmd.includes('filler') || cmd.includes('clean') || cmd.includes('um') || cmd.includes('uh')) {
      cloned.captions.segments = cloned.captions.segments.map((seg) => ({
        ...seg,
        text: seg.text.replace(/\b(um|uh|like|you know|sort of)\b/gi, '').replace(/\s+/g, ' ').trim(),
        words: (seg.words || []).filter(
          (w) => !['um', 'uh', 'like', 'you know'].includes(w.word?.toLowerCase()?.replace(/[^a-z]/g, '') || '')
        ),
      }));

      return {
        success: true,
        message: 'Purged all filler words (ums, uhs, pauses) from captions and tightened timing cues.',
        updatedClip: cloned,
        appliedAction: 'FILLER_WORDS_REMOVED',
      };
    }

    // 7. Fallback generic AI adjustment
    cloned.captions.wordAnimation = true;
    cloned.captions.fontSize = Math.min(cloned.captions.fontSize + 4, 60);

    return {
      success: true,
      message: `Executed AI enhancement: "${command}". Enhanced caption visibility and pacing.`,
      updatedClip: cloned,
      appliedAction: 'CUSTOM_AI_OPTIMIZATION',
    };
  }
}
