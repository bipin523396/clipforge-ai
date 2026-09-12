import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { Shield, Sparkles, Video, Globe, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-850 bg-[#09090B] text-zinc-400">
      {/* Top Newsletter & Hook Bar */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-zinc-800/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-zinc-900 to-cyan-950/30 p-8 border border-violet-500/20">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stay ahead of the algorithm</span>
            </div>
            <h3 className="mt-1 text-xl font-bold text-white">Join 35,000+ creators scaling short-form content</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Get weekly viral video breakdowns, prompt playbooks, and new AI feature releases.
            </p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full md:w-72 rounded-xl bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand column */}
        <div className="col-span-2 space-y-4">
          <BrandLogo size="md" />
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
            ClipForge AI turns long recordings into high-converting vertical shorts in seconds. Powered by multi-agent audio-visual highlight detection, auto-reframe, and dynamic word-level captions.
          </p>
          <div className="flex items-center gap-3 pt-2 text-zinc-400">
            <a href="#" className="p-2 rounded-lg bg-zinc-900 hover:text-white hover:bg-zinc-800 transition-colors" aria-label="Media">
              <Video className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-zinc-900 hover:text-white hover:bg-zinc-800 transition-colors" aria-label="Community">
              <MessageSquare className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-zinc-900 hover:text-white hover:bg-zinc-800 transition-colors" aria-label="Global">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-zinc-900 hover:text-white hover:bg-zinc-800 transition-colors" aria-label="AI Features">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </a>
          </div>
        </div>

        {/* Product */}
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-white tracking-wider text-xs uppercase">Product</h4>
          <ul className="space-y-2.5">
            <li><Link href="/#features" className="hover:text-violet-400 transition-colors">AI Highlight Discovery</Link></li>
            <li><Link href="/#features" className="hover:text-violet-400 transition-colors">Smart Reframe 9:16</Link></li>
            <li><Link href="/#features" className="hover:text-violet-400 transition-colors">Dynamic Caption Engine</Link></li>
            <li><Link href="/live" className="hover:text-violet-400 transition-colors">Live Clipping Studio</Link></li>
            <li><Link href="/brand-kits" className="hover:text-violet-400 transition-colors">Brand Kit Presets</Link></li>
            <li><Link href="/pricing" className="hover:text-violet-400 transition-colors">Pricing & Plans</Link></li>
          </ul>
        </div>

        {/* Solutions */}
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-white tracking-wider text-xs uppercase">Solutions</h4>
          <ul className="space-y-2.5">
            <li><Link href="/#solutions" className="hover:text-cyan-400 transition-colors">Podcasters & Shows</Link></li>
            <li><Link href="/#solutions" className="hover:text-cyan-400 transition-colors">Streamers & Gaming</Link></li>
            <li><Link href="/#solutions" className="hover:text-cyan-400 transition-colors">Marketing Agencies</Link></li>
            <li><Link href="/#solutions" className="hover:text-cyan-400 transition-colors">Educators & Coaches</Link></li>
            <li><Link href="/#solutions" className="hover:text-cyan-400 transition-colors">Musicians & Artists</Link></li>
            <li><Link href="/#solutions" className="hover:text-cyan-400 transition-colors">Churches & Communities</Link></li>
          </ul>
        </div>

        {/* Legal & Company */}
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-white tracking-wider text-xs uppercase">Legal & Trust</h4>
          <ul className="space-y-2.5">
            <li><Link href="/privacy" className="hover:text-zinc-200 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-zinc-200 transition-colors">Terms of Service</Link></li>
            <li><Link href="/acceptable-use" className="hover:text-zinc-200 transition-colors">Acceptable Use</Link></li>
            <li><Link href="/copyright" className="hover:text-zinc-200 transition-colors">Copyright & DMCA</Link></li>
            <li><span className="inline-flex items-center gap-1 text-emerald-400 text-xs"><Shield className="w-3.5 h-3.5" /> SOC2 Compliant Cloud</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright notice */}
      <div className="border-t border-zinc-850 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} ClipForge AI Inc. All rights reserved. Original video intelligence software.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              All Processing Engines Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
