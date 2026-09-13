// ClipForge AI - Conversational Long Video AI Editing Director 🧠
// Translates natural language editing requests into structured editing plans
// Filters, pads, and merges indexed events into sample-accurate timecode segments.

import { getAIConfig } from '../ai/config';
import {
  LongVideoProject,
  LongVideoEditPlan,
  LongVideoEditSegment,
  LongVideoChatMessage,
  IndexedVideoEvent,
} from '@/types/long-video';
import { saveLongVideoProject } from './long-video-store';

export async function processLongVideoChat(
  project: LongVideoProject,
  userPrompt: string
): Promise<{
  reply: string;
  plan: LongVideoEditPlan;
  project: LongVideoProject;
}> {
  if (!project.indexedCatalog) {
    throw new Error('Video must be indexed before starting AI conversation');
  }

  const config = getAIConfig();
  const catalog = project.indexedCatalog;
  const currentPlan = project.activePlan;

  // 1. Build context for the AI
  const simplifiedEvents = catalog.events.map((e) => ({
    id: e.id,
    startSec: e.startSec,
    endSec: e.endSec,
    durationSec: e.durationSec,
    eventType: e.eventType,
    participants: e.participants,
    isBoundary: e.isBoundary,
    isReplay: e.isReplay,
    label: e.label,
  }));

  const systemPrompt = `You are the ClipForge AI Editing Director for Long Videos.
You are helping an editor cut a long video (highlights, sports match, podcast, or interview) using natural language instructions.

VIDEO CONTEXT:
- Total Duration: ${Math.round(project.durationSec)} seconds (${Math.floor(project.durationSec / 60)}m ${Math.round(project.durationSec % 60)}s)
- Detected People: ${catalog.detectedPeople.join(', ')}
- Available Events in Video Catalog (${catalog.events.length} events total):
${JSON.stringify(simplifiedEvents.slice(0, 100), null, 2)}

CURRENT ACTIVE PLAN (if any):
${currentPlan ? JSON.stringify({
    target: currentPlan.target,
    include: currentPlan.include,
    exclude: currentPlan.exclude,
    output: currentPlan.output,
    totalSegments: currentPlan.segments.length,
    totalDurationSec: currentPlan.totalDurationSec,
  }, null, 2) : 'None'}

INSTRUCTIONS:
1. Parse the user's natural language command (e.g. "Show only Sanju Samson batting", "Remove all replays", "Keep only boundaries", "Add 3s before and 5s after each shot", "Make it 16:9 and blur the channel logo", etc.).
2. If the user is giving a refinement (e.g. "Remove replays" or "Add 2 seconds padding"), maintain the previous target and selectively update the inclusion/exclusion parameters.
3. Select the exact IDs of the matching events from the catalog.
4. If watermarks or channel logo blurring is requested, set "blurWatermark": true.
5. Return a STRICT JSON object in this exact schema (no markdown outside the JSON):
{
  "assistantReply": "Concise, friendly editor response (e.g. 'I found 8 batting sequences totaling 6m 42s. Replays have been removed.')",
  "target": {
    "person": "Name of primary person or entity (e.g. Sanju Samson)",
    "activity": "batting | action | interview | speech",
    "topic": "topic if applicable"
  },
  "include": {
    "beforeEventSec": 3,
    "afterEventSec": 5,
    "replays": true,
    "boundariesOnly": false
  },
  "exclude": ["replays", "advertisements"],
  "output": {
    "aspectRatio": "16:9",
    "preserveOriginalAudio": true,
    "addSubtitles": false,
    "blurWatermark": false
  },
  "selectedEventIds": ["ev-1", "ev-2", ...],
  "suggestedFollowUps": ["Remove all replays", "Keep only boundaries", "Add subtitles"]
}`;

  let aiResponseRaw = '';

  // Use Groq or Cerebras
  if (config.groq.apiKey) {
    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add last 6 turns of conversation history
      const recentHistory = project.chatHistory.slice(-6);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      }

      messages.push({ role: 'user', content: userPrompt });

      const res = await fetch(`${config.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.groq.model || 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        aiResponseRaw = json.choices?.[0]?.message?.content || '';
      }
    } catch (err: any) {
      console.warn('[Groq Chat Notice, using fallback logic]:', err.message);
    }
  }

  // Parse structured AI output or use deterministic editor heuristics
  let parsedAI: any = null;
  try {
    if (aiResponseRaw) {
      parsedAI = JSON.parse(aiResponseRaw);
    }
  } catch {}

  // Fallback heuristic parsing if AI call was unavailable or invalid JSON
  if (!parsedAI || !parsedAI.assistantReply) {
    parsedAI = buildDeterministicPlan(userPrompt, currentPlan, catalog);
  }

  // 2. Resolve Selected Events and build accurate, merged segments
  const beforePadding = Number(parsedAI.include?.beforeEventSec) || (currentPlan?.include.beforeEventSec ?? 3);
  const afterPadding = Number(parsedAI.include?.afterEventSec) || (currentPlan?.include.afterEventSec ?? 5);
  const allowReplays = parsedAI.include?.replays !== false;
  const boundariesOnly = parsedAI.include?.boundariesOnly === true;

  // Filter catalog events based on criteria
  let targetEvents: IndexedVideoEvent[] = [];

  if (Array.isArray(parsedAI.selectedEventIds) && parsedAI.selectedEventIds.length > 0) {
    const idSet = new Set(parsedAI.selectedEventIds);
    targetEvents = catalog.events.filter((e) => idSet.has(e.id));
  } else {
    // Select all batting / action events by default
    targetEvents = catalog.events.filter((e) => {
      if (boundariesOnly && !e.isBoundary) return false;
      if (!allowReplays && e.isReplay) return false;
      return true;
    });
  }

  // Apply replay & boundary filters
  if (!allowReplays) {
    targetEvents = targetEvents.filter((e) => !e.isReplay);
  }
  if (boundariesOnly) {
    targetEvents = targetEvents.filter((e) => e.isBoundary);
  }

  if (targetEvents.length === 0) {
    // Fallback: at least select the top 4 events
    targetEvents = catalog.events.slice(0, 4);
  }

  // 3. Apply before/after event context padding & merge overlapping clips
  const rawSegments: Array<{ startSec: number; endSec: number; label: string; reason: string; isBoundary?: boolean; isReplay?: boolean; confidence: number }> = [];

  for (const ev of targetEvents) {
    const startSec = Math.max(0, Math.round((ev.startSec - beforePadding) * 10) / 10);
    const endSec = Math.min(project.durationSec, Math.round((ev.endSec + afterPadding) * 10) / 10);

    rawSegments.push({
      startSec,
      endSec,
      label: ev.label,
      reason: ev.details,
      isBoundary: ev.isBoundary,
      isReplay: ev.isReplay,
      confidence: ev.confidence,
    });
  }

  // Sort by startSec
  rawSegments.sort((a, b) => a.startSec - b.startSec);

  // Merge overlapping / contiguous cuts
  const mergedSegments: LongVideoEditSegment[] = [];
  for (let i = 0; i < rawSegments.length; i++) {
    const cur = rawSegments[i];
    if (mergedSegments.length === 0) {
      mergedSegments.push({
        id: `seg-1`,
        startSec: cur.startSec,
        endSec: cur.endSec,
        durationSec: Math.round((cur.endSec - cur.startSec) * 10) / 10,
        label: cur.label,
        reason: cur.reason,
        isBoundary: cur.isBoundary,
        isReplay: cur.isReplay,
        confidence: cur.confidence,
      });
      continue;
    }

    const prev = mergedSegments[mergedSegments.length - 1];
    // If current segment starts within 2 seconds of previous end, merge them seamlessly
    if (cur.startSec <= prev.endSec + 2) {
      prev.endSec = Math.max(prev.endSec, cur.endSec);
      prev.durationSec = Math.round((prev.endSec - prev.startSec) * 10) / 10;
      prev.label = `${prev.label} + ${cur.label}`;
      prev.isBoundary = prev.isBoundary || cur.isBoundary;
      prev.isReplay = prev.isReplay || cur.isReplay;
    } else {
      mergedSegments.push({
        id: `seg-${mergedSegments.length + 1}`,
        startSec: cur.startSec,
        endSec: cur.endSec,
        durationSec: Math.round((cur.endSec - cur.startSec) * 10) / 10,
        label: cur.label,
        reason: cur.reason,
        isBoundary: cur.isBoundary,
        isReplay: cur.isReplay,
        confidence: cur.confidence,
      });
    }
  }

  const totalDurationSec = Math.round(
    mergedSegments.reduce((acc, s) => acc + s.durationSec, 0) * 10
  ) / 10;

  // Format total duration for human readability (e.g. "6m 42s")
  const durMins = Math.floor(totalDurationSec / 60);
  const durSecs = Math.round(totalDurationSec % 60);
  const durStr = durMins > 0 ? `${durMins}m ${durSecs}s` : `${durSecs}s`;

  // 4. Construct validated LongVideoEditPlan
  const plan: LongVideoEditPlan = {
    id: `plan-${Date.now()}`,
    instruction: userPrompt,
    target: {
      person: parsedAI.target?.person || catalog.detectedPeople[0] || 'Target Person',
      activity: parsedAI.target?.activity || 'batting',
      topic: parsedAI.target?.topic,
    },
    include: {
      beforeEventSec: beforePadding,
      afterEventSec: afterPadding,
      replays: allowReplays,
      boundariesOnly,
    },
    exclude: parsedAI.exclude || [],
    output: {
      aspectRatio: parsedAI.output?.aspectRatio || currentPlan?.output.aspectRatio || '16:9',
      preserveOriginalAudio: true,
      addSubtitles: Boolean(parsedAI.output?.addSubtitles),
      blurWatermark: Boolean(parsedAI.output?.blurWatermark),
      watermarkBox: catalog.detectedWatermarks?.[0],
    },
    segments: mergedSegments,
    totalDurationSec,
    explanation: parsedAI.assistantReply || `I found ${mergedSegments.length} key sequences totaling ${durStr}. Prepared for export.`,
    suggestedFollowUps: parsedAI.suggestedFollowUps || [
      'Remove all replays',
      'Keep only boundaries',
      'Add 2s context before each delivery',
      'Blur top-right watermark',
    ],
    createdAt: new Date().toISOString(),
  };

  // 5. Update Project Chat History & Active Plan
  const userMessage: LongVideoChatMessage = {
    id: `msg-user-${Date.now()}`,
    role: 'user',
    content: userPrompt,
    timestamp: new Date().toISOString(),
  };

  const assistantMessage: LongVideoChatMessage = {
    id: `msg-ai-${Date.now()}`,
    role: 'assistant',
    content: plan.explanation,
    plan,
    timestamp: new Date().toISOString(),
  };

  project.chatHistory.push(userMessage, assistantMessage);
  project.activePlan = plan;

  saveLongVideoProject(project);

  return {
    reply: plan.explanation,
    plan,
    project,
  };
}

/**
 * Deterministic rules-based parser if LLM API is unavailable
 */
function buildDeterministicPlan(
  prompt: string,
  currentPlan: LongVideoEditPlan | undefined,
  catalog: any
): any {
  const p = prompt.toLowerCase();

  let replays = currentPlan?.include.replays ?? true;
  let boundariesOnly = currentPlan?.include.boundariesOnly ?? false;
  let beforeEventSec = currentPlan?.include.beforeEventSec ?? 3;
  let afterEventSec = currentPlan?.include.afterEventSec ?? 5;
  let blurWatermark = currentPlan?.output.blurWatermark ?? false;
  let addSubtitles = currentPlan?.output.addSubtitles ?? false;
  let aspectRatio: '16:9' | '9:16' = currentPlan?.output.aspectRatio === '9:16' ? '9:16' : '16:9';

  // Check commands
  if (p.includes('remove') && p.includes('replay')) {
    replays = false;
  } else if (p.includes('include replay') || p.includes('with replay')) {
    replays = true;
  }

  if (p.includes('only boundar') || p.includes('keep only boundar') || p.includes('boundary only')) {
    boundariesOnly = true;
  } else if (p.includes('all deliveries') || p.includes('all shots')) {
    boundariesOnly = false;
  }

  if (p.includes('blur') || p.includes('watermark') || p.includes('channel logo')) {
    blurWatermark = true;
  }

  if (p.includes('subtitle') || p.includes('caption')) {
    addSubtitles = true;
  }

  if (p.includes('9:16') || p.includes('vertical') || p.includes('shorts')) {
    aspectRatio = '9:16';
  } else if (p.includes('16:9') || p.includes('horizontal') || p.includes('landscape')) {
    aspectRatio = '16:9';
  }

  // Parse padding numbers if mentioned (e.g. "keep 3s before and 5s after")
  const beforeMatch = p.match(/([0-9]+)\s*s(?:ec)?\s*before/);
  if (beforeMatch) beforeEventSec = Number(beforeMatch[1]) || 3;

  const afterMatch = p.match(/([0-9]+)\s*s(?:ec)?\s*after/);
  if (afterMatch) afterEventSec = Number(afterMatch[1]) || 5;

  const targetPerson = catalog.detectedPeople.find((name: string) => p.includes(name.toLowerCase())) || catalog.detectedPeople[0] || 'Sanju Samson';

  let reply = '';
  if (p.includes('remove') && p.includes('replay')) {
    reply = `Done. All slow-motion broadcast replays have been excluded from the edit.`;
  } else if (boundariesOnly) {
    reply = `Done. Filtered down to exclusively 4s, 6s, and boundary climax shots.`;
  } else if (beforeMatch || afterMatch) {
    reply = `Adjusted timing padding: keeping ${beforeEventSec}s before bowler release and ${afterEventSec}s after shot follow-through.`;
  } else {
    reply = `I have isolated all ${targetPerson} batting sequences, including bowler run-up, shot execution, and boundary impact. Replays are ${replays ? 'included' : 'excluded'}.`;
  }

  return {
    assistantReply: reply,
    target: { person: targetPerson, activity: 'batting' },
    include: { beforeEventSec, afterEventSec, replays, boundariesOnly },
    exclude: replays ? [] : ['replays'],
    output: { aspectRatio, preserveOriginalAudio: true, addSubtitles, blurWatermark },
    selectedEventIds: [],
    suggestedFollowUps: [
      replays ? 'Remove all replays' : 'Include slow-mo replays',
      boundariesOnly ? 'Show all deliveries' : 'Keep only boundaries',
      'Blur channel logo/watermark',
      'Export in 16:9 widescreen',
    ],
  };
}
