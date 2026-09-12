'use client';

// ClipForge AI - Global Client Application State Provider
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrandKit, Clip, LiveSession, Project, Workspace } from '@/types';
import { INITIAL_BRAND_KIT, INITIAL_LIVE_SESSION, INITIAL_PROJECTS, INITIAL_WORKSPACE } from './mock-data';

interface AppContextType {
  workspace: Workspace;
  updateWorkspace: (updates: Partial<Workspace>) => void;
  brandKit: BrandKit;
  updateBrandKit: (updates: Partial<BrandKit>) => void;
  projects: Project[];
  refreshProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  getClip: (projectId: string, clipId: string) => Clip | undefined;
  updateClip: (projectId: string, clipId: string, updates: Partial<Clip>) => void;
  deleteClip: (projectId: string, clipId: string) => Promise<void>;
  compileMegaShort: (projectId: string) => Promise<Clip | null>;
  liveSession: LiveSession;
  updateLiveSession: (updates: Partial<LiveSession>) => void;
  approveLiveMoment: (momentId: string) => void;
  rejectLiveMoment: (momentId: string) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  toast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  toastState: { visible: boolean; title: string; description?: string; type: 'success' | 'error' | 'info' };
  clearAllHistoryAndMedia: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function getLocalDeletedProjectIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('clipforge_deleted_project_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
}

function addLocalDeletedProjectId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getLocalDeletedProjectIds();
    set.add(id);
    localStorage.setItem('clipforge_deleted_project_ids', JSON.stringify(Array.from(set)));
  } catch {}
}

function getLocalDeletedClipIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('clipforge_deleted_clip_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
}

function addLocalDeletedClipId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getLocalDeletedClipIds();
    set.add(id);
    localStorage.setItem('clipforge_deleted_clip_ids', JSON.stringify(Array.from(set)));
  } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [brandKit, setBrandKit] = useState<BrandKit>(INITIAL_BRAND_KIT);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [liveSession, setLiveSession] = useState<LiveSession>(INITIAL_LIVE_SESSION);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastState, setToastState] = useState<{
    visible: boolean;
    title: string;
    description?: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, title: '', type: 'info' });

  // Initial synchronization with Supabase Cloud
  useEffect(() => {
    try {
      // Clear out legacy localstorage cache
      localStorage.removeItem('clipforge_projects');

      const savedBrand = localStorage.getItem('clipforge_brand_kit');
      if (savedBrand) {
        setBrandKit(JSON.parse(savedBrand));
      }
    } catch {
      // ignore
    }

    // Always fetch latest server projects from Supabase via API
    refreshProjects();
  }, []);

  const updateWorkspace = (updates: Partial<Workspace>) => {
    setWorkspace((prev) => ({ ...prev, ...updates }));
  };

  const updateBrandKit = (updates: Partial<BrandKit>) => {
    setBrandKit((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('clipforge_brand_kit', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const addProject = (project: Project) => {
    // Optimistic UI update
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== project.id);
      return [project, ...filtered];
    });

    // Cloud persistence in Supabase
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project }),
    }).catch((err) => console.warn('[Add Project Supabase Sync Warning]:', err));

    toast('Project Queued for Processing! 🚀', `AI is generating clips for "${project.title}"`, 'success');
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    // 1. Optimistically update client state immediately for instantaneous UI response
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );

    // 2. Persist directly to Supabase Storage in cloud
    fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => console.warn('[Update Project Supabase Sync Warning]:', err));
  };

  // Refresh projects from Supabase cloud store via API
  const refreshProjects = async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.projects)) {
          const deletedProjIds = getLocalDeletedProjectIds();
          const deletedClipIds = getLocalDeletedClipIds();

          const filtered = data.projects
            .filter((p: Project) => !deletedProjIds.has(p.id))
            .map((p: Project) => ({
              ...p,
              clips: (p.clips || []).filter((c: Clip) => !deletedClipIds.has(c.id)),
            }));

          setProjects(filtered);
        }
      }
    } catch (err) {
      console.warn('[Sync Projects from API Notice]:', err);
    }
  };

  const clearAllHistoryAndMedia = async () => {
    try {
      await fetch('/api/storage/clear', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('clipforge_projects');
      localStorage.removeItem('clipforge_deleted_project_ids');
      localStorage.removeItem('clipforge_deleted_clip_ids');
    } catch {}
    setProjects([]);
    toast('Storage Cleared & History Reset', 'All local video files and project histories have been purged.', 'success');
  };

  const deleteProject = async (id: string) => {
    // Record tombstone immediately in localStorage
    addLocalDeletedProjectId(id);

    // Optimistically remove from state
    setProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        keepalive: true,
      });
      if (res.ok) {
        toast('Project & Cloud Records Purged 🗑️', 'Video renders and Supabase data completely deleted.', 'info');
      } else {
        toast('Project Removed', 'Removed from library.', 'info');
      }
    } catch (err) {
      console.warn('[Delete API Error]:', err);
      toast('Project Removed', 'Removed from library.', 'info');
    }
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  const getClip = (projectId: string, clipId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    return proj?.clips.find((c) => c.id === clipId);
  };

  const updateClip = (projectId: string, clipId: string, updates: Partial<Clip>) => {
    // 1. Optimistically update client state immediately
    setProjects((prev) => {
      return prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          clips: p.clips.map((c) => (c.id === clipId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)),
        };
      });
    });

    // 2. Persist directly to Supabase cloud
    fetch(`/api/projects/${encodeURIComponent(projectId)}/clips/${encodeURIComponent(clipId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => console.warn('[Update Clip Supabase Sync Warning]:', err));
  };

  const deleteClip = async (projectId: string, clipId: string) => {
    // Record clip tombstone immediately in localStorage
    addLocalDeletedClipId(clipId);

    // Immediately remove clip from store state
    setProjects((prev) => {
      return prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          clips: p.clips.filter((c) => c.id !== clipId),
        };
      });
    });

    try {
      await fetch(`/api/projects/${encodeURIComponent(projectId)}/clips/${encodeURIComponent(clipId)}`, { method: 'DELETE' });
      toast('Clip Deleted Everywhere 🗑️', 'Video render and Supabase cloud files permanently purged.', 'info');
    } catch (err) {
      console.warn('[Delete Clip API Error]:', err);
    }
  };

  const compileMegaShort = async (projectId: string): Promise<Clip | null> => {
    toast('Compiling Master Short ⚡', 'Applying Situational Voice Filter & rapid-fire stitching across all clips...', 'info');
    try {
      const res = await fetch(`/api/projects/${projectId}/compile-mega-short`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.clip) {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            const filteredClips = p.clips.filter((c) => c.id !== data.clip.id);
            return {
              ...p,
              clips: [data.clip, ...filteredClips],
            };
          })
        );
        toast('Master Short Ready! 🔥', data.clip.title || 'All clips seamlessly stitched into 1 master cut!', 'success');
        return data.clip;
      } else {
        toast('Compilation Failed', data.error || 'Could not compile combined short', 'error');
        return null;
      }
    } catch (err: any) {
      toast('Compilation Error', err.message || 'Server error', 'error');
      return null;
    }
  };

  const updateLiveSession = (updates: Partial<LiveSession>) => {
    setLiveSession((prev) => ({ ...prev, ...updates }));
  };

  const approveLiveMoment = (momentId: string) => {
    setLiveSession((prev) => ({
      ...prev,
      moments: prev.moments.map((m) => (m.id === momentId ? { ...m, status: 'approved' } : m)),
    }));
    toast('Moment Approved! 🎬', 'Clip queued for automated vertical rendering and captions.', 'success');
  };

  const rejectLiveMoment = (momentId: string) => {
    setLiveSession((prev) => ({
      ...prev,
      moments: prev.moments.map((m) => (m.id === momentId ? { ...m, status: 'rejected' } : m)),
    }));
  };

  const toast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastState({ visible: true, title, description, type });
    setTimeout(() => {
      setToastState((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  return (
    <AppContext.Provider
      value={{
        workspace,
        updateWorkspace,
        brandKit,
        updateBrandKit,
        projects,
        refreshProjects,
        addProject,
        updateProject,
        deleteProject,
        getProject,
        getClip,
        updateClip,
        deleteClip,
        compileMegaShort,
        liveSession,
        updateLiveSession,
        approveLiveMoment,
        rejectLiveMoment,
        isCreateModalOpen,
        setIsCreateModalOpen,
        toast,
        toastState,
        clearAllHistoryAndMedia,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toastState.visible && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-xl border border-violet-500/30 bg-[#18181B]/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5">
          <div
            className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${
              toastState.type === 'success'
                ? 'bg-emerald-400 shadow-[0_0_12px_#10B981]'
                : toastState.type === 'error'
                ? 'bg-rose-400 shadow-[0_0_12px_#F43F5E]'
                : 'bg-cyan-400 shadow-[0_0_12px_#22D3EE]'
            }`}
          />
          <div>
            <p className="text-sm font-semibold text-white">{toastState.title}</p>
            {toastState.description && <p className="mt-1 text-xs text-zinc-400">{toastState.description}</p>}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
