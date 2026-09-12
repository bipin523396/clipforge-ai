# ClipForge AI 🎬⚡

> **Turn every long video into short-form content that performs.**

ClipForge AI transforms long videos, podcasts, webinars, interviews, lectures, gaming streams, and livestream recordings into polished vertical short-form videos (9:16, 1:1, 16:9). The system uses AI to detect compelling moments, create short clips, generate word-by-word animated captions, reframe subjects intelligently, translate subtitles across 10+ languages, apply brand kit styling, and export files optimized for social platforms.

---

## ✨ Features

- **AI Highlight Discovery**: Multi-agent acoustic energy, speech cadence, and visual scene analysis with an explainable 0–100 highlight score breakdown (Hook Strength, Emotional Energy, Clarity, Standalone Context, Pacing).
- **Intelligent Auto-Reframing**: Follows the active speaker with face tracking in 9:16 vertical, 1:1 square, or split-screen layouts with smart blurred backdrops.
- **Dynamic Caption Studio**: Word-by-word active karaoke animations, presets (*Bold Creator*, *Viral Pop*, *Karaoke Glow*, *Minimalist*, *Documentary*), auto-emoji insertion, and keyword highlight tools.
- **Natural Language AI Command Bar**: Execute conversational video edits like *"Make captions more energetic"*, *"Trim the first 3 seconds"*, *"Center the speaker"*, *"Translate captions to Tamil"*, and *"Remove filler words"*.
- **Live Studio (Live Clipping Mode)**: Ingest RTMP/HLS live broadcast streams, detect viral spikes in near-real-time, and moderate/publish draft clips before the broadcast concludes.
- **Workspace Brand Kits**: Centralized logo watermarks, custom hex palettes, typography, intro/outro cards, and default CTA banners.
- **Multilingual Subtitles**: Timestamp-preserving subtitle translation for English, Tamil, Hindi, Spanish, French, German, Portuguese, Arabic, Japanese, and Korean.
- **Cross-Platform Publishing Hub**: 720p/1080p/4K MP4 export, SRT/VTT downloads, and automated social copy generation (TikTok, Instagram Reels, YouTube Shorts, X, LinkedIn) with optimal posting time recommendations.
- **Analytics & Leaderboard**: Track viewership velocity, score distributions, and top-performing clips.
- **Team RBAC & API Keys**: Scoped roles (Owner, Admin, Editor, Viewer), developer API keys, and Stripe billing.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **State Management**: React Context with LocalStorage sync and reactive event triggers
- **Database**: PostgreSQL with Prisma ORM (22+ models schema included)
- **AI Abstraction**: Pluggable provider architecture (`TranscriptionProvider`, `HighlightDetectionProvider`, `VideoAnalysisProvider`, `CaptionTranslationProvider`, `CopyGenerationProvider`)
- **Queue / Workers**: BullMQ with Redis architecture ready
- **Payments**: Stripe customer portal and webhook integration architecture

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

### 3. Initialize Database Schema
```bash
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
clipforge-ai/
├── prisma/
│   └── schema.prisma                 # 22+ Prisma Models (User, Workspace, Project, Clip, etc.)
├── src/
│   ├── app/
│   │   ├── (marketing)/              # Landing, Pricing, Legal Pages
│   │   ├── login/                    # Authentication
│   │   ├── signup/                   # Registration with 300 free credits
│   │   ├── onboarding/               # 4-step Creator Onboarding Wizard
│   │   ├── dashboard/                # Main SaaS App Dashboard
│   │   ├── projects/                 # Projects Library & Detail Workspace
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── [id]/clips/[clipId]/page.tsx # Flagship AI Clip Editor Suite
│   │   ├── brand-kits/               # Brand Kits & Styling Manager
│   │   ├── live/                     # Live Studio (Live Ingest & Moment Detection)
│   │   ├── analytics/                # Performance Charts & CSV Export
│   │   ├── settings/                 # Team RBAC, API Keys, Billing
│   │   └── api/                      # Documented REST API Routes
│   ├── components/
│   │   ├── brand-logo.tsx            # Geometric Play/Spark Logo
│   │   ├── navbar.tsx & footer.tsx   # Public Navigation & Links
│   │   ├── animated-hero-mockup.tsx  # Interactive Video Repurposing Simulation
│   │   ├── app-shell.tsx             # Authenticated Sidebar & Topbar Shell
│   │   ├── create-project-modal.tsx  # Upload, YouTube Import & AI Preferences
│   │   └── editor/                   # Video Canvas, Timeline Scrubber, Caption Studio, AI Bar, Export Modal
│   ├── lib/
│   │   ├── ai/                       # AI Provider Abstraction Layer & Heuristics
│   │   ├── mock-data.ts              # Pre-populated projects, transcripts & clips
│   │   └── store.tsx                 # Reactive App Context Provider
│   └── types/                        # Core TypeScript Interfaces
└── README.md
```

---

## 🛡️ License

Proprietary SaaS Application • Built with ❤️ for video creators and media networks.
