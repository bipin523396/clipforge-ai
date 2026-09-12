// ClipForge AI - Multi-Provider Configuration & API Key Resolution

export interface AIProviderConfig {
  serpApi: {
    apiKey: string;
    baseUrl: string;
    enabled: boolean;
  };
  zenserp: {
    apiKey: string;
    baseUrl: string;
    enabled: boolean;
  };
  cerebras: {
    apiKey: string;
    baseUrl: string;
    model: string;
    enabled: boolean;
  };
  groq: {
    apiKey: string;
    baseUrl: string;
    model: string;
    enabled: boolean;
  };
  cloudflare: {
    apiKey: string;
    accountId?: string;
    baseUrl: string;
    embeddingModel: string;
    enabled: boolean;
  };
}

export const getAIConfig = (): AIProviderConfig => {
  const serpApiKey = process.env.SERPAPI_API_KEY || '';
  const zenserpApiKey = process.env.ZENSERP_API_KEY || '';
  const cerebrasApiKey = process.env.CEREBRAS_API_KEY || '';
  const groqApiKey = process.env.GROQ_API_KEY || '';
  const cloudflareApiKey = process.env.CLOUDFLARE_API_KEY || '';


  return {
    serpApi: {
      apiKey: serpApiKey,
      baseUrl: 'https://serpapi.com/search.json',
      enabled: Boolean(serpApiKey),
    },
    zenserp: {
      apiKey: zenserpApiKey,
      baseUrl: 'https://app.zenserp.com/api/v2/search',
      enabled: Boolean(zenserpApiKey),
    },
    cerebras: {
      apiKey: cerebrasApiKey,
      baseUrl: process.env.CEREBRAS_BASE_URL || 'https://api.cerebras.ai/v1',
      model: process.env.CEREBRAS_MODEL || 'llama3.1-70b',
      enabled: Boolean(cerebrasApiKey),
    },
    groq: {
      apiKey: groqApiKey,
      baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      enabled: Boolean(groqApiKey),
    },
    cloudflare: {
      apiKey: cloudflareApiKey,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      baseUrl: 'https://api.cloudflare.com/client/v4/accounts',
      embeddingModel: '@cf/baai/bge-base-en-v1.5',
      enabled: Boolean(cloudflareApiKey),
    },
  };
};
