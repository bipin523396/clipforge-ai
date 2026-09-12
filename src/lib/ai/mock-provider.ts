// ClipForge AI - Mock & Production AI Provider Implementations

import {
  CaptionTranslationProvider,
  CaptionTranslationRequest,
  CaptionTranslationResult,
  CopyGenerationProvider,
  CopyGenerationRequest,
  CopyGenerationResult,
  HighlightCandidate,
  HighlightDetectionProvider,
  HighlightDetectionRequest,
  TranscriptionProvider,
  TranscriptionRequest,
  TranscriptionResult,
  VideoAnalysisProvider,
  VideoAnalysisRequest,
  VideoAnalysisResult,
} from './interfaces';
import { CaptionTrack } from '@/types';

export class MockTranscriptionProvider implements TranscriptionProvider {
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    // Simulated realistic transcript with timestamped words and speaker diarization
    return {
      language: request.language || 'en',
      confidence: 0.985,
      fullText:
        "The biggest mistake early founders make is building for months in isolation without talking to paying customers. When we started, we thought our proprietary algorithm was the only differentiator. But within three weeks of customer interviews, we realized nobody cared about the technical complexity—they just wanted their workflow reduced from four hours to four clicks.",
      segments: [
        {
          id: 'seg-1',
          speaker: 'Alex Rivera',
          startSec: 0.0,
          endSec: 4.8,
          text: "The biggest mistake early founders make is building for months in isolation without talking to paying customers.",
          sentiment: 'impactful',
          energyScore: 0.94,
          words: [
            { word: 'The', startSec: 0.0, endSec: 0.2 },
            { word: 'biggest', startSec: 0.2, endSec: 0.6, highlight: true },
            { word: 'mistake', startSec: 0.6, endSec: 1.0, highlight: true },
            { word: 'early', startSec: 1.0, endSec: 1.3 },
            { word: 'founders', startSec: 1.3, endSec: 1.8 },
            { word: 'make', startSec: 1.8, endSec: 2.1 },
            { word: 'is', startSec: 2.1, endSec: 2.3 },
            { word: 'building', startSec: 2.3, endSec: 2.8 },
            { word: 'for', startSec: 2.8, endSec: 3.0 },
            { word: 'months', startSec: 3.0, endSec: 3.4 },
            { word: 'in', startSec: 3.4, endSec: 3.6 },
            { word: 'isolation', startSec: 3.6, endSec: 4.2, highlight: true },
            { word: 'without', startSec: 4.2, endSec: 4.4 },
            { word: 'customers.', startSec: 4.4, endSec: 4.8 },
          ],
        },
        {
          id: 'seg-2',
          speaker: 'Alex Rivera',
          startSec: 4.9,
          endSec: 9.8,
          text: "When we started, we thought our proprietary algorithm was the only differentiator.",
          sentiment: 'neutral',
          energyScore: 0.78,
          words: [
            { word: 'When', startSec: 4.9, endSec: 5.2 },
            { word: 'we', startSec: 5.2, endSec: 5.4 },
            { word: 'started,', startSec: 5.4, endSec: 5.8 },
            { word: 'we', startSec: 5.8, endSec: 6.0 },
            { word: 'thought', startSec: 6.0, endSec: 6.4 },
            { word: 'our', startSec: 6.4, endSec: 6.6 },
            { word: 'proprietary', startSec: 6.6, endSec: 7.2 },
            { word: 'algorithm', startSec: 7.2, endSec: 7.8, highlight: true },
            { word: 'was', startSec: 7.8, endSec: 8.0 },
            { word: 'the', startSec: 8.0, endSec: 8.2 },
            { word: 'only', startSec: 8.2, endSec: 8.5 },
            { word: 'differentiator.', startSec: 8.5, endSec: 9.8 },
          ],
        },
        {
          id: 'seg-3',
          speaker: 'Alex Rivera',
          startSec: 9.9,
          endSec: 16.5,
          text: "But within three weeks of customer interviews, we realized nobody cared about the technical complexity—they just wanted their workflow reduced from four hours to four clicks.",
          sentiment: 'impactful',
          energyScore: 0.96,
          words: [
            { word: 'But', startSec: 9.9, endSec: 10.1 },
            { word: 'within', startSec: 10.1, endSec: 10.4 },
            { word: 'three', startSec: 10.4, endSec: 10.7 },
            { word: 'weeks,', startSec: 10.7, endSec: 11.2 },
            { word: 'nobody', startSec: 11.2, endSec: 11.6 },
            { word: 'cared', startSec: 11.6, endSec: 12.0 },
            { word: 'about', startSec: 12.0, endSec: 12.3 },
            { word: 'complexity.', startSec: 12.3, endSec: 13.1 },
            { word: 'They', startSec: 13.1, endSec: 13.4 },
            { word: 'wanted', startSec: 13.4, endSec: 13.8 },
            { word: 'four', startSec: 13.8, endSec: 14.3, highlight: true },
            { word: 'hours', startSec: 14.3, endSec: 14.9 },
            { word: 'to', startSec: 14.9, endSec: 15.2 },
            { word: 'four', startSec: 15.2, endSec: 15.6, highlight: true },
            { word: 'clicks!', startSec: 15.6, endSec: 16.5, highlight: true },
          ],
        },
      ],
    };
  }
}

export class MockHighlightDetectionProvider implements HighlightDetectionProvider {
  async detectHighlights(request: HighlightDetectionRequest): Promise<HighlightCandidate[]> {
    return [
      {
        startSec: 0.0,
        endSec: 16.5,
        title: "The #1 Mistake That Kills 90% of Early Startups",
        hookStatement: "The biggest mistake early founders make is building in isolation.",
        tags: ['Startups', 'SaaS Growth', 'Founder Advice'],
        scoreBreakdown: {
          overallScore: 94,
          hookStrength: 98,
          emotionalEnergy: 91,
          clarityScore: 95,
          standaloneContext: 92,
          pacingScore: 94,
          visualInterest: 89,
          explanationText:
            "Instant tension hook in the first 1.5 seconds, strong contrast comparison ('4 hours to 4 clicks'), and punchy cadence with zero filler words.",
        },
      },
      {
        startSec: 18.0,
        endSec: 37.4,
        title: "Why Technical Perfection Never Wins The Market",
        hookStatement: "Nobody cares about your complex code until they feel the value.",
        tags: ['Product Design', 'Tech Strategy', 'Business'],
        scoreBreakdown: {
          overallScore: 89,
          hookStrength: 88,
          emotionalEnergy: 86,
          clarityScore: 92,
          standaloneContext: 90,
          pacingScore: 87,
          visualInterest: 85,
          explanationText:
            "High relatable appeal for engineering and product creators, with an actionable takeaway in the final 5 seconds.",
        },
      },
      {
        startSec: 42.0,
        endSec: 64.2,
        title: "The 3-Week Rule For Customer Validation",
        hookStatement: "If you can't validate in 21 days, you're solving the wrong problem.",
        tags: ['Validation', 'Marketing', 'Customer Discovery'],
        scoreBreakdown: {
          overallScore: 85,
          hookStrength: 87,
          emotionalEnergy: 82,
          clarityScore: 89,
          standaloneContext: 84,
          pacingScore: 86,
          visualInterest: 80,
          explanationText:
            "Structured formulaic hook with clear chronological pacing that holds viewer attention through completion.",
        },
      },
    ];
  }
}

export class MockVideoAnalysisProvider implements VideoAnalysisProvider {
  async analyze(request: VideoAnalysisRequest): Promise<VideoAnalysisResult> {
    return {
      sceneChanges: [0, 8.4, 16.2, 29.5, 45.0],
      faceTrackingKeyframes: [
        { timestampSec: 0.0, x: 0.50, y: 0.42, confidence: 0.98 },
        { timestampSec: 5.0, x: 0.48, y: 0.42, confidence: 0.97 },
        { timestampSec: 10.0, x: 0.52, y: 0.41, confidence: 0.99 },
        { timestampSec: 15.0, x: 0.50, y: 0.43, confidence: 0.98 },
      ],
      audioEnergyProfile: [
        { timestampSec: 0.0, energy: 0.88 },
        { timestampSec: 2.0, energy: 0.94 },
        { timestampSec: 7.0, energy: 0.72 },
        { timestampSec: 12.0, energy: 0.96 },
        { timestampSec: 16.0, energy: 0.91 },
      ],
    };
  }
}

export class MockCaptionTranslationProvider implements CaptionTranslationProvider {
  private translations: Record<string, { title: string; desc: string; textMap: Record<string, string> }> = {
    ta: {
      title: "தொடக்க நிறுவனங்கள் செய்யும் #1 தவறு! 🚀",
      desc: "வாடிக்கையாளர்களிடம் பேசாமல் எதையும் உருவாக்காதீர்கள். முழு வீடியோவையும் பாருங்கள்.",
      textMap: {
        "The biggest mistake early founders make is building for months in isolation without talking to paying customers.":
          "வாடிக்கையாளர்களிடம் பேசாமல் தனிமையில் மாதக்கணக்கில் உருவாக்குவதே தொடக்க நிறுவனர்கள் செய்யும் மிகப்பெரிய தவறு.",
        "When we started, we thought our proprietary algorithm was the only differentiator.":
          "நாங்கள் தொடங்கியபோது, எங்கள் பிரத்யேக அல்காரிதமே ஒரே வித்தியாசம் என்று நினைத்தோம்.",
        "But within three weeks of customer interviews, we realized nobody cared about the technical complexity—they just wanted their workflow reduced from four hours to four clicks.":
          "ஆனால் வாடிக்கையாளர் நேர்காணல்களில், தொழில்நுட்ப சிக்கலை யாரும் பொருட்படுத்தவில்லை—நான்கு மணிநேர வேலையை நான்கு கிளிக்குகளாக குறைக்கவே விரும்பினர்.",
      },
    },
    hi: {
      title: "शुरुआती स्टार्टअप्स की सबसे बड़ी गलती 🛑",
      desc: "ग्राहकों से बात किए बिना महीनों तक प्रोडक्ट बनाना सबसे बड़ा नुकसान है।",
      textMap: {
        "The biggest mistake early founders make is building for months in isolation without talking to paying customers.":
          "शुरुआती संस्थापकों की सबसे बड़ी गलती बिना ग्राहकों से बात किए महीनों अकेले में निर्माण करना है।",
        "When we started, we thought our proprietary algorithm was the only differentiator.":
          "जब हमने शुरुआत की, तो हमें लगा कि हमारा एल्गोरिदम ही हमारा एकमात्र अंतर है।",
        "But within three weeks of customer interviews, we realized nobody cared about the technical complexity—they just wanted their workflow reduced from four hours to four clicks.":
          "लेकिन तीन हफ्तों में हमने महसूस किया कि किसी को जटिलता की परवाह नहीं थी—वे बस अपना काम 4 घंटे से 4 क्लिक में चाहते थे।",
      },
    },
    es: {
      title: "El error #1 que destruye a los fundadores 💡",
      desc: "No construyas a ciegas. Descubre cómo reducir 4 horas a 4 clics.",
      textMap: {
        "The biggest mistake early founders make is building for months in isolation without talking to paying customers.":
          "El mayor error de los fundadores es construir meses aislados sin hablar con clientes que pagan.",
        "When we started, we thought our proprietary algorithm was the only differentiator.":
          "Al principio, pensamos que nuestro algoritmo patentado era el único diferenciador.",
        "But within three weeks of customer interviews, we realized nobody cared about the technical complexity—they just wanted their workflow reduced from four hours to four clicks.":
          "Pero en 3 semanas vimos que a nadie le importaba la complejidad técnica: solo querían su flujo de 4 horas a 4 clics.",
      },
    },
    fr: {
      title: "La plus grande erreur des créateurs de startups ⚡",
      desc: "Parlez à vos utilisateurs avant de coder pendant des mois.",
      textMap: {
        "The biggest mistake early founders make is building for months in isolation without talking to paying customers.":
          "La plus grande erreur des fondateurs est de construire pendant des mois en isolation sans parler aux clients.",
        "When we started, we thought our proprietary algorithm was the only differentiator.":
          "Au début, nous pensions que notre algorithme était le seul facteur clé.",
        "But within three weeks of customer interviews, we realized nobody cared about the technical complexity—they just wanted their workflow reduced from four hours to four clicks.":
          "Mais en 3 semaines, personne ne se souciait de la complexité: ils voulaient passer de 4 heures à 4 clics.",
      },
    },
  };

  async translate(request: CaptionTranslationRequest): Promise<CaptionTranslationResult> {
    const lang = request.targetLanguage.toLowerCase();
    const match = this.translations[lang] || {
      title: `Localized Clip (${lang.toUpperCase()})`,
      desc: `Automated localized caption translation with timestamp synchronization.`,
      textMap: {},
    };

    const translatedSegments = request.captions.segments.map((seg) => {
      const translatedText = match.textMap[seg.text] || seg.text;
      const words = translatedText.split(' ');
      const totalWords = words.length;
      const duration = seg.endSec - seg.startSec;
      const wordDuration = duration / (totalWords || 1);

      return {
        ...seg,
        text: translatedText,
        words: words.map((w, i) => ({
          word: w,
          startSec: Number((seg.startSec + i * wordDuration).toFixed(2)),
          endSec: Number((seg.startSec + (i + 1) * wordDuration).toFixed(2)),
          highlight: i === 1 || i === totalWords - 1,
        })),
      };
    });

    const translatedCaptions: CaptionTrack = {
      ...request.captions,
      language: lang,
      segments: translatedSegments,
    };

    return {
      translatedCaptions,
      localizedTitle: match.title,
      localizedDescription: match.desc,
      localizedHashtags: ['#ClipForgeAI', '#Shorts', '#Viral', `#${lang}`],
    };
  }
}

export class MockCopyGenerationProvider implements CopyGenerationProvider {
  async generateCopy(request: CopyGenerationRequest): Promise<CopyGenerationResult> {
    const { platform, clipTitle } = request;

    switch (platform) {
      case 'TIKTOK':
        return {
          title: `${clipTitle} 🔥`,
          caption: "Stop making this mistake if you're building a business! What would you do differently? 👇 #founder #startup #businessadvice #saas #entrepreneur",
          hashtags: ['#founder', '#startup', '#businessadvice', '#saas', '#entrepreneur', '#fyp'],
          suggestedPostingTime: 'Today at 6:30 PM (Peak Creator Engagement)',
          callToAction: 'Drop your startup idea in the comments!',
        };
      case 'INSTAGRAM':
        return {
          title: clipTitle,
          caption: `Founders: are you building in a bubble? 🫧\n\nThe fastest way to fail is building features nobody asked for. Save this reel for your next sprint planning session! 📌\n.\n.\n#startuptips #buildinpublic #entrepreneurship #techfounder #growthhacks`,
          hashtags: ['#startuptips', '#buildinpublic', '#entrepreneurship', '#techfounder', '#growthhacks'],
          suggestedPostingTime: 'Tomorrow at 11:15 AM (Highest Save Rate)',
          callToAction: 'Double tap if you agree & share with your cofounder!',
        };
      case 'YOUTUBE_SHORTS':
        return {
          title: `${clipTitle} #Shorts`,
          caption: "Why 90% of tech startups fail before launch. Subscribe to the channel for weekly teardowns and founder insights!",
          hashtags: ['#Shorts', '#Startup', '#Technology', '#Coding', '#Business'],
          suggestedPostingTime: 'Thursday at 4:00 PM (Optimal Algorithm Push)',
          callToAction: 'Subscribe for daily founder breakdowns!',
        };
      case 'LINKEDIN':
        return {
          title: `Why Customer Discovery Beats Technical Perfection: ${clipTitle}`,
          caption: `In our early days, we believed technical complexity was our competitive moat.\n\nWe were wrong.\n\nAfter 50+ customer interviews, we realized that customers don't buy code—they buy outcomes. Here is what we learned.\n\nWhat is the most counter-intuitive lesson you've learned from talking to customers?`,
          hashtags: ['#Leadership', '#ProductManagement', '#SaaS', '#Innovation', '#CustomerSuccess'],
          suggestedPostingTime: 'Tuesday at 8:45 AM (Business Executive Window)',
          callToAction: 'Join the conversation in the comments below.',
        };
      case 'X':
      default:
        return {
          title: clipTitle,
          caption: `The biggest mistake early founders make:\n\nBuilding in isolation for months without talking to paying users.\n\n4 hours -> 4 clicks. That's the formula. 🧵`,
          hashtags: ['#buildinpublic', '#startups', '#indiehackers'],
          suggestedPostingTime: 'Today at 2:00 PM (Retweet Velocity Peak)',
          callToAction: 'Bookmark this post.',
        };
    }
  }
}
