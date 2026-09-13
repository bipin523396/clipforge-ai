// ClipForge AI - Long Video Projects Persistence Store 🗄️

import fs from 'fs';
import path from 'path';
import os from 'os';
import { LongVideoProject } from '@/types/long-video';
import { uploadToSupabaseStorage } from './supabase';

const LONG_PROJECTS_MAP = new Map<string, LongVideoProject>();

const STORE_DIR = path.join(os.tmpdir(), 'clipforge-long-projects');
try {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
} catch {}

export function saveLongVideoProject(project: LongVideoProject): void {
  project.updatedAt = new Date().toISOString();
  LONG_PROJECTS_MAP.set(project.id, project);

  // 1. Write to local scratch disk
  try {
    const filePath = path.join(STORE_DIR, `${project.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Long Video Store Save Warning]:', err);
  }

  // 2. Asynchronous backup to Supabase Cloud Storage
  try {
    uploadToSupabaseStorage(
      'projects-data',
      `long-videos/${project.id}.json`,
      Buffer.from(JSON.stringify(project, null, 2)),
      'application/json'
    ).catch(() => {});
  } catch {}
}

export function getLongVideoProject(id: string): LongVideoProject | null {
  // Check in-memory first
  if (LONG_PROJECTS_MAP.has(id)) {
    return LONG_PROJECTS_MAP.get(id)!;
  }

  // Check local disk
  try {
    const filePath = path.join(STORE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      LONG_PROJECTS_MAP.set(id, data);
      return data;
    }
  } catch {}

  return null;
}

export function listLongVideoProjects(): LongVideoProject[] {
  const result: LongVideoProject[] = [];
  const seenIds = new Set<string>();

  // Add from memory
  for (const proj of LONG_PROJECTS_MAP.values()) {
    seenIds.add(proj.id);
    result.push(proj);
  }

  // Add from disk if not in memory
  try {
    if (fs.existsSync(STORE_DIR)) {
      const files = fs.readdirSync(STORE_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          if (!seenIds.has(id)) {
            try {
              const data = JSON.parse(fs.readFileSync(path.join(STORE_DIR, file), 'utf-8'));
              LONG_PROJECTS_MAP.set(id, data);
              result.push(data);
              seenIds.add(id);
            } catch {}
          }
        }
      }
    }
  } catch {}

  // Sort descending by creation date
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function deleteLongVideoProject(id: string): boolean {
  LONG_PROJECTS_MAP.delete(id);
  try {
    const filePath = path.join(STORE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch {
    return false;
  }
}
