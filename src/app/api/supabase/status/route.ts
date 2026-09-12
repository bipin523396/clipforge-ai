import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/server/supabase';

export async function GET() {
  const result = await testSupabaseConnection();
  return NextResponse.json(result);
}
