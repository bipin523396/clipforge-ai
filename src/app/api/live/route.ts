import { NextResponse } from 'next/server';
import { INITIAL_LIVE_SESSION } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    session: INITIAL_LIVE_SESSION,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: 'Live stream ingestion connected',
      session: {
        ...INITIAL_LIVE_SESSION,
        ...body,
        status: 'live',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
