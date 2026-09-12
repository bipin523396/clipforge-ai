// AI Editing Director 🎬 (Cerebras / Groq / Cloudflare)
// Purpose: Second-by-second Edit Decision List (EDL), kinetic captions, camera zooms, and visual asset suggestions

import { getAIConfig } from '../config';
import { EditDecisionAction, EditDecisionList, TranscriptSegment } from '@/types';

export interface AIEditingDirectorRequest {
  clipId: string;
  title: string;
  hookStatement: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  segments: TranscriptSegment[];
}

export interface AIEditingDirectorResult {
  provider: 'Cerebras' | 'Groq' | 'Cloudflare' | 'Rule-based Director';
  latencyMs: number;
  edl: EditDecisionList;
}

export async function generateEditDecisionList(
  request: AIEditingDirectorRequest
): Promise<AIEditingDirectorResult> {
  const startTime = Date.now();
  const config = getAIConfig();

  const clipTranscript = request.segments
    .filter((s) => s.endSec >= request.startSec && s.startSec <= request.endSec)
    .map((s) => `[${(s.startSec - request.startSec).toFixed(1)}s - ${(s.endSec - request.startSec).toFixed(1)}s] ${s.text}`)
    .join('\n');

  const systemPrompt = `You are an elite short-form video editor and creative director.
Create a high-retention, second-by-second Edit Decision List (EDL) for a ${request.durationSec.toFixed(1)}s vertical video (YouTube Shorts / TikTok / Reels).
Every edit must improve retention, comprehension, emotion, or visual pacing.

Edit types allowed:
- 'punch_in': Tighten framing to emphasize a crucial hook or revelation
- 'zoom_out': Return to standard framing for context or conversational segments
- 'subtle_pan': Dynamic micro-motion to keep the eye engaged
- 'kinetic_caption': Fast dynamic popup caption animation
- 'keyword_emphasis': Highlight specific high-impact words with color/glow
- 'supporting_visual': Suggest an overlay graphic or b-roll animation (include search_query)
- 'sound_effect': Audio trigger like whoosh, pop, ding, or riser

Output STRICT JSON format:
{
  "pacingNotes": "Ultra high-energy opening transition into steady educational pacing with climax punch-in.",
  "actions": [
    {
      "timeRange": [0.0, 2.5],
      "editType": "punch_in",
      "captionStyle": "VIRAL_POP",
      "emphasisWords": ["biggest", "mistake"],
      "soundEffectType": "whoosh_impact",
      "reason": "Immediate punch-in to lock in viewer attention on the opening hook."
    },
    {
      "timeRange": [2.5, 6.0],
      "editType": "keyword_emphasis",
      "captionStyle": "BOLD_CREATOR",
      "emphasisWords": ["isolation", "months"],
      "visualQuery": "founder working alone late night laptop dark room",
      "reason": "Reinforce the problem state with visual imagery."
    },
    {
      "timeRange": [6.0, 10.0],
      "editType": "supporting_visual",
      "visualQuery": "customer interview feedback analytics chart",
      "soundEffectType": "subtle_pop",
      "reason": "Supporting graphic to visualize customer validation."
    },
    {
      "timeRange": [10.0, 16.0],
      "editType": "zoom_out",
      "emphasisWords": ["four clicks"],
      "soundEffectType": "success_chime",
      "reason": "Zoom out for satisfying conclusion and high-contrast takeaway."
    }
  ],
  "recommendedVisuals": [
    { "query": "startup building in isolation", "timestamp": 3.0, "type": "b-roll" },
    { "query": "customer interview analytics", "timestamp": 8.0, "type": "motion_graphic" },
    { "query": "simplified 4-click workflow", "timestamp": 12.5, "type": "illustration" }
  ]
}`;

  // Try Cerebras first for deep creative direction
  if (config.cerebras.apiKey) {
    try {
      const response = await fetch(`${config.cerebras.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.cerebras.apiKey}`,
        },
        body: JSON.stringify({
          model: config.cerebras.model || 'llama3.1-70b',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Generate the EDL for this clip:\nTitle: "${request.title}"\nHook: "${request.hookStatement}"\nDuration: ${request.durationSec}s\nTranscript:\n${clipTranscript}`,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.actions)) {
            return {
              provider: 'Cerebras',
              latencyMs: Date.now() - startTime,
              edl: {
                clipId: request.clipId,
                pacingNotes: parsed.pacingNotes || 'Dynamic retention-optimized pacing',
                actions: parsed.actions.map((a: any, idx: number) => ({
                  id: `edl-act-${idx + 1}-${Date.now()}`,
                  timeRange: Array.isArray(a.timeRange) ? [Number(a.timeRange[0]), Number(a.timeRange[1])] : [0, 3],
                  editType: a.editType || 'punch_in',
                  captionStyle: a.captionStyle || 'VIRAL_POP',
                  emphasisWords: Array.isArray(a.emphasisWords) ? a.emphasisWords : [],
                  visualQuery: a.visualQuery || a.search_query || undefined,
                  soundEffectType: a.soundEffectType || undefined,
                  reason: a.reason || 'Pacing enhancement',
                })),
                recommendedVisuals: Array.isArray(parsed.recommendedVisuals) ? parsed.recommendedVisuals : [],
              },
            };
          }
        }
      }
    } catch (error) {
      console.warn('[AI Editing Director] Cerebras notice, falling back to algorithmic director:', error);
    }
  }

  // Fallback high-retention algorithmic director
  const dur = request.durationSec;
  const actions: EditDecisionAction[] = [
    {
      id: `edl-act-1-${Date.now()}`,
      timeRange: [0.0, Math.min(2.5, dur * 0.15)],
      editType: 'punch_in',
      captionStyle: 'VIRAL_POP',
      emphasisWords: request.hookStatement.split(' ').slice(0, 3),
      soundEffectType: 'whoosh_impact',
      reason: '0-2s scroll-stopper punch-in to maximize 3-second view-through rate.',
    },
    {
      id: `edl-act-2-${Date.now()}`,
      timeRange: [Math.min(2.5, dur * 0.15), Math.min(6.0, dur * 0.4)],
      editType: 'subtle_pan',
      captionStyle: 'BOLD_CREATOR',
      emphasisWords: ['critical', 'key'],
      visualQuery: `${request.title} illustration`,
      soundEffectType: 'subtle_pop',
      reason: 'Dynamic micro-pan to prevent visual plateauing during premise explanation.',
    },
    {
      id: `edl-act-3-${Date.now()}`,
      timeRange: [Math.min(6.0, dur * 0.4), Math.min(12.0, dur * 0.75)],
      editType: 'supporting_visual',
      captionStyle: 'KARAOKE_GLOW',
      emphasisWords: ['result', 'data'],
      visualQuery: `${request.title} b-roll graphic`,
      soundEffectType: 'riser',
      reason: 'Visual graphic reinforcement for core concept delivery.',
    },
    {
      id: `edl-act-4-${Date.now()}`,
      timeRange: [Math.min(12.0, dur * 0.75), dur],
      editType: 'zoom_out',
      captionStyle: 'VIRAL_POP',
      emphasisWords: ['final', 'action'],
      soundEffectType: 'success_chime',
      reason: 'Framing release for satisfying takeaway and call-to-action.',
    },
  ];

  return {
    provider: 'Rule-based Director',
    latencyMs: Date.now() - startTime,
    edl: {
      clipId: request.clipId,
      pacingNotes: 'Hook punch-in -> Micro-motion retention -> B-roll reinforcement -> High-impact resolution',
      actions,
      recommendedVisuals: [
        { query: `${request.title} concept visual`, timestamp: Math.min(3.0, dur * 0.2), type: 'b-roll' },
        { query: `${request.title} data infographic`, timestamp: Math.min(8.0, dur * 0.5), type: 'motion_graphic' },
      ],
    },
  };
}
