// ClipForge AI - Core Type Definitions

export type Role = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type PlanTier = 'STARTER' | 'CREATOR' | 'STUDIO';
export type AspectRatio = '9:16' | '1:1' | '16:9';
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'TRANSCRIBING' | 'ANALYZING' | 'SCORING' | 'RENDERING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type CaptionPreset = 
  | 'BOLD_CREATOR' 
  | 'MINIMAL' 
  | 'KARAOKE_GLOW' 
  | 'DOCUMENTARY' 
  | 'HIGH_CONTRAST' 
  | 'VIRAL_POP';

export interface WordTiming {
  word: string;
  startSec: number;
  endSec: number;
  highlight?: boolean;
}

export interface CaptionSegment {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  words: WordTiming[];
}

export interface CaptionTrack {
  id: string;
  clipId: string;
  language: string;
  preset: CaptionPreset;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  positionY: number; // 0-100 percentage from top
  wordAnimation: boolean;
  autoEmojis: boolean;
  segments: CaptionSegment[];
}

export interface RetentionRiskPoint {
  timestampSec: number;
  retentionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  dropOffReason: string;
  recommendation?: string;
}

export interface PostRenderQAReport {
  technicalScore: number; // 0-100
  hookStrength3s: number; // 0-100
  visualPacingScore: number; // 0-100
  captionQualityScore: number; // 0-100
  audioClarityScore: number; // 0-100
  reframingScore: number; // 0-100
  deadSpaceRemovalScore: number; // 0-100
  overallQualityScore: number; // 0-100
  qualityStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
  retentionCurve: RetentionRiskPoint[];
  critiquePoints: string[];
  reEditRecommendations: string[];
  iterationCount: number;
  evaluatedAt: string;
}

export interface IterationRecord {
  version: number;
  score: number;
  changesSummary: string;
  timestamp: string;
}

export interface ScoreBreakdown {
  overallScore: number;
  sourcePotentialScore?: number;
  editQualityScore?: number;
  postRenderQualityScore?: number;
  hookStrength: number;
  emotionalEnergy: number;
  clarityScore: number;
  standaloneContext: number;
  pacingScore: number;
  visualInterest: number;
  trendRelevance?: number;
  explanationText: string;
  cerebrasDeepScore?: {
    hook: number;
    curiosity: number;
    emotion: number;
    value: number;
    story: number;
    retention: number;
    standalone: number;
    total: number;
  };
}

export interface EditDecisionAction {
  id: string;
  timeRange: [number, number]; // [startSec, endSec]
  editType: 'punch_in' | 'zoom_out' | 'subtle_pan' | 'kinetic_caption' | 'keyword_emphasis' | 'supporting_visual' | 'sound_effect';
  captionStyle?: string;
  emphasisWords?: string[];
  visualQuery?: string;
  soundEffectType?: string;
  reason?: string;
}

export interface EditDecisionList {
  clipId: string;
  actions: EditDecisionAction[];
  pacingNotes: string;
  recommendedVisuals: Array<{ query: string; timestamp: number; type: string }>;
}

export interface TrendIntelligence {
  topic: string;
  trendScore: number; // 0-100
  source: 'serpapi' | 'zenserp' | 'fallback';
  searchVolumeSignal: 'viral' | 'high' | 'rising' | 'moderate' | 'niche';
  relatedQueries: string[];
  currentDiscussions: string[];
  sentimentSummary?: string;
  searchedAt: string;
}

export interface ClipOverlay {
  headlineText?: string;
  headlineHighlight?: string;
  headlineStyle?: 'yellow_white' | 'fire_orange' | 'neon_cyan' | 'none' | string;
  headlineColor?: string;
  headlineBg?: string;
  showProgressBar: boolean;
  progressBarColor: string;
  ctaText?: string;
  ctaPosition?: 'top' | 'bottom';
  watermarkUrl?: string;
  watermarkPos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  watermarkOpacity?: number;
  channelName?: string;
  showChannelWatermark?: boolean;
  channelWatermarkStyle?: 'branded_bar' | 'handle' | 'minimal';
}

export interface CropSettings {
  x: number; // 0 to 1 horizontal center
  y: number; // 0 to 1 vertical center
  scale: number; // 1.0 to 2.5
  smartTrack: boolean;
  backgroundMode: 'blur' | 'color' | 'gradient' | 'none';
  backgroundColor: string;
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  hookStatement: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  aspectRatio: AspectRatio;
  highlightScore: number;
  sourceScore?: number;
  sourceRecordId?: string;
  editQualityScore?: number;
  scoreBreakdown: ScoreBreakdown;
  qaReport?: PostRenderQAReport;
  iterationHistory?: IterationRecord[];
  trendIntelligence?: TrendIntelligence;
  edl?: EditDecisionList;
  status: 'ready' | 'rendering' | 'exported';
  thumbnailUrl: string;
  previewVideoUrl: string;
  videoUrl?: string;
  supabaseVideoUrl?: string;
  tags: string[];

  captions: CaptionTrack;
  cropSettings: CropSettings;
  overlays: ClipOverlay;
  views?: number;
  engagementRate?: number;
  shares?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SourceVideoRecord {
  id: string;
  projectId: string;
  sourceUrl: string;
  storagePath: string;
  audioPath: string;
  supabaseVideoUrl?: string;
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  hasVideo: boolean;
  hasAudio: boolean;
  fileSizeBytes: number;
  thumbnailUrl: string;
  title: string;
  uploader: string;
}

export interface ViralMoment {
  id: string;
  projectId: string;
  sourceRecordId?: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  viralScore: number;
  hookStatement: string;
  hookType: string;
  extractedTopic: string;
  reason: string;
  tags: string[];
  scores: {
    hook: number;
    curiosity: number;
    emotion: number;
    value: number;
    story: number;
    retention: number;
    standalone: number;
    total: number;
  };
  trendIntelligence?: TrendIntelligence;
  status: 'discovered' | 'selected' | 'rendered' | 'rejected';
}

export type DiscoveryMode = 'all_qualified' | 'top_n' | 'timeline' | 'manual';
export type GenerationStrategy = 'quality_first' | 'fast_multi' | 'custom';

export interface DiscoveryOptions {
  discoveryMode: DiscoveryMode;
  generationStrategy?: GenerationStrategy;
  minViralScore: number; // e.g. 80
  requestedCount?: number; // 1, 3, 5, 10, custom
  timelineRange?: [number, number]; // [startSec, endSec]
  removeOverlaps: boolean;
  removeDuplicates: boolean;
  contentType: 'podcast' | 'gaming' | 'interview' | 'education' | 'music' | 'other';
  stylePreset: 'energetic' | 'clean' | 'cinematic' | 'educational' | 'minimal';
  aspectRatio: '9:16' | '1:1' | '16:9';
  preferredLang: string;
  youtubeUrls?: string[];
  songUrl?: string;
  songSyncMode?: boolean;
  autoRender?: boolean;
  headlineStyle?: 'yellow_white' | 'fire_orange' | 'neon_cyan' | 'none';
  muteOriginalAudio?: boolean;
  audioMode?: 'original_plus_music' | 'original_only' | 'music_only';
  originalAudioVolume?: number;
  bgMusicVolume?: number;
  autoDucking?: boolean;
  channelName?: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  startSec: number;
  endSec: number;
  text: string;
  sentiment?: 'positive' | 'neutral' | 'impactful' | 'question';
  energyScore: number;
  words: WordTiming[];
}

export interface Project {
  id: string;
  workspaceId: string;
  title: string;
  channelName?: string;
  description: string;
  contentType: 'podcast' | 'gaming' | 'interview' | 'education' | 'music' | 'other';
  stylePreset: 'energetic' | 'clean' | 'cinematic' | 'educational' | 'minimal';
  preferredLang: string;
  targetDuration: string;
  status: JobStatus;
  progress: number;
  stage: string;
  sourceUrl: string;
  videoAsset: {
    originalName: string;
    durationSec: number;
    width: number;
    height: number;
    fps: number;
    mimeType: string;
    fileSizeBytes: number;
    thumbnailUrl: string;
  };
  transcript: {
    language: string;
    confidence: number;
    fullText: string;
    segments: TranscriptSegment[];
  };
  clips: Clip[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandKit {
  id: string;
  workspaceId: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  watermarkPos: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  defaultCtaText: string;
  captionPreset: CaptionPreset;
}

export interface LiveMoment {
  id: string;
  timestamp: string;
  durationSec: number;
  title: string;
  score: number;
  status: 'pending' | 'approved' | 'rejected' | 'exported';
  previewUrl: string;
  snippet: string;
}

export interface LiveSession {
  id: string;
  workspaceId: string;
  title: string;
  rtmpSourceUrl: string;
  status: 'idle' | 'live' | 'ended';
  ingestBitrate: number;
  latencyMs: number;
  durationSec: number;
  fps: number;
  minScoreThreshold: number;
  autoExport: boolean;
  moments: LiveMoment[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  creditsTotal: number;
  creditsUsed: number;
  plan: PlanTier;
  membersCount: number;
}
