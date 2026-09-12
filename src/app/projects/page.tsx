'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { useApp } from '@/lib/store';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Film,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  Trash2,
  RefreshCw,
  Video,
  Layers,
} from 'lucide-react';

export default function ProjectsPage() {
  const { projects, refreshProjects, setIsCreateModalOpen, deleteProject, toast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cleaningId, setCleaningId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProjects();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDelete = async (id: string, title: string) => {
    setDeletingId(id);
    await deleteProject(id);
    setDeletingId(null);
  };

  const handleClean = async (id: string) => {
    setCleaningId(id);
    try {
      const res = await fetch(`/api/projects/${id}/cleanup`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast('Storage Cleaned 🧹', data.message, 'success');
      }
    } catch {} finally {
      setCleaningId(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.contentType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Project Video Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Projects & Source Recordings</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Showing all {projects.length} projects generated across your workspace and cloud storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white transition-all ${
                isRefreshing ? 'opacity-50 pointer-events-none' : ''
              }`}
              title="Refresh projects from database and jobs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Recording</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search projects by title, transcript keywords or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-xs font-semibold text-zinc-300 focus:border-violet-500 focus:outline-none"
            >
              <option value="all">All Content Types</option>
              <option value="podcast">Podcasts</option>
              <option value="interview">Interviews</option>
              <option value="gaming">Gaming</option>
              <option value="education">Educational</option>
              <option value="music">Music</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center space-y-4">
            <Film className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {projects.length === 0 ? 'No projects in workspace' : 'No matching projects found'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {projects.length === 0
                ? 'Your local storage has been completely cleared. Ready to start fresh with zero storage footprint!'
                : 'Try adjusting your search query or filter to find specific projects.'}
            </p>
            {projects.length === 0 && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition-all cursor-pointer mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-violet-500/40 hover:bg-zinc-900 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <Link href={`/projects/${project.id}`} className="block relative aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-800 cursor-pointer">
                    <img
                      src={project.videoAsset.thumbnailUrl}
                      alt={project.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase border border-white/10">
                      {project.contentType}
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white">
                      {Math.floor(project.videoAsset.durationSec / 60)}:
                      {(Math.floor(project.videoAsset.durationSec) % 60).toString().padStart(2, '0')}
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="text-base font-bold text-white line-clamp-1 leading-snug group-hover:text-violet-300 transition-colors cursor-pointer">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <strong className="text-zinc-300">{project.clips.length}</strong> AI Shorts
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-0 border-t border-zinc-800/80 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleClean(project.id)}
                      disabled={cleaningId === project.id}
                      className="p-2 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      title="Remove Rendered Video Files to Free Disk Storage"
                    >
                      <Sparkles className={`w-4 h-4 ${cleaningId === project.id ? 'animate-spin text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      disabled={deletingId === project.id}
                      className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Permanently Delete Project & All Files"
                    >
                      <Trash2 className={`w-4 h-4 ${deletingId === project.id ? 'animate-bounce text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600/20 text-violet-300 text-xs font-bold border border-violet-500/30 hover:bg-violet-600 hover:text-white transition-all"
                  >
                    <span>Open Project</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
