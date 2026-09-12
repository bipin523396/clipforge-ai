import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AlertTriangle, CheckCircle, Ban } from 'lucide-react';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      <Navbar />

      <main className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Platform Guidelines</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black text-white">Acceptable Use Policy</h1>
          <p className="mt-2 text-xs font-mono text-zinc-500">Effective Date: September 8, 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-400" /> Prohibited Content and Conduct
            </h2>
            <p>
              To safeguard our creator community and infrastructure, users are strictly prohibited from uploading, processing, or distributing content that includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
              <li>Non-consensual deepfakes, deceptive synthetic impersonation, or unauthorized likenesses.</li>
              <li>Hate speech, harassment, incitement to violence, or non-consensual intimate imagery.</li>
              <li>Copyright-infringing media for which you do not possess broadcast or derivative editing rights.</li>
              <li>Malware, exploit payloads, or malicious scripts embedded in video containers.</li>
              <li>Automated bot attacks attempting to drain processing infrastructure or manipulate cloud workers.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">Platform Moderation and Enforcement</h2>
            <p>
              ClipForge AI employs automated heuristics and human safety oversight to detect abusive activity. Violations of this policy may result in immediate project removal, credit forfeiture, workspace termination, and potential reporting to law enforcement authorities where legally mandated.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">Reporting Violations</h2>
            <p>
              If you identify content processed through ClipForge AI that breaches this Acceptable Use Policy, please submit an abuse notification to <span className="text-cyan-400 font-mono">abuse@clipforge.ai</span> with the associated clip or workspace URL.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
