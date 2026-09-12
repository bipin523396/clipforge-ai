import { NextResponse } from 'next/server';
import { getJob, persistJob } from '@/lib/server/job-queue';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;

  let job = getJob(jobId);

  if (!job) {
    // Try fallback from Supabase Storage in case the server container restarted
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wqwlqbozwcbcxjbxlqmh.supabase.co';
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/projects-data/jobs/${jobId}.json`, {
        headers: SUPABASE_KEY ? { apikey: SUPABASE_KEY } : undefined,
        cache: 'no-store',
      });
      if (res.ok) {
        job = await res.json();
        if (job) {
          persistJob(job);
        }
      }
    } catch {
      // Ignore
    }
  }

  if (!job) {
    return NextResponse.json(
      { success: false, error: 'Job not found or worker restarted' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    job,
  });
}

