'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  X,
  UploadCloud,
  PlaySquare,
  HardDrive,
  Radio,
  Sparkles,
  Sliders,
  FileVideo,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Filter,
  Music,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  AlertCircle,
} from 'lucide-react';
import { DiscoveryMode } from '@/types';
import { YouTubeProIcon } from '@/components/brand-logo';

export const CreateProjectModal: React.FC = () => {
  const router = useRouter();
  const { isCreateModalOpen, setIsCreateModalOpen, toast } = useApp();

  const [inputType, setInputType] = useState<'youtube' | 'upload' | 'cloud' | 'stream'>('upload');
  const [projectTitle, setProjectTitle] = useState('Why 90% of Tech Startups Fail Early');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [extraYoutubeUrls, setExtraYoutubeUrls] = useState<string[]>([]);
  const [songUrl, setSongUrl] = useState('');
  const [songSyncMode, setSongSyncMode] = useState(true);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(false);
  
  // Professional Dual Audio Controls & Auto-Ducking
  const [audioMode, setAudioMode] = useState<'original_plus_music' | 'original_only' | 'music_only'>('original_plus_music');
  const [includeOriginalAudio, setIncludeOriginalAudio] = useState(true);
  const [includeBgMusic, setIncludeBgMusic] = useState(true);
  const [originalAudioVolume, setOriginalAudioVolume] = useState(100);
  const [bgMusicVolume, setBgMusicVolume] = useState(15);
  const [autoDucking, setAutoDucking] = useState(true);

  const [autoRenderShorts, setAutoRenderShorts] = useState(true);
  const [headlineStyle, setHeadlineStyle] = useState<'yellow_white' | 'fire_orange' | 'neon_cyan' | 'none'>('yellow_white');
  const [channelName, setChannelName] = useState('');

  // Discovery Mode & Strategy State
  const [generationStrategy, setGenerationStrategy] = useState<'quality_first' | 'fast_multi' | 'custom'>('quality_first');
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('all_qualified');
  const [requestedCount, setRequestedCount] = useState(3);
  const [customCount, setCustomCount] = useState(3);
  const [minViralScore, setMinViralScore] = useState(80);
  const [timelineStart, setTimelineStart] = useState('00:00');
  const [timelineEnd, setTimelineEnd] = useState('15:00');
  const [removeOverlaps, setRemoveOverlaps] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);

  // Styling & Preferences
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [contentType, setContentType] = useState<'podcast' | 'gaming' | 'interview' | 'education' | 'music' | 'other'>('podcast');
  const [stylePreset, setStylePreset] = useState<'energetic' | 'clean' | 'cinematic' | 'educational' | 'minimal'>('energetic');
  const [preferredLang, setPreferredLang] = useState('en');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const parseTimeToSec = (str: string): number => {
    const parts = str.split(':').map((p) => Number(p.trim()) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return Number(str) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let timelineRange: [number, number] | undefined = undefined;
      if (discoveryMode === 'timeline') {
        timelineRange = [parseTimeToSec(timelineStart), parseTimeToSec(timelineEnd)];
      }

      let resolvedMediaUrl = youtubeUrl;

      if (inputType === 'upload') {
        if (!selectedFile) {
          throw new Error('Please select a video file to upload');
        }
        toast('Uploading Video...', 'Uploading file to cloud storage for processing...', 'info');
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        const uploadRes = await fetch('/api/pipeline/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        if (!uploadRes.ok) {
          throw new Error('Failed to upload video file to cloud storage');
        }
        const uploadData = await uploadRes.json();
        if (!uploadData.success || !uploadData.url) {
          throw new Error(uploadData.error || 'Video upload failed');
        }
        resolvedMediaUrl = uploadData.url;
      }

      const allYoutubeUrls = inputType === 'youtube' ? [resolvedMediaUrl, ...extraYoutubeUrls.filter(Boolean)] : [resolvedMediaUrl];

      const response = await fetch('/api/pipeline/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: resolvedMediaUrl,
          youtubeUrls: allYoutubeUrls,
          songUrl: songUrl.trim() || undefined,
          songSyncMode: Boolean(songUrl.trim() && songSyncMode),
          audioMode,
          includeOriginalAudio,
          includeBgMusic: Boolean(songUrl.trim() && includeBgMusic),
          originalAudioVolume,
          bgMusicVolume,
          autoDucking,
          muteOriginalAudio: audioMode === 'music_only' || !includeOriginalAudio,
          autoRender: autoRenderShorts,
          headlineStyle,
          title: projectTitle,
          discoveryMode,
          generationStrategy,
          minViralScore,
          requestedCount: requestedCount || 3,
          timelineRange,
          contentType,
          stylePreset,
          aspectRatio,
          preferredLang,
          channelName: channelName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start discovery: server responded with ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Failed to initialize discovery job');
      }

      if (autoRenderShorts) {
        toast('AI Generating Viral Shorts 🎬⚡', `Analyzing video, cutting viral moments & creating ${requestedCount || 3} shorts + master cut!`, 'success');
      } else {
        toast('Discovery Pipeline Initiated 🔍', 'Scanning entire video for non-overlapping viral moments...', 'success');
      }

      setIsCreateModalOpen(false);
      setIsSubmitting(false);

      // If auto-render is requested, go to the processing page to watch progress
      if (autoRenderShorts) {
        router.push(`/projects/${data.projectId}/processing?jobId=${data.jobId}`);
      } else {
        router.push(`/projects/${data.projectId}/discover?jobId=${data.jobId}`);
      }
    } catch (err: any) {
      console.error('[Launch Discovery Error]:', err);
      toast('Failed to Launch', err.message || 'Check URL and try again', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-zinc-800 bg-[#0f0f12] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Viral Moment Discovery & Ingestion</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Search ≠ Generate ⚡
                </span>
              </div>
              <p className="text-xs text-zinc-400">Discover all genuine viral moments across the full video, then choose which ones to render.</p>
            </div>
          </div>
          <button
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Input Method Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'upload', label: 'Upload File', icon: UploadCloud, badge: 'Recommended' },
              { id: 'youtube', label: 'YouTube URL', icon: YouTubeProIcon, isCustomIcon: true },
              { id: 'cloud', label: 'Cloud Storage', icon: HardDrive },
              { id: 'stream', label: 'Live Stream', icon: Radio },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = inputType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setInputType(tab.id as any)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-violet-500 bg-violet-500/20 text-white shadow-md shadow-violet-500/10'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.badge && (
                    <span className="absolute -top-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-black font-mono shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                  {tab.isCustomIcon ? (
                    <div className="mb-1">
                      <YouTubeProIcon className="w-5 h-5" />
                    </div>
                  ) : (
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-cyan-300' : 'text-zinc-500'}`} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* YouTube URL Input & Multi-Link Processing */}
          {inputType === 'youtube' && (
            <div className="space-y-3.5">
              {/* Cloud Server YouTube Notice */}
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-300">Cloud Datacenter Notice:</strong> YouTube blocks automated video downloads from server IP addresses (Render / AWS / GCP). For 100% instant reliability with zero restrictions, switch to the{' '}
                  <button
                    type="button"
                    onClick={() => setInputType('upload')}
                    className="font-bold underline text-amber-300 hover:text-white"
                  >
                    Upload File tab
                  </button>{' '}
                  to upload your video (MP4/MOV up to 2GB)!
                </div>
              </div>
              {/* Multi-Link Workflow Explanation Banner */}
              <div className="rounded-xl border border-violet-500/40 bg-gradient-to-r from-violet-950/50 via-indigo-950/30 to-zinc-950 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <YouTubeProIcon className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">
                      {extraYoutubeUrls.length > 0
                        ? `Multi-Source Viral Cross-Compilation Mode (${1 + extraYoutubeUrls.length} Videos)`
                        : 'Single YouTube Video Viral Discovery Mode'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-cyan-300 font-bold">
                    {extraYoutubeUrls.length > 0 ? 'Multi-Link Engine Active' : 'Standalone + Compilation'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {extraYoutubeUrls.length > 0
                    ? '⚡ YouTube 1 + YouTube 2 + ... → Extracts audio & transcripts from all links in parallel → AI scores high-retention moments across all videos → Joins top viral moments into one coherent master video!'
                    : '🎬 YouTube → Downloads original stream & extracts audio → AI discovers viral hooks, high-retention statements & emotional moments → Cuts standalone Shorts & high-retention compilations.'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300">YouTube Video URL #1</label>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded">
                  Primary Video
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-3">
                  <YouTubeProIcon className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-11 pr-4 py-3 text-xs sm:text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Extra Multiple YouTube URLs */}
              {extraYoutubeUrls.map((url, idx) => (
                <div key={idx} className="space-y-1.5 pt-1 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <YouTubeProIcon className="w-3.5 h-3.5" />
                      <span>YouTube Video URL #{idx + 2}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setExtraYoutubeUrls(extraYoutubeUrls.filter((_, i) => i !== idx));
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Link</span>
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5">
                      <YouTubeProIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const updated = [...extraYoutubeUrls];
                        updated[idx] = e.target.value;
                        setExtraYoutubeUrls(updated);
                      }}
                      placeholder="https://www.youtube.com/watch?v=... (Additional Video Link)"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExtraYoutubeUrls([...extraYoutubeUrls, ''])}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-violet-500/40 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ Add Another YouTube Video Link</span>
                </button>
                <span className="text-[11px] font-mono text-zinc-400">
                  {1 + extraYoutubeUrls.length} video {1 + extraYoutubeUrls.length === 1 ? 'link' : 'links'} configured
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                <span>✨ Downloads authentic video streams, extracts 48kHz audio & analyzes viral retention.</span>
                <span className="text-emerald-400 font-mono font-semibold">Source Media Sync</span>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {inputType === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-center hover:border-violet-500/60 transition-colors relative"
            >
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400">
                  <FileVideo className="w-6 h-6" />
                </div>
                <div>
                  {selectedFile ? (
                    <p className="text-sm font-bold text-emerald-400">Selected: {selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-white">Drag and drop your video file here</p>
                      <p className="text-xs text-zinc-500 mt-1">Supports MP4, MOV, WebM</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Project Title Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Project Title</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* CHANNEL NAME / WATERMARK BRANDING */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/15 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 font-mono">
                <span>🏷️ Channel Name / Handle (Watermark on Video)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 font-mono">
                ✨ Branded Watermark
              </span>
            </div>
            <div>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. @ShriHarivanshi108 or MY CHANNEL"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-zinc-400">
                This channel name will be permanently burned directly onto the video as a sleek branded watermark banner.
              </p>
            </div>
            {channelName.trim() && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-zinc-400 text-[11px]">Watermark preview:</span>
                <span className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-white font-bold tracking-wider text-xs">
                  {channelName.trim().startsWith('@') ? channelName.trim() : `| ${channelName.trim().toUpperCase()} |`}
                </span>
              </div>
            )}
          </div>

          {/* PROFESSIONAL AUDIO EXTRACTION, VOLUME MIXING & AUTO-DUCKING */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/15 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Audio Extraction & Smart Sound Mixing Engine 🎚️</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 font-mono">
                ✨ 48kHz Diarization
              </span>
            </div>

            <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3 text-xs text-zinc-300 space-y-1">
              <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300">
                <span>YouTube URL</span>
                <span>→</span>
                <span>Source Video</span>
                <span>→</span>
                <span>Extract Original Audio Track</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                The backend automatically extracts high-fidelity audio from your YouTube links, syncs timestamps with Whisper speech diarization, and mixes with background music.
              </p>
            </div>

            {/* Background Song Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Background Music / Track Link (Optional)</span>
                <span className="text-[10px] text-amber-400 font-mono">YouTube Song, Beat or MP3</span>
              </label>
              <div className="relative">
                <Music className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={songUrl}
                  onChange={(e) => {
                    setSongUrl(e.target.value);
                    if (e.target.value.trim() && !includeBgMusic) {
                      setIncludeBgMusic(true);
                    }
                  }}
                  placeholder="Paste YouTube song link, Spotify audio, or MP3 track..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Audio Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">Audio Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'original_plus_music', label: 'Original + Music', sub: 'Speech Auto-Ducked' },
                  { id: 'original_only', label: 'Original Only', sub: 'Pure Spoken Voice' },
                  { id: 'music_only', label: 'Music Only', sub: 'Mutes Original' },
                ].map((mode) => {
                  const isSelected = audioMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setAudioMode(mode.id as any);
                        if (mode.id === 'original_only') {
                          setIncludeOriginalAudio(true);
                          setIncludeBgMusic(false);
                          setMuteOriginalAudio(false);
                        } else if (mode.id === 'music_only') {
                          setIncludeOriginalAudio(false);
                          setIncludeBgMusic(true);
                          setMuteOriginalAudio(true);
                        } else {
                          setIncludeOriginalAudio(true);
                          setIncludeBgMusic(true);
                          setMuteOriginalAudio(false);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{mode.label}</span>
                      <span className="block text-[9px] text-zinc-400 mt-0.5">{mode.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Audio Track Toggles & Volume Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Original Voice Audio */}
              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOriginalAudio}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIncludeOriginalAudio(checked);
                        if (!checked && !includeBgMusic) setIncludeBgMusic(true);
                        setMuteOriginalAudio(!checked);
                      }}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">Original Video Audio</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {includeOriginalAudio ? `${originalAudioVolume}%` : 'Muted'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Speech Volume</span>
                    </span>
                    <span className="font-mono">{originalAudioVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={originalAudioVolume}
                    disabled={!includeOriginalAudio}
                    onChange={(e) => setOriginalAudioVolume(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Background Music Audio */}
              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBgMusic}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIncludeBgMusic(checked);
                        if (!checked && !includeOriginalAudio) {
                          setIncludeOriginalAudio(true);
                          setMuteOriginalAudio(false);
                        }
                      }}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">Background Music</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {includeBgMusic ? `${bgMusicVolume}%` : 'Off'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Music Volume</span>
                    </span>
                    <span className="font-mono">{bgMusicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgMusicVolume}
                    disabled={!includeBgMusic}
                    onChange={(e) => setBgMusicVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Auto Ducking Switch */}
            <div className="rounded-xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/30 p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">🎚️ Auto Ducking</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    autoDucking ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {autoDucking ? 'ON (Active)' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Automatically ducks background music by -18dB when someone is speaking, then smoothly restores music level during pauses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoDucking(!autoDucking)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoDucking ? 'bg-amber-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoDucking ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* AI Beat-Sync Toggle */}
            <div className="flex items-start gap-3 rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800">
              <input
                type="checkbox"
                id="songSyncToggle"
                checked={songSyncMode}
                onChange={(e) => setSongSyncMode(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
              />
              <label htmlFor="songSyncToggle" className="cursor-pointer text-xs space-y-0.5">
                <span className="font-bold text-white block">
                  AI Beat-Sync & Retention Drop Matching ⚡
                </span>
                <span className="text-zinc-400 block leading-relaxed text-[11px]">
                  Analyzes music BPM, syncing viral cuts and punch-ins to beat drops for maximal audience retention.
                </span>
              </label>
            </div>
          </div>

          {/* CATCHY BIG-LETTER COLORFUL HEADLINE TITLES (MATCHING USER SCREENSHOT) */}
          <div className="rounded-2xl border border-yellow-500/40 bg-yellow-950/15 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-300 font-mono">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Catchy Big-Letter Colorful Headline Titles 🎨</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-300 font-mono">
                ⭐ Viral Hook Design
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              AI crafts custom high-retention, curiosity-driven titles in <strong>BIG BOLD LETTERS</strong> placed prominently at the top of each short video, styled with vibrant two-tone color contrast so viewers can't scroll past!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Style 1: White & Vibrant Gold/Yellow */}
              <div
                onClick={() => setHeadlineStyle(headlineStyle === 'yellow_white' ? 'none' : 'yellow_white')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  headlineStyle === 'yellow_white'
                    ? 'border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-400'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">White & Neon Yellow</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Popular</span>
                </div>
                <div className="rounded-lg bg-black/90 p-2.5 border border-yellow-400/40 text-center shadow-inner">
                  <p className="text-xs font-black uppercase tracking-wide leading-snug">
                    <span className="text-white">VIRAT KOHLI'S </span>
                    <span className="text-yellow-400">UNREAL KNOCK! 🏏</span>
                  </p>
                </div>
                <p className="text-[10px] text-zinc-400 text-center">Top performer for sports, podcasts, & comedy</p>
              </div>

              {/* Style 2: White & Fire Orange */}
              <div
                onClick={() => setHeadlineStyle(headlineStyle === 'fire_orange' ? 'none' : 'fire_orange')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  headlineStyle === 'fire_orange'
                    ? 'border-orange-400 bg-orange-500/20 shadow-lg shadow-orange-500/10 ring-1 ring-orange-400'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">White & Fire Orange</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">High Drama</span>
                </div>
                <div className="rounded-lg bg-black/90 p-2.5 border border-orange-500/40 text-center shadow-inner">
                  <p className="text-xs font-black uppercase tracking-wide leading-snug">
                    <span className="text-white">MOM'S REACTION </span>
                    <span className="text-orange-400">WAS UNREAL 💀🔥</span>
                  </p>
                </div>
                <p className="text-[10px] text-zinc-400 text-center">Shock, reaction, & emotional storytelling</p>
              </div>

              {/* Style 3: White & Electric Cyan */}
              <div
                onClick={() => setHeadlineStyle(headlineStyle === 'neon_cyan' ? 'none' : 'neon_cyan')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  headlineStyle === 'neon_cyan'
                    ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">White & Electric Cyan</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Tech & Mind</span>
                </div>
                <div className="rounded-lg bg-black/90 p-2.5 border border-cyan-400/40 text-center shadow-inner">
                  <p className="text-xs font-black uppercase tracking-wide leading-snug">
                    <span className="text-white">THE UNTOLD TRUTH </span>
                    <span className="text-cyan-300">ABOUT THIS 🤯⚡</span>
                  </p>
                </div>
                <p className="text-[10px] text-zinc-400 text-center">Facts, science, & curiosity breakdowns</p>
              </div>
            </div>

            {/* Auto-Generate Toggle */}
            <div className="flex items-start gap-3 rounded-xl bg-zinc-950/70 p-3.5 border border-zinc-800">
              <input
                type="checkbox"
                id="autoRenderToggle"
                checked={autoRenderShorts}
                onChange={(e) => setAutoRenderShorts(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-violet-500/30 cursor-pointer"
              />
              <label htmlFor="autoRenderToggle" className="cursor-pointer text-xs space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>⚡ Auto-Generate 3 Viral Shorts & 50s Mega Cut Immediately</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Fast-Track</span>
                </span>
                <span className="text-zinc-400 block leading-relaxed">
                  Skip manual moment selection: AI instantly ingests the video, syncs to the song, finds the 3 best moments, applies big titles & subtitles, and renders ready-to-play short videos directly into your workspace.
                </span>
              </label>
            </div>
          </div>

          {/* GENERATION STRATEGY SELECTOR */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Generation Strategy</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Prioritize Quality Over Quantity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quality First */}
              <div
                onClick={() => setGenerationStrategy('quality_first')}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  generationStrategy === 'quality_first'
                    ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/10'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">⭐ Quality-First Mode</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-400/20 text-cyan-300 font-mono">
                    Deep QA & Polish
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Focuses compute on selecting the #1 single best moment. Automatically runs multi-stage video QA and up to 3 iterative re-editing passes to guarantee high retention.
                </p>
              </div>

              {/* Fast Multi-Clip */}
              <div
                onClick={() => setGenerationStrategy('fast_multi')}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  generationStrategy === 'fast_multi'
                    ? 'border-violet-500 bg-violet-600/20 text-white shadow-lg shadow-violet-500/10'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">⚡ Fast Multi-Clip</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-300 font-mono">
                    Batch Mode
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Discovers all qualified moments across the full video and allows selecting multiple shorts to render in parallel.
                </p>
              </div>
            </div>
          </div>

          {/* VIRAL MOMENT DISCOVERY MODE SELECTOR */}
          <div className="rounded-2xl border border-violet-500/30 bg-violet-950/15 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Viral Moment Discovery Mode</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Full-Video Search ≠ Render</span>
            </div>

            {/* Mode Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: All Moments */}
              <div
                onClick={() => setDiscoveryMode('all_qualified')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                  discoveryMode === 'all_qualified'
                    ? 'border-violet-500 bg-violet-600/20 text-white shadow'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">Find ALL Genuine Moments</p>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                    ⭐ Recommended
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Scans entire video and returns every moment above score threshold.
                </p>
              </div>

              {/* Option 2: Top N Moments */}
              <div
                onClick={() => setDiscoveryMode('top_n')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                  discoveryMode === 'top_n'
                    ? 'border-violet-500 bg-violet-600/20 text-white shadow'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <p className="text-xs font-bold">Find Specific Number (Top N)</p>
                <p className="text-[11px] text-zinc-400">
                  Discovers the best 1, 3, 5, 10, or custom non-overlapping moments.
                </p>
              </div>

              {/* Option 3: Timeline Range */}
              <div
                onClick={() => setDiscoveryMode('timeline')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                  discoveryMode === 'timeline'
                    ? 'border-violet-500 bg-violet-600/20 text-white shadow'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <p className="text-xs font-bold">Specific Timeline Window</p>
                <p className="text-[11px] text-zinc-400">
                  Analyze only within selected start and end timestamps.
                </p>
              </div>
            </div>

            {/* Dynamic Configuration Controls based on mode */}
            {(discoveryMode === 'top_n' || discoveryMode === 'all_qualified') && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-300">Target Count:</span>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRequestedCount(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                        requestedCount === num
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Best {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {discoveryMode === 'timeline' && (
              <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">From Timestamp (mm:ss)</label>
                  <input
                    type="text"
                    value={timelineStart}
                    onChange={(e) => setTimelineStart(e.target.value)}
                    placeholder="00:00"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">To Timestamp (mm:ss)</label>
                  <input
                    type="text"
                    value={timelineEnd}
                    onChange={(e) => setTimelineEnd(e.target.value)}
                    placeholder="15:00"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Minimum Viral Score Slider & Deduplication Checkboxes */}
            <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                  <span>Minimum Viral Score:</span>
                  <span className="font-mono text-cyan-300 font-bold">{minViralScore}/100</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="92"
                  value={minViralScore}
                  onChange={(e) => setMinViralScore(Number(e.target.value))}
                  className="w-full accent-violet-500 h-1.5 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 text-xs text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeOverlaps}
                    onChange={(e) => setRemoveOverlaps(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Remove overlapping moments (distinct timestamps)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeDuplicates}
                    onChange={(e) => setRemoveDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Cloudflare semantic deduplication (unique topics)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Aspect Ratio & Content Preset */}
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Output Formatting</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Output Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                >
                  <option value="9:16">9:16 Vertical (Shorts, Reels, TikTok)</option>
                  <option value="1:1">1:1 Square (Instagram, LinkedIn)</option>
                  <option value="16:9">16:9 Landscape (YouTube)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Content Preset</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                >
                  <option value="podcast">Podcast / Conversation</option>
                  <option value="interview">1-on-1 Interview</option>
                  <option value="education">Educational Lecture / Course</option>
                  <option value="gaming">Gaming Stream</option>
                  <option value="music">Music Performance</option>
                  <option value="other">General Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Editing Style</label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                >
                  <option value="energetic">Energetic (Kinetic pop, punch-ins)</option>
                  <option value="clean">Clean & Professional</option>
                  <option value="cinematic">Cinematic Documentary</option>
                  <option value="educational">Educational & Structured</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Footer Submit */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Video Ingestion & AI Moment Discovery</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-750"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? (autoRenderShorts ? 'Generating Viral Shorts...' : 'Starting Discovery...')
                    : (autoRenderShorts ? 'Generate AI Shorts & Viral Moments 🚀' : 'Start Viral Moment Discovery 🔍')}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
