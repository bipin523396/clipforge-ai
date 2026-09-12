// AI Provider Abstraction Interfaces

import { AspectRatio, CaptionPreset, CaptionTrack, Clip, Project, ScoreBreakdown, TranscriptSegment } from '@/types';

export interface TranscriptionRequest {
  audioUrlOrBuffer: string;
  language?: string;
  diarize?: boolean;
}

export interface TranscriptionResult {
  fullText: string;
  confidence: number;
  language: string;
  segments: TranscriptSegment[];
}

export interface TranscriptionProvider {
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResult>;
}

export interface HighlightDetectionRequest {
  transcript: TranscriptionResult;
  contentType: string;
  targetDurationSec: [number, number]; // [min, max]
  maxClips?: number;
}

export interface HighlightCandidate {
  startSec: number;
  endSec: number;
  title: string;
  hookStatement: string;
  scoreBreakdown: ScoreBreakdown;
  tags: string[];
}

export interface HighlightDetectionProvider {
  detectHighlights(request: HighlightDetectionRequest): Promise<HighlightCandidate[]>;
}

export interface VideoAnalysisRequest {
  videoUrl: string;
  durationSec: number;
}

export interface VideoAnalysisResult {
  sceneChanges: number[];
  faceTrackingKeyframes: { timestampSec: number; x: number; y: number; confidence: number }[];
  audioEnergyProfile: { timestampSec: number; energy: number }[];
}

export interface VideoAnalysisProvider {
  analyze(request: VideoAnalysisRequest): Promise<VideoAnalysisResult>;
}

export interface CaptionTranslationRequest {
  captions: CaptionTrack;
  targetLanguage: string;
}

export interface CaptionTranslationResult {
  translatedCaptions: CaptionTrack;
  localizedTitle: string;
  localizedDescription: string;
  localizedHashtags: string[];
}

export interface CaptionTranslationProvider {
  translate(request: CaptionTranslationRequest): Promise<CaptionTranslationResult>;
}

export interface CopyGenerationRequest {
  clipTitle: string;
  hook: string;
  transcriptSnippet: string;
  platform: 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE_SHORTS' | 'X' | 'LINKEDIN';
}

export interface CopyGenerationResult {
  title: string;
  caption: string;
  hashtags: string[];
  suggestedPostingTime: string;
  callToAction: string;
}

export interface CopyGenerationProvider {
  generateCopy(request: CopyGenerationRequest): Promise<CopyGenerationResult>;
}

export interface AIEditCommandRequest {
  prompt: string;
  currentClip: Clip;
}

export interface AIEditCommandResult {
  success: boolean;
  message: string;
  modifiedClip: Partial<Clip>;
}

export interface AIEditCommandProvider {
  executeCommand(request: AIEditCommandRequest): Promise<AIEditCommandResult>;
}
