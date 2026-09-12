'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { ArrowRight, ChevronDown, Menu, Sparkles, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090B]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <BrandLogo size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <Link href="/#features" className="transition-colors hover:text-white hover:text-violet-400">
            Product
          </Link>
          <Link href="/#solutions" className="transition-colors hover:text-white hover:text-violet-400">
            Solutions
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-white hover:text-cyan-400">
            Pricing
          </Link>
          <Link href="/#workflow" className="transition-colors hover:text-white hover:text-violet-400">
            Workflow
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-white hover:text-violet-400">
            FAQ
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-300 transition-colors hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 transition-transform group-hover:rotate-12" />
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#09090B] px-4 pt-2 pb-6 space-y-4">
          <div className="flex flex-col space-y-3 pt-2 text-base font-medium text-zinc-200">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-850"
            >
              Product
            </Link>
            <Link
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-850"
            >
              Solutions
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-850"
            >
              Pricing
            </Link>
            <Link
              href="/#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-850"
            >
              Workflow
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-850"
            >
              FAQ
            </Link>
          </div>
          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="w-full text-center py-2.5 text-sm font-semibold rounded-lg bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="w-full text-center py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
            >
              Create clips free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
