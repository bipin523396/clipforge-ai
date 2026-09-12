'use client';

import React, { useState, useEffect } from 'react';
import { Clip } from '@/types';
import { MockCopyGenerationProvider } from '@/lib/ai/mock-provider';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Share2,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Video,
  ExternalLink,
} from 'lucide-react';
import { downloadVerifiedVideoMp4 } from '@/lib/client-download';

interface ExportModalProps {
  clip: Clip;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ clip, isOpen, onClose }) => {
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('4k');
  const [fps, setFps] = useState<number>(60);
  const [activePlatform, setActivePlatform] = useState<'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE_SHORTS' | 'X' | 'LINKEDIN'>('TIKTOK');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [exportStatusText, setExportStatusText] = useState('Rendering High-Bitrate Clip...');

  const [channelName, setChannelName] = useState(clip.overlays?.channelName || '');
  const [platformCopy, setPlatformCopy] = useState({
    title: '',
    caption: '',
    hashtags: [] as string[],
    suggestedPostingTime: '',
    callToAction: '',
  });

  const copyProvider = new MockCopyGenerationProvider();

  useEffect(() => {
    if (isOpen) {
      if (clip.overlays?.channelName && !channelName) {
        setChannelName(clip.overlays.channelName);
      }
      copyProvider
        .generateCopy({
          clipTitle: clip.title,
          hook: clip.hookStatement,
          transcriptSnippet: clip.captions.segments[0]?.text || '',
          platform: activePlatform,
        })
        .then((res) => {
          setPlatformCopy(res);
        });
    }
  }, [activePlatform, isOpen, clip]);

  if (!isOpen) return null;

  const triggerMp4Download = async (targetRes?: '720p' | '1080p' | '4k') => {
    const resToUse = targetRes || resolution || '4k';
    const channelParam = channelName.trim() ? `&channelName=${encodeURIComponent(channelName.trim())}` : '';
    const downloadUrl = `/api/projects/${clip.projectId}/clips/${clip.id}/download?resolution=${resToUse}${channelParam}`;
    const cleanName = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_${resToUse}.mp4`;
    await downloadVerifiedVideoMp4(downloadUrl, cleanName);
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setExportStatusText('Burning subtitles, headline & channel watermark...');
    
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: clip.projectId,
          clipId: clip.id,
          resolution,
          fps,
          forceRerender: true,
          channelName: channelName.trim() || undefined,
          cleanupIntermediate: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rendering failed');
      }

      setExportStatusText(resolution === '4k' ? 'Finalizing 4K Ultra-HD MP4 with faststart...' : 'Finalizing MP4 download...');
      setIsExporting(false);
      setExportComplete(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Automatically trigger verified file download
      setTimeout(() => {
        triggerMp4Download();
      }, 300);
    } catch (err: any) {
      console.error('[Export Modal Error]:', err.message);
      setIsExporting(false);
      setExportStatusText(`Export failed: ${err.message}`);
    }
  };

  const handleDownloadFile = (type: 'mp4' | 'srt' | 'vtt') => {
    let filename = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.${type}`;
    if (type === 'mp4') {
      triggerMp4Download();
      return;
    }

    const segs = clip.captions?.segments || [];
    let content = type === 'vtt' ? 'WEBVTT\n\n' : '';
    segs.forEach((seg, idx) => {
      const formatTime = (sec: number, isVtt = false) => {
        const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
        const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(sec % 60).toString().padStart(2, '0');
        const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
        return isVtt ? `${hrs}:${mins}:${secs}.${ms}` : `${hrs}:${mins}:${secs},${ms}`;
      };
      if (type === 'srt') {
        content += `${idx + 1}\n${formatTime(seg.startSec)} --> ${formatTime(seg.endSec)}\n${seg.text}\n\n`;
      } else {
        content += `${formatTime(seg.startSec, true)} --> ${formatTime(seg.endSec, true)}\n${seg.text}\n\n`;
      }
    });

    const blob = new Blob([content || '1\n00:00:00,000 --> 00:00:05,000\n[Subtitles]'], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-800 bg-[#121215] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export & Publish Short</h3>
              <p className="text-xs text-zinc-400">Generate high-bitrate video, subtitles, and viral social metadata.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Format Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resolution Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Export Resolution</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { id: '720p', label: '720p HD' },
                  { id: '1080p', label: '1080p Full' },
                  { id: '4k', label: '4K Ultra HD 🔥' },
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setResolution(res.id as any)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      resolution === res.id
                        ? 'border-violet-500 bg-violet-500/25 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] font-black ring-1 ring-violet-500/50'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FPS Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Framerate</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {[30, 60].map((frameRate) => (
                  <button
                    key={frameRate}
                    onClick={() => setFps(frameRate)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      fps === frameRate
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {frameRate} FPS
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Channel Name Watermark Overlay Input */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5 font-mono">
                <span>🏷️ Channel Name / Handle Watermark</span>
              </label>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Burned on Video
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
                This channel watermark and subtitles will be permanently burned directly onto the downloaded MP4 file.
              </p>
            </div>
            {channelName.trim() && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400 text-[11px]">Watermark Preview:</span>
                <span className="px-3 py-1 rounded bg-black/90 border border-white/20 text-white font-bold tracking-wider font-mono text-xs shadow">
                  {channelName.trim().startsWith('@') ? channelName.trim() : `| ${channelName.trim().toUpperCase()} |`}
                </span>
              </div>
            )}
          </div>

          {/* Social Platform Metadata Tabs */}
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>AI Social Copy & Platform Presets</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {platformCopy.suggestedPostingTime}
              </span>
            </div>

            {/* Platform Selector Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
              {(['TIKTOK', 'INSTAGRAM', 'YOUTUBE_SHORTS', 'X', 'LINKEDIN'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    activePlatform === p
                      ? 'border-violet-500 bg-violet-500/20 text-white shadow'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Platform Copy Details */}
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-400">Platform Title / Hook:</span>
                  <button
                    onClick={() => copyToClipboard(platformCopy.title, 'title')}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="font-bold text-white text-sm">{platformCopy.title}</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-400">Post Caption / Description:</span>
                  <button
                    onClick={() => copyToClipboard(platformCopy.caption, 'caption')}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-zinc-200 whitespace-pre-line leading-relaxed">{platformCopy.caption}</p>
              </div>
            </div>
          </div>

          {/* Quick Subtitle Downloads (.SRT & .VTT) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-400" />
                <span>Download Standalone Subtitle Files</span>
              </p>
              <p className="text-[11px] text-zinc-400">Synchronized word timestamps in universal subtitle formats.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadFile('srt')}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Download .SRT
              </button>
              <button
                onClick={() => handleDownloadFile('vtt')}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Download .VTT
              </button>
            </div>
          </div>
        </div>

        {/* Footer Render / Download Action */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-mono">
            Output: {resolution} • {fps}fps • H.264 MP4
          </div>

          <div className="flex gap-2">
            {exportComplete ? (
              <button
                onClick={() => handleDownloadFile('mp4')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-black text-zinc-950 shadow-lg shadow-emerald-500/25 hover:opacity-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Download MP4 File</span>
              </button>
            ) : (
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 disabled:opacity-50"
              >
                {isExporting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{exportStatusText}</span>
                  </span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Render & Download Clip</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
