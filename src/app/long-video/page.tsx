'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { LongVideoProject } from '@/types/long-video';
import {
  Film,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ArrowUpRight,
  Trash2,
  RefreshCw,
  Play,
  Layers,
  MessageSquare,
  Wand2,
  X,
  FileVideo,
} from 'lucide-react';
import { YouTubeProIcon } from '@/components/brand-logo';

export default function LongVideoProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<LongVideoProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [inputType, setInputType] = useState<'upload' | 'youtube'>('upload');
  const [projectTitle, setProjectTitle] = useState('India vs Pakistan Highlights - Sanju Samson Focus');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/long-video/projects');
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn('[Fetch Long Projects Warning]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorNotice(null);

    try {
      let resolvedUrl = youtubeUrl;

      if (inputType === 'upload') {
        if (!selectedFile) {
          throw new Error('Please select a video file to upload');
        }

        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/pipeline/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload video file to server');
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.success || !uploadData.url) {
          throw new Error(uploadData.error || 'Video upload failed');
        }
        resolvedUrl = uploadData.url;
      }

      const res = await fetch('/api/long-video/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: resolvedUrl,
          title: projectTitle,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.projectId) {
        throw new Error(data.error || 'Failed to initialize long video project');
      }

      setIsCreateModalOpen(false);
      router.push(`/long-video/${data.projectId}`);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this long video project?')) return;

    try {
      await fetch(`/api/long-video/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-violet-950/30 p-6 sm:p-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Film className="w-3.5 h-3.5" />
              <span>Full-Length Video AI Studio</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">NEW</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Long Video Conversational Editor</h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Upload long matches, podcasts, or full broadcasts. Our multi-modal engine indexes speech, OCR scoreboards, and scene cuts once — then you can direct the edit simply by chatting with AI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:opacity-95 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Long Video Project</span>
            </button>
          </div>
        </div>

        {/* Workflow Explainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase font-mono">
              <span>1. One-Time Multi-Modal Index</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Analyzes commentary transcripts, player names, scoreboards, and delivery cuts once so future edits take seconds.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-2">
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase font-mono">
              <span>2. Conversational Director</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tell the AI: <em>"Show only Sanju Samson batting"</em> or <em>"Keep 3s before delivery and remove replays"</em> to get instant timecoded edit plans.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase font-mono">
              <span>3. Master FFmpeg Export</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Cuts, applies optional text/watermark blur, and concatenates all selected sequences into a 1080p master video.
            </p>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Your Long Video Projects</span>
              <span className="text-xs font-mono text-zinc-500">({projects.length})</span>
            </h2>
            <button
              onClick={fetchProjects}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs">
              Loading Long Video Projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Film className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">No long video projects yet</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Start your first conversational edit by uploading a match, podcast, or sports broadcast.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
              >
                + New Long Video Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => {
                const isReady = proj.status === 'ready';
                const isIndexing = proj.status === 'indexing';
                const isCompleted = proj.status === 'completed';
                const isRendering = proj.status === 'rendering';

                return (
                  <Link
                    key={proj.id}
                    href={`/long-video/${proj.id}`}
                    className="group rounded-3xl border border-zinc-850 bg-zinc-900/60 p-5 space-y-4 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top status & actions */}
                      <div className="flex items-center justify-between">
                        {isIndexing && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                            Indexing ({proj.progressPct}%)
                          </span>
                        )}
                        {isReady && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            <MessageSquare className="w-3 h-3 text-cyan-300" />
                            Ready for AI Chat
                          </span>
                        )}
                        {isRendering && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30 animate-pulse">
                            <Wand2 className="w-3 h-3 text-violet-300 animate-spin" />
                            Rendering ({proj.progressPct}%)
                          </span>
                        )}
                        {isCompleted && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Master Render Ready
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, proj.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & info */}
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {proj.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 truncate">
                          {proj.sourceUrl}
                        </p>
                      </div>

                      {/* Entities tag list */}
                      {proj.indexedCatalog && proj.indexedCatalog.detectedPeople.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.indexedCatalog.detectedPeople.slice(0, 3).map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-300">
                              👤 {p}
                            </span>
                          ))}
                          {proj.indexedCatalog.events.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
                              ⚡ {proj.indexedCatalog.events.length} events
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>{proj.durationSec > 0 ? `${Math.floor(proj.durationSec / 60)}m ${Math.round(proj.durationSec % 60)}s` : 'Probing...'}</span>
                      <span className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Open Studio <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Dedicated Create Long Video Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">New Long Video AI Project</h3>
                    <p className="text-xs text-zinc-400">Index once, direct with conversation, export cleanly.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorNotice && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4">
                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputType('upload')}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      inputType === 'upload'
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Video File (Recommended)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('youtube')}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      inputType === 'youtube'
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <YouTubeProIcon className="w-4 h-4" />
                    <span>YouTube Link</span>
                  </button>
                </div>

                {/* Input Fields */}
                {inputType === 'upload' ? (
                  <div className="rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center hover:border-cyan-500/60 transition-colors relative">
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <div className="mx-auto h-10 w-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                        <FileVideo className="w-5 h-5" />
                      </div>
                      {selectedFile ? (
                        <p className="text-xs font-bold text-emerald-400">Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</p>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-white">Click or drag & drop video file</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Supports MP4, MOV, WebM up to 2GB</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">YouTube Video URL</label>
                    <input
                      type="url"
                      required
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Project Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-xs font-bold text-white hover:opacity-90 shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading & Initializing...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Start Multi-Modal Indexing</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
