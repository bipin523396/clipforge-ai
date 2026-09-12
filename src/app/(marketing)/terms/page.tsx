import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FileCheck, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      <Navbar />

      <main className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black text-white">Terms of Service</h1>
          <p className="mt-2 text-xs font-mono text-zinc-500">Effective Date: September 8, 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" /> 1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, uploading media, or using ClipForge AI services, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of an enterprise or organization, you represent that you possess the requisite authority to bind that entity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Content Ownership and User Responsibility</h2>
            <p>
              <strong className="text-white">You own all rights, title, and interest in your uploaded source videos and generated short-form clips.</strong> ClipForge AI claims zero intellectual property rights over the content you upload or export. You represent and warrant that you hold all necessary licenses, copyrights, rights of publicity, and consents for all footage, audio, and likenesses contained in your uploads.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Subscriptions, Credits and Billing</h2>
            <p>
              Subscriptions are billed on a recurring monthly or annual basis via Stripe. Each tier provides a designated allocation of processing minutes. Unused monthly minutes expire unless specified in your plan tier. Subscription cancellations take effect at the conclusion of the active billing period.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Fair Use and System Integrity</h2>
            <p>
              You agree not to bypass processing rate limits, reverse-engineer proprietary clipping heuristics, or exploit background processing workers. We reserve the right to suspend workspaces engaging in automated scraping, denial of service, or unauthorized API overloading.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
            <p>
              ClipForge AI is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, ClipForge AI shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from platform downtime or content export discrepancies.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
