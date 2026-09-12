// ClipForge AI - Server Project Persistence & Storage Synchronization Engine 📂
// Scans and merges background job records, manages disk cleanup, tombstone tracking and Supabase assets

import fs from 'fs';
import path from 'path';
import { Project, Clip } from '@/types';
import { INITIAL_PROJECTS } from '../mock-data';
import {
  saveProjectToSupabase,
  getProjectFromSupabase,
  getAllProjectsFromSupabase,
  deleteProjectFromSupabase,
  deleteFromSupabaseStorage,
} from './supabase';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const JOBS_DIR = isServerless
  ? path.join(process.env.TMPDIR || '/tmp', 'clipforge-jobs')
  : path.join(process.cwd(), 'public', 'jobs');
const RENDERS_DIR = isServerless
  ? path.join(process.env.TMPDIR || '/tmp', 'clipforge-renders')
  : path.join(process.cwd(), 'public', 'renders');
const DOWNLOADS_DIR = isServerless
  ? path.join(process.env.TMPDIR || '/tmp', 'clipforge-downloads')
  : path.join(process.cwd(), 'public', 'media', 'downloads');
const TOMBSTONE_FILE = path.join(JOBS_DIR, '.deleted_records.json');


// Persistent deleted IDs tombstone tracker so deleted items never resurrect
export function getDeletedRecords(): { projectIds: string[]; clipIds: string[] } {
  try {
    if (fs.existsSync(TOMBSTONE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(TOMBSTONE_FILE, 'utf-8'));
      return {
        projectIds: Array.isArray(parsed.projectIds) ? parsed.projectIds : [],
        clipIds: Array.isArray(parsed.clipIds) ? parsed.clipIds : [],
      };
    }
  } catch {}
  return { projectIds: [], clipIds: [] };
}

export function recordDeletedProject(projectId: string) {
  const rec = getDeletedRecords();
  if (!rec.projectIds.includes(projectId)) {
    rec.projectIds.push(projectId);
    try {
      if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });
      fs.writeFileSync(TOMBSTONE_FILE, JSON.stringify(rec, null, 2), 'utf-8');
    } catch {}
  }
}

export function recordDeletedClip(clipId: string) {
  const rec = getDeletedRecords();
  if (!rec.clipIds.includes(clipId)) {
    rec.clipIds.push(clipId);
    try {
      if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });
      fs.writeFileSync(TOMBSTONE_FILE, JSON.stringify(rec, null, 2), 'utf-8');
    } catch {}
  }
}

/**
 * Sanitize titles to remove YouTuber channel names, hashtags, or handles
 * e.g. "Mom 🔥🔥🔥 | Max Amini | Standup Comedy" -> "Mom 🔥🔥🔥 • Standup Comedy"
 */
export function sanitizeTitle(rawTitle: string): string {
  if (!rawTitle) return 'Viral Short';
  let cleaned = rawTitle
    .replace(/\/\/\s*.*$/gi, '') // Remove "// Shri Hit Premanand Ji Maharaj" etc.
    .replace(/\|\s*.*$/gi, '') // Remove "| Sadhan Path" etc.
    .replace(/[-–—]\s*(by|channel|official|youtube|ji maharaj).*$/gi, '')
    .replace(/@[\w\d_]+/g, '') // Remove handles like @channel
    .replace(/#\w+/g, '') // Remove hashtags
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || rawTitle;
}

function sanitizeProjectEntity(p: Project, deleted: { projectIds: string[]; clipIds: string[] }): Project {
  const sanitizedClips = (p.clips || [])
    .filter((c) => !deleted.clipIds.includes(c.id))
    .map((c) => {
      const startSec = Math.max(0, c.startSec || 0);
      let endSec = c.endSec || (startSec + 35);
      if (endSec - startSec >= 50) {
        endSec = startSec + 44.5;
      }
      const durationSec = Number(Math.min(48, Math.max(8, endSec - startSec)).toFixed(1));
      const cleanClipTitle = sanitizeTitle(c.title);

      return {
        ...c,
        title: cleanClipTitle,
        startSec,
        endSec,
        durationSec,
        trendIntelligence: c.trendIntelligence,
        overlays: {
          headlineText: c.overlays?.headlineText || 'WATCH UNTIL THE END 🤣',
          headlineColor: c.overlays?.headlineColor || '#FFFFFF',
          headlineBg: c.overlays?.headlineBg || 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(6, 182, 212, 0.95))',
          ...c.overlays,
          showProgressBar: c.overlays?.showProgressBar ?? true,
          progressBarColor: c.overlays?.progressBarColor || '#22D3EE',
          ctaText: c.overlays?.ctaText || '🔥 Follow for Part 2',
          ctaPosition: (c.overlays?.ctaPosition === 'top' || c.overlays?.ctaPosition === 'bottom') ? c.overlays.ctaPosition : 'bottom',
        },
      };
    });

  return {
    ...p,
    title: sanitizeTitle(p.title),
    clips: sanitizedClips,
  };
}

let lastOrphanCleanTime = 0;

/**
 * Load all projects directly from Supabase Storage (projects-data bucket),
 * merge with local offline jobs if any, strictly filtering out any tombstoned/deleted items.
 */
export async function getAllProjects(): Promise<Project[]> {
  const projectsMap = new Map<string, Project>();
  const deleted = getDeletedRecords();

  // Periodically sweep orphaned downloads & abandoned files
  if (Date.now() - lastOrphanCleanTime > 20000) {
    lastOrphanCleanTime = Date.now();
    try {
      cleanOrphanedMedia();
    } catch {}
  }

  // 1. Fetch cloud projects from Supabase
  try {
    const supabaseProjects = await getAllProjectsFromSupabase();
    for (const p of supabaseProjects) {
      if (p && p.id && !deleted.projectIds.includes(p.id)) {
        const sanitized = sanitizeProjectEntity(p, deleted);
        projectsMap.set(p.id, sanitized);
      }
    }
  } catch (err) {
    console.warn('[Supabase Fetch Projects Warning]:', err);
  }

  // 2. Scan public/jobs/ for any completed generation jobs not yet in Supabase
  if (fs.existsSync(JOBS_DIR)) {
    const files = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('.'));

    for (const file of files) {
      try {
        const filePath = path.join(JOBS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const job = JSON.parse(content);

        if (job && job.project && job.project.id && !deleted.projectIds.includes(job.project.id)) {
          const p: Project = job.project;
          const sanitizedProject = sanitizeProjectEntity(p, deleted);

          if (!projectsMap.has(p.id)) {
            projectsMap.set(p.id, sanitizedProject);
            // Non-blocking sync up to Supabase
            saveProjectToSupabase(sanitizedProject).catch((err) =>
              console.warn(`[Sync to Supabase Notice for ${p.id}]:`, err.message)
            );
          } else {
            const existing = projectsMap.get(p.id)!;
            if ((existing.clips?.length || 0) < (sanitizedProject.clips?.length || 0)) {
              projectsMap.set(p.id, sanitizedProject);
              saveProjectToSupabase(sanitizedProject).catch(() => {});
            }
          }
        }
      } catch {
        // Ignore unparseable job files
      }
    }
  }

  // 3. Fallback: If no projects exist in Supabase or local jobs, add initial demo projects
  if (projectsMap.size === 0) {
    for (const p of INITIAL_PROJECTS) {
      if (!deleted.projectIds.includes(p.id)) {
        const sanitized = sanitizeProjectEntity(p, deleted);
        projectsMap.set(p.id, sanitized);
      }
    }
  }

  // Remove any deleted projects from the map
  for (const pId of deleted.projectIds) {
    projectsMap.delete(pId);
  }

  // Return sorted by creation / updated date (newest first)
  const allProjects = Array.from(projectsMap.values());
  allProjects.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return allProjects;
}

/**
 * Get single project by ID from Supabase Storage (with local cache fallback)
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const deleted = getDeletedRecords();
  if (deleted.projectIds.includes(id)) return null;

  // 1. Try Supabase cloud store first
  try {
    const cloudProject = await getProjectFromSupabase(id);
    if (cloudProject && !deleted.projectIds.includes(cloudProject.id)) {
      return sanitizeProjectEntity(cloudProject, deleted);
    }
  } catch (err: any) {
    console.warn(`[Get Project from Supabase Notice for ${id}]:`, err.message);
  }

  // 2. Fall back to all projects (local jobs or presets)
  const all = await getAllProjects();
  const found = all.find((p) => p.id === id) || null;
  if (found) {
    // Sync to Supabase so it's persisted in cloud
    saveProjectToSupabase(found).catch(() => {});
  }
  return found;
}

/**
 * Persist full project to Supabase Storage and cache locally
 */
export async function saveProject(project: Project): Promise<Project> {
  const deleted = getDeletedRecords();
  if (deleted.projectIds.includes(project.id)) {
    throw new Error(`Cannot save project: Project ${project.id} has been deleted`);
  }

  const sanitized = sanitizeProjectEntity(
    {
      ...project,
      updatedAt: new Date().toISOString(),
    },
    deleted
  );

  // 1. Primary Store: Supabase Storage projects-data bucket
  await saveProjectToSupabase(sanitized);

  // 2. Fast Local Cache: public/jobs/${projectId}.json
  try {
    if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });
    const localJobPath = path.join(JOBS_DIR, `${sanitized.id}.json`);
    let existingJobData: any = {};
    if (fs.existsSync(localJobPath)) {
      try {
        existingJobData = JSON.parse(fs.readFileSync(localJobPath, 'utf-8'));
      } catch {}
    }
    const mergedJobData = {
      ...existingJobData,
      id: existingJobData.id || sanitized.id,
      projectId: sanitized.id,
      status: 'completed',
      project: sanitized,
      updatedAt: sanitized.updatedAt,
    };
    fs.writeFileSync(localJobPath, JSON.stringify(mergedJobData, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Local Job Cache Notice]:', err);
  }

  return sanitized;
}

/**
 * Update project metadata or properties and sync to Supabase
 */
export async function updateProjectInStore(id: string, updates: Partial<Project>): Promise<Project | null> {
  const current = await getProjectById(id);
  if (!current) return null;

  const merged: Project = {
    ...current,
    ...updates,
    id: current.id,
    updatedAt: new Date().toISOString(),
  };

  return await saveProject(merged);
}

/**
 * Update a specific clip within a project and sync to Supabase
 */
export async function updateClipInStore(
  projectId: string,
  clipId: string,
  updates: Partial<Clip>
): Promise<{ project: Project; clip: Clip } | null> {
  const current = await getProjectById(projectId);
  if (!current) return null;

  let updatedClip: Clip | null = null;
  const updatedClips = (current.clips || []).map((c) => {
    if (c.id === clipId) {
      updatedClip = {
        ...c,
        ...updates,
        id: c.id,
        projectId: current.id,
        updatedAt: new Date().toISOString(),
      };
      return updatedClip;
    }
    return c;
  });

  if (!updatedClip) return null;

  const updatedProject: Project = {
    ...current,
    clips: updatedClips,
    updatedAt: new Date().toISOString(),
  };

  const saved = await saveProject(updatedProject);
  return { project: saved, clip: updatedClip };
}

/**
 * Automatically clean up orphaned media downloads, temp files, and non-active renders
 */
export function cleanOrphanedMedia(): { removedFiles: number; freedBytes: number } {
  let removedFiles = 0;
  let freedBytes = 0;
  const deleted = getDeletedRecords();

  // Find all active project IDs from active job JSON files
  const activeProjectIds = new Set<string>();
  if (fs.existsSync(JOBS_DIR)) {
    const jobFiles = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('.'));
    for (const jf of jobFiles) {
      try {
        const content = fs.readFileSync(path.join(JOBS_DIR, jf), 'utf-8');
        const job = JSON.parse(content);
        if (job?.projectId && !deleted.projectIds.includes(job.projectId)) {
          activeProjectIds.add(job.projectId);
        }
        if (job?.project?.id && !deleted.projectIds.includes(job.project.id)) {
          activeProjectIds.add(job.project.id);
        }
      } catch {}
    }
  }

  // 1. Clean downloads directory (public/media/downloads)
  if (fs.existsSync(DOWNLOADS_DIR)) {
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const now = Date.now();
    for (const f of files) {
      if (f === '.gitkeep') continue;
      const fullPath = path.join(DOWNLOADS_DIR, f);
      try {
        const stats = fs.statSync(fullPath);
        const isOld = now - stats.mtimeMs > 2 * 60 * 1000; // > 2 mins old
        const projMatch = f.match(/^(proj-\d+)/);
        const fProjId = projMatch ? projMatch[1] : null;

        const isTombstoned = fProjId && deleted.projectIds.includes(fProjId);
        const isOrphan = fProjId && isOld && !activeProjectIds.has(fProjId);
        const isPartial = (f.endsWith('.part') || f.endsWith('.tmp') || f.endsWith('.ytdl')) && isOld;

        if (isTombstoned || isOrphan || isPartial) {
          freedBytes += stats.size;
          fs.rmSync(fullPath, { force: true });
          removedFiles++;
        }
      } catch {}
    }
  }

  // 2. Clean renders directory (public/renders)
  if (fs.existsSync(RENDERS_DIR)) {
    const entries = fs.readdirSync(RENDERS_DIR);
    for (const entry of entries) {
      if (entry === '.gitkeep') continue;
      const fullPath = path.join(RENDERS_DIR, entry);
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          if (deleted.projectIds.includes(entry) || !activeProjectIds.has(entry)) {
            const dirSize = (p: string): number => {
              let s = 0;
              try {
                for (const item of fs.readdirSync(p, { withFileTypes: true })) {
                  const ip = path.join(p, item.name);
                  if (item.isDirectory()) s += dirSize(ip);
                  else s += fs.statSync(ip).size;
                }
              } catch {}
              return s;
            };
            freedBytes += dirSize(fullPath);
            fs.rmSync(fullPath, { recursive: true, force: true });
            removedFiles++;
          }
        } else if (stats.isFile()) {
          const projMatch = entry.match(/(proj-\d+)/);
          if (projMatch && (deleted.projectIds.includes(projMatch[1]) || !activeProjectIds.has(projMatch[1]))) {
            freedBytes += stats.size;
            fs.rmSync(fullPath, { force: true });
            removedFiles++;
          }
        }
      } catch {}
    }
  }

  return { removedFiles, freedBytes };
}

/**
 * Permanently delete a project from Disk, Job records, and Supabase Storage
 */
export async function permanentlyDeleteProject(projectId: string): Promise<{
  success: boolean;
  deletedItems: { diskRenders: boolean; diskDownloads: boolean; jobs: number; supabase: boolean };
}> {
  // 0. Immediately record tombstone
  recordDeletedProject(projectId);

  const result = {
    diskRenders: false,
    diskDownloads: false,
    jobs: 0,
    supabase: false,
  };

  // 1. Delete local renders folder: public/renders/${projectId}
  try {
    const projectRenderDir = path.join(RENDERS_DIR, projectId);
    if (fs.existsSync(projectRenderDir)) {
      fs.rmSync(projectRenderDir, { recursive: true, force: true });
      result.diskRenders = true;
    }

    // Also check for any loose files matching projectId in RENDERS_DIR
    if (fs.existsSync(RENDERS_DIR)) {
      const renderFiles = fs.readdirSync(RENDERS_DIR);
      for (const rf of renderFiles) {
        if (rf.includes(projectId) && rf !== '.gitkeep') {
          fs.rmSync(path.join(RENDERS_DIR, rf), { recursive: true, force: true });
          result.diskRenders = true;
        }
      }
    }
  } catch (err) {
    console.warn(`[Delete Project Renders Warning]:`, err);
  }

  // 2. Delete local downloads: public/media/downloads/${projectId}*
  try {
    if (fs.existsSync(DOWNLOADS_DIR)) {
      const files = fs.readdirSync(DOWNLOADS_DIR);
      for (const f of files) {
        if (f.includes(projectId) && f !== '.gitkeep') {
          fs.rmSync(path.join(DOWNLOADS_DIR, f), { force: true });
          result.diskDownloads = true;
        }
      }
    }
  } catch (err) {
    console.warn(`[Delete Downloads Warning]:`, err);
  }

  // 3. Delete job files matching projectId in public/jobs/
  try {
    if (fs.existsSync(JOBS_DIR)) {
      const jobFiles = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('.'));
      for (const jf of jobFiles) {
        const jPath = path.join(JOBS_DIR, jf);
        try {
          if (jf.includes(projectId)) {
            fs.rmSync(jPath, { force: true });
            result.jobs += 1;
            continue;
          }
          const content = fs.readFileSync(jPath, 'utf-8');
          if (content.includes(projectId)) {
            fs.rmSync(jPath, { force: true });
            result.jobs += 1;
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.warn(`[Delete Jobs Warning]:`, err);
  }

  // 4. Sweep any leftover orphaned downloads or renders
  try {
    cleanOrphanedMedia();
  } catch {}

  // 5. Fire-and-forget Supabase Storage cleanup in background (never blocks local response)
  void (async () => {
    try {
      await Promise.allSettled([
        deleteProjectFromSupabase(projectId),
        deleteFromSupabaseStorage('video-temp', [`${projectId}.mp4`]),
        deleteFromSupabaseStorage('audio-temp', [`${projectId}.wav`]),
        deleteFromSupabaseStorage('final-videos', [
          `${projectId}/`,
          `${projectId}/combined-50s.mp4`,
        ]),
      ]);
    } catch {}
  })();
  result.supabase = true;

  return { success: true, deletedItems: result };
}

/**
 * Permanently delete a single clip from a project
 */
export async function permanentlyDeleteClip(projectId: string, clipId: string): Promise<boolean> {
  // 0. Immediately record tombstone
  recordDeletedClip(clipId);

  // 1. Delete all local clip render files
  try {
    const projectDir = path.join(RENDERS_DIR, projectId);
    if (fs.existsSync(projectDir)) {
      const files = fs.readdirSync(projectDir);
      for (const f of files) {
        if (f.includes(clipId)) {
          fs.rmSync(path.join(projectDir, f), { force: true });
        }
      }
    }
  } catch (err) {
    console.warn(`[Delete Clip Render Warning]:`, err);
  }

  // 2. Delete from Supabase Storage (non-blocking)
  try {
    const supDel = async () => {
      await deleteFromSupabaseStorage('final-videos', [
        `${projectId}/${clipId}.mp4`,
        `${projectId}/${clipId}-burned.mp4`,
      ]);
    };
    Promise.race([supDel(), new Promise((r) => setTimeout(r, 1200))]).catch(() => {});
  } catch (err) {
    console.warn(`[Delete Clip Supabase Warning]:`, err);
  }

  // 3. Update Supabase project to remove clip
  try {
    const proj = await getProjectFromSupabase(projectId);
    if (proj && Array.isArray(proj.clips)) {
      proj.clips = proj.clips.filter((c: any) => c.id !== clipId);
      proj.updatedAt = new Date().toISOString();
      await saveProjectToSupabase(proj);
    }
  } catch (err) {
    console.warn(`[Update Supabase on Clip Delete Warning]:`, err);
  }

  // 4. Update job JSON files to remove clip
  try {
    if (fs.existsSync(JOBS_DIR)) {
      const jobFiles = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('.'));
      for (const jf of jobFiles) {
        const jPath = path.join(JOBS_DIR, jf);
        try {
          const content = fs.readFileSync(jPath, 'utf-8');
          if (content.includes(clipId)) {
            const parsed = JSON.parse(content);
            if (parsed.project && Array.isArray(parsed.project.clips)) {
              parsed.project.clips = parsed.project.clips.filter((c: any) => c.id !== clipId);
              fs.writeFileSync(jPath, JSON.stringify(parsed, null, 2), 'utf-8');
            }
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.warn(`[Update Job On Clip Delete Warning]:`, err);
  }

  return true;
}

/**
 * Clean up rendered video files (.mp4, .tmp, .ass) for a specific project
 * while preserving project metadata, jobs, and lightweight .jpg thumbnails.
 */
export async function cleanProjectRenders(
  projectId: string,
  options: { keepThumbnails?: boolean } = { keepThumbnails: true }
): Promise<{ deletedCount: number; bytesReclaimed: number }> {
  let deletedCount = 0;
  let bytesReclaimed = 0;

  const projectDir = path.join(RENDERS_DIR, projectId);
  if (fs.existsSync(projectDir)) {
    try {
      const files = fs.readdirSync(projectDir);
      for (const f of files) {
        if (options.keepThumbnails && f.endsWith('.jpg')) {
          continue; // keep thumbnail preview for card UI
        }
        const full = path.join(projectDir, f);
        try {
          const stat = fs.statSync(full);
          bytesReclaimed += stat.size;
          fs.rmSync(full, { force: true });
          deletedCount++;
        } catch {}
      }
    } catch (err) {
      console.warn(`[Clean Project Renders Warning]:`, err);
    }
  }

  // Also clean any matching downloads in public/media/downloads
  if (fs.existsSync(DOWNLOADS_DIR)) {
    try {
      const downFiles = fs.readdirSync(DOWNLOADS_DIR);
      for (const df of downFiles) {
        if (df.startsWith(projectId)) {
          const full = path.join(DOWNLOADS_DIR, df);
          try {
            const stat = fs.statSync(full);
            bytesReclaimed += stat.size;
            fs.rmSync(full, { force: true });
            deletedCount++;
          } catch {}
        }
      }
    } catch {}
  }

  return { deletedCount, bytesReclaimed };
}

/**
 * Calculate disk space used by local renders, downloads, and jobs
 */
export function getStorageUsageStats() {
  const getDirSize = (dirPath: string): number => {
    let total = 0;
    if (!fs.existsSync(dirPath)) return 0;
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          total += getDirSize(fullPath);
        } else if (entry.isFile() && !entry.name.startsWith('.')) {
          try {
            total += fs.statSync(fullPath).size;
          } catch {}
        }
      }
    } catch {}
    return total;
  };

  const rendersBytes = getDirSize(RENDERS_DIR);
  const downloadsBytes = getDirSize(DOWNLOADS_DIR);
  const jobsBytes = getDirSize(JOBS_DIR);
  const totalBytes = rendersBytes + downloadsBytes + jobsBytes;

  return {
    rendersBytes,
    downloadsBytes,
    jobsBytes,
    totalBytes,
    formatted: {
      renders: (rendersBytes / (1024 * 1024)).toFixed(1) + ' MB',
      downloads: (downloadsBytes / (1024 * 1024)).toFixed(1) + ' MB',
      jobs: (jobsBytes / 1024).toFixed(1) + ' KB',
      total: (totalBytes / (1024 * 1024)).toFixed(1) + ' MB',
    },
  };
}

/**
 * Completely purge all local video renders, downloads, and job records
 */
export async function purgeAllStorageAndHistory() {
  let reclaimedFiles = 0;

  // 1. Purge renders
  if (fs.existsSync(RENDERS_DIR)) {
    const renderEntries = fs.readdirSync(RENDERS_DIR);
    for (const item of renderEntries) {
      if (item === '.gitkeep') continue;
      try {
        fs.rmSync(path.join(RENDERS_DIR, item), { recursive: true, force: true });
        reclaimedFiles++;
      } catch {}
    }
  } else {
    fs.mkdirSync(RENDERS_DIR, { recursive: true });
  }
  try {
    fs.writeFileSync(path.join(RENDERS_DIR, '.gitkeep'), '');
  } catch {}

  // 2. Purge downloads
  if (fs.existsSync(DOWNLOADS_DIR)) {
    const downloadEntries = fs.readdirSync(DOWNLOADS_DIR);
    for (const item of downloadEntries) {
      if (item === '.gitkeep') continue;
      try {
        fs.rmSync(path.join(DOWNLOADS_DIR, item), { recursive: true, force: true });
        reclaimedFiles++;
      } catch {}
    }
  } else {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
  try {
    fs.writeFileSync(path.join(DOWNLOADS_DIR, '.gitkeep'), '');
  } catch {}

  // 3. Purge jobs & tombstones
  if (fs.existsSync(JOBS_DIR)) {
    const jobEntries = fs.readdirSync(JOBS_DIR);
    for (const item of jobEntries) {
      if (item === '.gitkeep') continue;
      try {
        fs.rmSync(path.join(JOBS_DIR, item), { recursive: true, force: true });
        reclaimedFiles++;
      } catch {}
    }
  } else {
    fs.mkdirSync(JOBS_DIR, { recursive: true });
  }
  try {
    fs.writeFileSync(path.join(JOBS_DIR, '.gitkeep'), '');
  } catch {}

  return { success: true, reclaimedFiles };
}
