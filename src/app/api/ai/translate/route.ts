import { NextResponse } from 'next/server';
import { MockCaptionTranslationProvider } from '@/lib/ai/mock-provider';

export async function POST(req: Request) {
  try {
    const { captions, targetLanguage } = await req.json();
    if (!captions || !targetLanguage) {
      return NextResponse.json({ success: false, error: 'Missing captions or targetLanguage' }, { status: 400 });
    }

    const provider = new MockCaptionTranslationProvider();
    const result = await provider.translate({ captions, targetLanguage });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
