import { NextResponse } from 'next/server';
import { MockCopyGenerationProvider } from '@/lib/ai/mock-provider';

export async function POST(req: Request) {
  try {
    const { clipTitle, hook, transcriptSnippet, platform } = await req.json();
    const provider = new MockCopyGenerationProvider();
    const result = await provider.generateCopy({
      clipTitle: clipTitle || 'Viral Video Clip',
      hook: hook || 'Watch until the end',
      transcriptSnippet: transcriptSnippet || '',
      platform: platform || 'TIKTOK',
    });

    return NextResponse.json({ success: true, copy: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
