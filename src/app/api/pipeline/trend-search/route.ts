import { NextResponse } from 'next/server';
import { searchTrendIntelligence } from '@/lib/ai/providers/search-router';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topics = [] } = body;

    const result = await searchTrendIntelligence(topics);
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Trend search failed' },
      { status: 500 }
    );
  }
}
