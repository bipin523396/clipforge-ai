import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      <Navbar />

      <main className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Security</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black text-white">Privacy Policy</h1>
          <p className="mt-2 text-xs font-mono text-zinc-500">Effective Date: September 8, 2026 • Last updated: Today</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-400" /> 1. Overview and Core Commitments
            </h2>
            <p>
              At ClipForge AI ("ClipForge", "we", "our", or "us"), we prioritize the privacy and security of your video recordings, transcripts, and account data. This Privacy Policy describes how we collect, process, store, and protect your information when you access or use our video intelligence platform.
            </p>
            <p className="font-semibold text-cyan-300">
              Your video content is never used to train public AI foundation models without your explicit opt-in consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
              <li><strong className="text-zinc-200">Account Information:</strong> Name, email address, password hash, workspace name, and billing details processed securely via Stripe.</li>
              <li><strong className="text-zinc-200">Uploaded Media Content:</strong> Video files (MP4, MOV, WebM), audio extracts, RTMP live stream feeds, and associated transcripts processed for highlight extraction.</li>
              <li><strong className="text-zinc-200">Usage & Telemetry Data:</strong> IP address, browser type, device information, feature interaction, and processing metrics to monitor platform performance.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. How We Process Media and AI Data</h2>
            <p>
              When you upload a video or connect a stream, our automated pipeline extracts audio for speech-to-text diarization, generates highlight score candidates, reframes video dimensions, and generates subtitles. Temporary intermediate rendering files are deleted automatically following job completion or expiration.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Data Retention and Deletion</h2>
            <p>
              You maintain total control over your project assets. You may delete any video, transcript, or generated clip at any time from your Workspace Settings. When a project is deleted, its source files and derived clips are permanently purged from object storage within 7 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Third-Party Subprocessors</h2>
            <p>
              We collaborate with enterprise-grade infrastructure providers for cloud storage (AWS S3/Cloudflare R2), payment processing (Stripe), and transactional communications. All subprocessors comply with SOC 2, GDPR, and ISO 27001 standards.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Contact Our Privacy Officer</h2>
            <p>
              If you have inquiries regarding your data rights or wish to execute a GDPR/CCPA data export request, contact our security team at <span className="text-cyan-400 font-mono">privacy@clipforge.ai</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
