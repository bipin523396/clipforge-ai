import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Copyright, ShieldAlert, CheckCircle } from 'lucide-react';

export default function CopyrightDmcaPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      <Navbar />

      <main className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Copyright className="w-3.5 h-3.5" />
            <span>Intellectual Property</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black text-white">Copyright & DMCA Compliance</h1>
          <p className="mt-2 text-xs font-mono text-zinc-500">Notice and Takedown Policy</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Digital Millennium Copyright Act (DMCA)
            </h2>
            <p>
              ClipForge AI respects the intellectual property rights of creators, artists, and media publishers. In accordance with Title 17, United States Code, Section 512(c)(2), we respond expeditiously to copyright infringement notifications submitted to our designated Copyright Agent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">Submitting a DMCA Takedown Notice</h2>
            <p>
              To file a copyright infringement notification, please deliver written notice containing the following details to <span className="text-cyan-400 font-mono">dmca@clipforge.ai</span>:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm">
              <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material claimed to be infringing and its specific URL on the ClipForge platform.</li>
              <li>Contact details of the complaining party (address, telephone number, email).</li>
              <li>A statement of good faith belief that the disputed use is not authorized by the copyright owner, agent, or law.</li>
              <li>A statement made under penalty of perjury that the information provided is accurate.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">Counter-Notification Procedure</h2>
            <p>
              If your video or project was removed pursuant to a DMCA notice and you believe the removal was a result of mistake or misidentification, you may submit a formal Counter-Notification to our legal department.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
