'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './brand-logo';
import {
  LayoutDashboard,
  FolderKanban,
  Palette,
  Radio,
  BarChart3,
  Settings,
  Sparkles,
  Layers,
  HelpCircle,
  Film,
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects (Shorts)', href: '/projects', icon: FolderKanban },
    { name: 'Long Video AI Editor', href: '/long-video', icon: Film, badge: 'NEW' },
    { name: 'Brand Kits', href: '/brand-kits', icon: Palette },
    { name: 'Live Studio', href: '/live', icon: Radio, badge: 'Live' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings & Team', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-zinc-850 bg-[#09090B] p-4 text-zinc-400 select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 pt-2">
          <BrandLogo size="md" />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'border border-violet-500/30 bg-gradient-to-r from-violet-600/20 to-cyan-500/10 text-white shadow-sm shadow-violet-500/10'
                    : 'hover:bg-zinc-900/80 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-300' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.2 text-[9px] font-mono font-bold text-rose-300 uppercase animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pro Banner & Help */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-zinc-900 to-cyan-950/30 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Creator Plan Active</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            600 minutes / mo • 1080p 60fps exports • 3 Brand Kits
          </p>
          <Link
            href="/pricing"
            className="block text-center rounded-lg bg-zinc-950 py-1.5 text-[11px] font-bold text-cyan-300 hover:text-white border border-zinc-800 transition-colors"
          >
            Manage Subscription
          </Link>
        </div>

        <div className="flex items-center justify-between px-2 text-[11px] text-zinc-400">
          <span>ClipForge v2.4</span>
          <Link href="/#faq" className="hover:text-zinc-300 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Docs & Support
          </Link>
        </div>
      </div>
    </aside>
  );
};
