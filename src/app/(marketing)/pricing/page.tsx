'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Check, HelpCircle, Sparkles, X, Zap, Shield, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal for solo creators and hobbyists looking to test short-form video repurposing.',
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        '120 processing minutes per month',
        '720p HD export resolution',
        'Up to 5 AI clip suggestions per video',
        'Standard word-level captions',
        '1 Brand Kit',
        'Auto 9:16 vertical reframe',
        'ClipForge subtle watermark',
        'Community support',
      ],
      notIncluded: [
        'No watermark removal',
        'Live studio streaming mode',
        '1080p / 4K resolution',
        'Multilingual subtitle translation',
        'API & Webhook access',
      ],
      ctaText: 'Start Free Trial',
      popular: false,
      buttonVariant: 'outline',
    },
    {
      id: 'creator',
      name: 'Creator',
      description: 'Designed for active podcasters, streamers, and video creators publishing daily shorts.',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        '600 processing minutes per month',
        '1080p 60fps Full HD export',
        'No watermark on any export',
        'Up to 15 AI clip suggestions per video',
        'All 6 dynamic caption presets & animations',
        '3 Workspace Brand Kits with custom fonts',
        'Multilingual translation (10+ languages)',
        'Platform-tailored AI title & hashtag generator',
        'Priority rendering queue',
        'Live Studio mode (up to 2 hrs / stream)',
      ],
      notIncluded: [
        '4K Ultra HD exports',
        'Custom team member roles (RBAC)',
        'Unlimited Live Studio streams',
        'Dedicated API access',
      ],
      ctaText: 'Start Creator Trial',
      popular: true,
      buttonVariant: 'gradient',
    },
    {
      id: 'studio',
      name: 'Studio',
      description: 'Built for marketing teams, media networks, and agencies producing high-volume content.',
      monthlyPrice: 129,
      annualPrice: 99,
      features: [
        '2,000 processing minutes per month',
        '4K Ultra-HD & 1080p 60fps exports',
        'No watermark + Custom watermark positioning',
        'Up to 30 AI clip suggestions per video',
        'Unlimited Brand Kits for client accounts',
        'Unlimited Live Studio RTMP/HLS streams',
        'Full Multilingual subtitle & dubbing suite',
        'Team RBAC (Owner, Admin, Editor, Viewer)',
        'Direct Social Publishing integrations',
        'Full REST API & Webhook event delivery',
        'Dedicated account manager & 99.9% SLA',
      ],
      notIncluded: [],
      ctaText: 'Contact Studio Sales',
      popular: false,
      buttonVariant: 'outline',
    },
  ];

  const handleCheckout = (planId: string) => {
    setIsCheckingOut(planId);
    setTimeout(() => {
      window.location.href = `/signup?plan=${planId}&cycle=${billingCycle}`;
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      <Navbar />

      <main className="py-16 sm:py-24">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simple, predictable pricing</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white">
            Invest in your audience growth.
          </h1>
          <p className="mt-4 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Choose the right tier for your video repurposing volume. Upgrade, downgrade, or cancel anytime with zero lock-in.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex items-center rounded-xl bg-zinc-900/90 p-1 border border-zinc-800 backdrop-blur-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all flex flex-col justify-between ${
                  plan.popular
                    ? 'border-2 border-violet-500 bg-gradient-to-b from-violet-950/40 via-zinc-900 to-zinc-900 shadow-2xl shadow-violet-900/20 scale-[1.02]'
                    : 'border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-0.5 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-lg">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-xs text-zinc-400 min-h-[36px]">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">${price}</span>
                    <span className="text-sm text-zinc-400">/ month</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                    {billingCycle === 'annual' ? `Billed annually ($${price * 12}/yr)` : 'Billed monthly'}
                  </p>

                  <hr className="my-6 border-zinc-800" />

                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">What's included:</p>
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.notIncluded.length > 0 && (
                      <div className="pt-3 space-y-2.5">
                        <p className="text-xs font-semibold text-zinc-400">Not included:</p>
                        <ul className="space-y-2 text-xs text-zinc-400">
                          {plan.notIncluded.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <X className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isCheckingOut === plan.id}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-md ${
                      plan.buttonVariant === 'gradient'
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-violet-500/25 hover:opacity-95 hover:scale-[1.02]'
                        : 'border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                  >
                    {isCheckingOut === plan.id ? 'Redirecting...' : plan.ctaText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credit Overage & Usage Policy Section */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">How Credit Usage & Overages Work</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Credits represent video processing minutes. If you upload a 30-minute podcast episode, it consumes 30 processing credits regardless of how many clips you create or export. Unused credits roll over for 30 days.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="font-bold text-zinc-200">Zero Lock-in</span>
                <p className="text-zinc-400 mt-1">Upgrade or cancel anytime from your dashboard settings.</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="font-bold text-zinc-200">Extra Credit Packs</span>
                <p className="text-zinc-400 mt-1">Need more minutes? Add 100 minutes anytime for just $10.</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="font-bold text-zinc-200">Stripe Secure</span>
                <p className="text-zinc-400 mt-1">256-bit encrypted transactions with full tax invoices.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Feature Comparison Matrix */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-12">
            Detailed Feature Comparison Matrix
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="p-4 font-bold text-zinc-300 w-1/3">Feature</th>
                  <th className="p-4 font-bold text-zinc-300 text-center">Starter</th>
                  <th className="p-4 font-bold text-violet-400 text-center">Creator</th>
                  <th className="p-4 font-bold text-cyan-400 text-center">Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="p-4 font-medium">Monthly Processing Minutes</td>
                  <td className="p-4 text-center">120 mins</td>
                  <td className="p-4 text-center font-bold text-white">600 mins</td>
                  <td className="p-4 text-center font-bold text-cyan-300">2,000 mins</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Max Export Resolution</td>
                  <td className="p-4 text-center">720p HD</td>
                  <td className="p-4 text-center font-bold text-white">1080p 60fps</td>
                  <td className="p-4 text-center font-bold text-cyan-300">4K Ultra-HD</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">ClipForge Watermark</td>
                  <td className="p-4 text-center text-amber-400">Included</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Removed</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Removed + Custom</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">AI Highlight Detection (0-100 score)</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Dynamic Animated Captions (6 Presets)</td>
                  <td className="p-4 text-center">Basic</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Live Clipping Studio Mode</td>
                  <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-600 mx-auto" /></td>
                  <td className="p-4 text-center">2 hrs / stream</td>
                  <td className="p-4 text-center text-cyan-300 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Multilingual Subtitles (10+ Languages)</td>
                  <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Workspace Brand Kits</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center">3</td>
                  <td className="p-4 text-center text-cyan-300 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Team Member Roles (RBAC)</td>
                  <td className="p-4 text-center">1 seat</td>
                  <td className="p-4 text-center">3 seats</td>
                  <td className="p-4 text-center text-cyan-300 font-bold">15 seats</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">API & Webhook Delivery</td>
                  <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
