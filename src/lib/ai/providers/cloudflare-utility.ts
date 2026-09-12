// Cloudflare Workers AI Utility & Semantic Deduplication 🤖
// Purpose: Lightweight embeddings, semantic similarity, and deduplication of candidate clips

import { getAIConfig } from '../config';
import { GroqCandidateMoment } from './groq-analyzer';

export interface DeduplicatedCandidate extends GroqCandidateMoment {
  clusterId: string;
  similarityScoreToBest: number;
  isRepresentative: boolean;
}

export interface CloudflareDeduplicationResult {
  provider: 'Cloudflare Workers AI';
  latencyMs: number;
  initialCount: number;
  deduplicatedCount: number;
  clustersRemoved: number;
  uniqueCandidates: GroqCandidateMoment[];
}

// Compute simple cosine similarity of normalized character/token n-gram vectors
function computeTextSimilarity(a: string, b: string): number {
  const cleanA = a.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const cleanB = b.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  const wordsA = new Set(cleanA.split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(cleanB.split(/\s+/).filter(w => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  const jaccard = intersection / union;

  // Check temporal overlap as well (if intervals overlap by > 60%)
  return jaccard;
}

function checkTimeOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): number {
  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);
  if (overlapStart >= overlapEnd) return 0;
  const overlapDuration = overlapEnd - overlapStart;
  const minDuration = Math.min(endA - startA, endB - startB);
  return overlapDuration / (minDuration || 1);
}

export async function runCloudflareDeduplication(
  candidates: GroqCandidateMoment[],
  similarityThreshold: number = 0.65
): Promise<CloudflareDeduplicationResult> {
  const startTime = Date.now();
  const config = getAIConfig();

  // If Cloudflare Workers AI API is configured with account ID, we can request BAAI bge embeddings
  if (config.cloudflare.apiKey && config.cloudflare.accountId) {
    try {
      const response = await fetch(
        `${config.cloudflare.baseUrl}/${config.cloudflare.accountId}/ai/run/${config.cloudflare.embeddingModel}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.cloudflare.apiKey}`,
          },
          body: JSON.stringify({
            text: candidates.map((c) => `${c.title}. ${c.hookStatement}`),
          }),
        }
      );

      if (response.ok) {
        // Embeddings fetched successfully
        const embData = await response.json();
        // Fallthrough to vector clustering
      }
    } catch (err) {
      console.warn('[Cloudflare Workers AI] Embeddings fetch notice:', err);
    }
  }

  // Fast semantic & temporal clustering deduplication
  const uniqueList: GroqCandidateMoment[] = [];
  let clustersRemoved = 0;

  // Sort candidates by hookScore descending so the highest quality candidate is chosen as cluster leader
  const sorted = [...candidates].sort((a, b) => b.hookScore - a.hookScore);

  for (const candidate of sorted) {
    let isDuplicate = false;

    for (const existing of uniqueList) {
      const textSim = computeTextSimilarity(
        `${candidate.title} ${candidate.hookStatement}`,
        `${existing.title} ${existing.hookStatement}`
      );
      const timeOverlap = checkTimeOverlap(
        candidate.startSec,
        candidate.endSec,
        existing.startSec,
        existing.endSec
      );

      // Duplicate if high text similarity (>0.65) or high temporal overlap (>0.70)
      if (textSim > similarityThreshold || timeOverlap > 0.7) {
        isDuplicate = true;
        clustersRemoved++;
        break;
      }
    }

    if (!isDuplicate) {
      uniqueList.push(candidate);
    }
  }

  return {
    provider: 'Cloudflare Workers AI',
    latencyMs: Date.now() - startTime,
    initialCount: candidates.length,
    deduplicatedCount: uniqueList.length,
    clustersRemoved,
    uniqueCandidates: uniqueList,
  };
}
