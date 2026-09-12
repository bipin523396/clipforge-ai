import { NextResponse } from 'next/server';
import { AIEditCommandEngine } from '@/lib/ai/ai-command-engine';

export async function POST(req: Request) {
  try {
    const { prompt, clip } = await req.json();
    if (!prompt || !clip) {
      return NextResponse.json({ success: false, error: 'Missing prompt or clip payload' }, { status: 400 });
    }

    const engine = new AIEditCommandEngine();
    const result = await engine.processCommand(prompt, clip);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
