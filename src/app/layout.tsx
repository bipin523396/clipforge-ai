import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ClipForge AI — Turn Long Videos Into High-Performing Short Clips',
  description:
    'ClipForge AI automatically identifies standout moments from podcasts, webinars, keynotes, and live streams, turning them into viral 9:16 vertical shorts with animated captions, AI reframing, and brand kits.',
  keywords: [
    'AI video editing',
    'video repurposing',
    'shorts generator',
    'auto captions',
    'video highlight detector',
    'live clipping studio',
    'podcast to shorts',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090B] text-zinc-100 min-h-screen selection:bg-violet-500/30 selection:text-violet-200`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
