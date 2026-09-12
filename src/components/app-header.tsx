'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { BrandLogo } from './brand-logo';
import {
  Bell,
  ChevronDown,
  Sparkles,
  Plus,
  Zap,
  CheckCircle2,
  ExternalLink,
  Shield,
  LogOut,
  Settings,
  CreditCard,
  User,
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { workspace, setIsCreateModalOpen } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: '7 AI Clips Ready',
      desc: 'Silicon Valley Founder Masterclass Ep. 42 has finished rendering.',
      time: '12m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Live Highlight Detected (96/100)',
      desc: 'Weekly Tech Broadcast surfaced a viral moment.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Monthly Credits Refreshed',
      desc: '300 high-definition processing minutes added to your account.',
      time: '1d ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-850 bg-[#09090B]/90 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile Brand & Workspace Switcher */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <BrandLogo size="sm" showText={false} />
        </div>

        {/* Workspace Switcher Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:border-zinc-700 cursor-pointer">
          <div className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-[10px] font-black text-black">
            {workspace.name.substring(0, 1)}
          </div>
          <span className="max-w-[140px] truncate">{workspace.name}</span>
          <span className="rounded bg-violet-500/20 px-1.5 py-0.2 text-[9px] font-mono text-violet-300 uppercase">
            {workspace.plan}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>

      {/* Right: Credits, Create Project Button, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Usage Credits Meter */}
        <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{workspace.creditsTotal - workspace.creditsUsed} mins</span>
          </div>
          <span className="text-zinc-500 text-[11px]">/ {workspace.creditsTotal} total</span>
          <div className="h-2 w-16 bg-zinc-800 rounded-full overflow-hidden ml-1">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
              style={{ width: `${(workspace.creditsUsed / workspace.creditsTotal) * 100}%` }}
            />
          </div>
          <Link
            href="/settings"
            className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold hover:underline ml-1"
          >
            + Top Up
          </Link>
        </div>

        {/* Quick Create Project Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Project</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-800 bg-[#18181B] p-4 shadow-2xl z-50 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-cyan-400 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      n.unread ? 'border-violet-500/30 bg-violet-950/20' : 'border-zinc-800/60 bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{n.title}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">{n.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl p-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center text-xs font-bold text-white">
              AY
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block mr-1" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-[#18181B] p-2 shadow-2xl z-50 animate-in fade-in text-xs">
              <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                <p className="font-bold text-white">Alex Vance</p>
                <p className="text-[11px] text-zinc-500 truncate">creator@clipforge.ai</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Settings className="w-3.5 h-3.5" /> Workspace Settings
              </Link>
              <Link
                href="/brand-kits"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Sparkles className="w-3.5 h-3.5" /> Brand Kits & Presets
              </Link>
              <Link
                href="/pricing"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <CreditCard className="w-3.5 h-3.5" /> Upgrade Plan
              </Link>
              <div className="border-t border-zinc-800 my-1" />
              <Link
                href="/"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
