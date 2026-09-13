// ClipForge AI - Long Video Conversational Editor Types 🎬

export type LongVideoProjectStatus =
  | 'indexing'
  | 'ready'
  | 'rendering'
  | 'completed'
  | 'failed';

export type VideoEventType =
  | 'batting'
  | 'delivery'
  | 'shot'
  | 'boundary'
  | 'six'
  | 'four'
  | 'wicket'
  | 'replay'
  | 'celebration'
  | 'interview'
  | 'speech'
  | 'advertisement'
  | 'action_general';

export interface IndexedVideoEvent {
  id: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  label: string;
  eventType: VideoEventType;
  participants: string[]; // e.g. ["Sanju Samson", "Shaheen Afridi"]
  ocrText?: string[];     // on-screen scoreboards, player names, graphics
  confidence: number;    // 0 to 1
  isReplay: boolean;
  isBoundary: boolean;
  details: string;
}

export interface IndexedVideoCatalog {
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  detectedPeople: string[];
  events: IndexedVideoEvent[];
  transcriptSegments: Array<{
    id: string;
    startSec: number;
    endSec: number;
    text: string;
    speaker?: string;
  }>;
  sceneCuts: number[]; // timestamps of camera angle / scene transitions
  detectedWatermarks?: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
  }>;
}

export interface LongVideoEditSegment {
  id: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  label: string;
  reason: string;
  isBoundary?: boolean;
  isReplay?: boolean;
  confidence: number;
}

export interface LongVideoEditPlan {
  id: string;
  instruction: string;
  target: {
    person?: string;
    activity?: string;
    topic?: string;
  };
  include: {
    beforeEventSec: number;
    afterEventSec: number;
    replays: boolean;
    boundariesOnly?: boolean;
  };
  exclude: string[];
  output: {
    aspectRatio: '16:9' | '9:16' | '1:1' | 'original';
    preserveOriginalAudio: boolean;
    addSubtitles: boolean;
    blurWatermark: boolean;
    watermarkBox?: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
  };
  segments: LongVideoEditSegment[];
  totalDurationSec: number;
  explanation: string;
  suggestedFollowUps?: string[];
  createdAt: string;
}

export interface LongVideoChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  plan?: LongVideoEditPlan;
  timestamp: string;
}

export interface RenderedLongVideoOutput {
  videoPath: string;
  supabaseVideoUrl?: string;
  durationSec: number;
  segmentsCount: number;
  renderedAt: string;
  fileSizeBytes?: number;
}

export interface LongVideoProject {
  id: string;
  title: string;
  sourceUrl: string;
  isLocalUpload: boolean;
  localSourcePath: string;
  audioPath?: string;
  thumbnailUrl: string;
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  status: LongVideoProjectStatus;
  progressPct: number;
  stageMessage: string;
  indexedCatalog?: IndexedVideoCatalog;
  chatHistory: LongVideoChatMessage[];
  activePlan?: LongVideoEditPlan;
  renderedOutput?: RenderedLongVideoOutput;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
