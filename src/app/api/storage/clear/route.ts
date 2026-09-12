// ClipForge AI - Local Media Storage & History Purge Controller 🧹
import { NextResponse } from 'next/server';
import { getStorageUsageStats, purgeAllStorageAndHistory } from '@/lib/server/project-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/storage/clear
 * Returns current disk space used by renders, downloads, and jobs
 */
export async function GET() {
  try {
    const stats = getStorageUsageStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate storage' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/storage/clear
 * Completely wipes all local video renders, downloads, and project history
 */
export async function POST() {
  try {
    const beforeStats = getStorageUsageStats();
    const result = await purgeAllStorageAndHistory();
    const afterStats = getStorageUsageStats();

    return NextResponse.json({
      success: true,
      message: 'All local videos and project histories permanently purged.',
      reclaimedFiles: result.reclaimedFiles,
      reclaimedBytes: beforeStats.totalBytes - afterStats.totalBytes,
      currentUsage: afterStats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to purge storage' },
      { status: 500 }
    );
  }
}
