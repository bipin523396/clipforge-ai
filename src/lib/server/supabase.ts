// ClipForge AI - Supabase Client & Storage Adapter ☁️
// Handles cloud persistence for projects, edited clips, and rendered media in Supabase Storage

import { Project } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wqwlqbozwcbcxjbxlqmh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export type SupabaseBucketName = 'video-temp' | 'audio-temp' | 'final-videos' | 'projects-data';

export interface SupabaseBucket {
  id: string;
  name: string;
  public: boolean;
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  status: string;
  url: string;
  buckets?: string[];
  error?: string;
}> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) {
      // Try auth health endpoint as secondary check
      const authRes = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        headers: { apikey: SUPABASE_KEY },
      });
      if (authRes.ok) {
        return {
          connected: true,
          status: 'Authenticated & Online',
          url: SUPABASE_URL,
        };
      }
      return {
        connected: false,
        status: `HTTP ${res.status}: ${res.statusText}`,
        url: SUPABASE_URL,
        error: `Supabase responded with status ${res.status}`,
      };
    }

    const buckets: SupabaseBucket[] = await res.json();
    const existingBucketNames = buckets.map((b) => b.name);

    // Auto-create required buckets if missing
    const requiredBuckets: SupabaseBucketName[] = ['video-temp', 'audio-temp', 'final-videos', 'projects-data'];
    for (const bName of requiredBuckets) {
      if (!existingBucketNames.includes(bName)) {
        try {
          await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: bName, name: bName, public: true }),
          });
        } catch {
          // Ignore
        }
      }
    }

    return {
      connected: true,
      status: 'Connected & Authenticated',
      url: SUPABASE_URL,
      buckets: existingBucketNames,
    };
  } catch (err: any) {
    return {
      connected: false,
      status: 'Connection Failed',
      url: SUPABASE_URL,
      error: err.message || 'Network error connecting to Supabase endpoint',
    };
  }
}

/**
 * Upload a media file or asset to Supabase Storage
 */
export async function uploadToSupabaseStorage(
  bucket: SupabaseBucketName,
  filePath: string,
  fileBuffer: Buffer | Uint8Array | string,
  contentType: string = 'video/mp4'
): Promise<string> {
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: fileBuffer as any,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase Storage Upload Failed: ${text}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}

/**
 * Delete one or more files from Supabase Storage
 */
export async function deleteFromSupabaseStorage(
  bucket: SupabaseBucketName,
  prefixes: string[]
): Promise<boolean> {
  if (!prefixes || prefixes.length === 0) return true;
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[Supabase Delete Warning from ${bucket}]:`, text);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase Delete Error]:`, err.message);
    return false;
  }
}

/**
 * Save / update full project document in Supabase Storage (projects-data bucket)
 */
export async function saveProjectToSupabase(project: Project): Promise<string> {
  if (!project || !project.id) {
    throw new Error('Cannot save project to Supabase: Missing project ID');
  }
  const body = JSON.stringify(project, null, 2);
  const url = `${SUPABASE_URL}/storage/v1/object/projects-data/${project.id}.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to save project to Supabase: ${errText}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/projects-data/${project.id}.json`;
}

/**
 * Retrieve single project by ID from Supabase Storage
 */
export async function getProjectFromSupabase(projectId: string): Promise<Project | null> {
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/projects-data/${projectId}.json?t=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const project: Project = await res.json();
    return project;
  } catch (err: any) {
    console.warn(`[Supabase Get Project Warning for ${projectId}]:`, err.message);
    return null;
  }
}

/**
 * List and fetch all projects from Supabase Storage
 */
export async function getAllProjectsFromSupabase(): Promise<Project[]> {
  try {
    const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/projects-data`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix: '', limit: 100 }),
      cache: 'no-store',
    });

    if (!listRes.ok) {
      return [];
    }

    const items: Array<{ name: string }> = await listRes.json();
    if (!Array.isArray(items) || items.length === 0) return [];

    const jsonFiles = items.filter((item) => item.name && item.name.endsWith('.json'));

    const projectPromises = jsonFiles.map(async (item) => {
      try {
        const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/projects-data/${item.name}?t=${Date.now()}`;
        const res = await fetch(fileUrl, {
          headers: { apikey: SUPABASE_KEY },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) return data as Project;
        }
      } catch {
        // Ignore individual project fetch error
      }
      return null;
    });

    const results = await Promise.all(projectPromises);
    return results.filter((p): p is Project => p !== null);
  } catch (err: any) {
    console.warn('[Supabase Get All Projects Error]:', err.message);
    return [];
  }
}

/**
 * Permanently delete project record from Supabase Storage
 */
export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/projects-data`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: [`${projectId}.json`] }),
    });
    return res.ok;
  } catch (err: any) {
    console.warn(`[Supabase Delete Project Error for ${projectId}]:`, err.message);
    return false;
  }
}


