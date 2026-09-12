import { NextResponse } from 'next/server';
import { getAIConfig } from '@/lib/ai/config';

export async function GET() {
  const config = getAIConfig();

  const providers = {
    serpApi: {
      name: 'SerpApi',
      role: 'Web & Search Trend Intelligence',
      status: config.serpApi.apiKey ? 'active' : 'missing_key',
      keyConfigured: Boolean(config.serpApi.apiKey),
      keyPreview: config.serpApi.apiKey ? `${config.serpApi.apiKey.slice(0, 8)}...${config.serpApi.apiKey.slice(-4)}` : null,
      primaryModel: 'Google Search Engine',
    },
    zenserp: {
      name: 'Zenserp',
      role: 'Search Fallback & Quota Protection',
      status: config.zenserp.apiKey ? 'active' : 'missing_key',
      keyConfigured: Boolean(config.zenserp.apiKey),
      keyPreview: config.zenserp.apiKey ? `${config.zenserp.apiKey.slice(0, 8)}...${config.zenserp.apiKey.slice(-4)}` : null,
      primaryModel: 'Zenserp V2 API',
    },
    cerebras: {
      name: 'Cerebras Platform',
      role: 'Deep AI Reasoning & Comparative Ranking',
      status: config.cerebras.apiKey ? 'active' : 'missing_key',
      keyConfigured: Boolean(config.cerebras.apiKey),
      keyPreview: config.cerebras.apiKey ? `${config.cerebras.apiKey.slice(0, 8)}...${config.cerebras.apiKey.slice(-4)}` : null,
      primaryModel: config.cerebras.model,
    },
    groq: {
      name: 'Groq Cloud',
      role: 'Fast First-Pass Candidate Extraction',
      status: config.groq.apiKey ? 'active' : 'missing_key',
      keyConfigured: Boolean(config.groq.apiKey),
      keyPreview: config.groq.apiKey ? `${config.groq.apiKey.slice(0, 8)}...${config.groq.apiKey.slice(-4)}` : null,
      primaryModel: config.groq.model,
    },
    cloudflare: {
      name: 'Cloudflare Workers AI',
      role: 'Embeddings & Semantic Deduplication',
      status: config.cloudflare.apiKey ? 'active' : 'missing_key',
      keyConfigured: Boolean(config.cloudflare.apiKey),
      keyPreview: config.cloudflare.apiKey ? `${config.cloudflare.apiKey.slice(0, 8)}...${config.cloudflare.apiKey.slice(-4)}` : null,
      primaryModel: config.cloudflare.embeddingModel,
    },
  };

  const allActive = Object.values(providers).every((p) => p.status === 'active');

  return NextResponse.json({
    success: true,
    allConfigured: allActive,
    zeroCostMvpStack: true,
    timestamp: new Date().toISOString(),
    providers,
  });
}
