import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  clickable?: boolean;
  className?: string;
}

/**
 * High-Impact, Colorful & Bold YouTube Pro Icon
 * Dimensional multi-stop neon gradient with lightning-cut play button
 */
export const YouTubeProIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl p-[1.5px] bg-gradient-to-br from-[#FF0055] via-[#FF5500] to-[#FFB800] shadow-[0_0_15px_rgba(255,0,85,0.45)] hover:shadow-[0_0_22px_rgba(255,85,0,0.7)] transition-all duration-300 group/yt ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <div className="w-full h-full bg-[#0D0B12] rounded-[10px] flex items-center justify-center relative overflow-hidden">
        {/* Colorful interior gloss shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF0055]/30 via-transparent to-[#FFB800]/25" />
        
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[65%] h-[65%] relative z-10 transition-transform duration-300 group-hover/yt:scale-110"
        >
          {/* Dimensional YouTube Play Triangle with Lightning Notch */}
          <path
            d="M8 5.5L19 12L8 18.5V5.5Z"
            fill="url(#yt-pro-grad)"
            stroke="#FFF"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Energy Bolt Slash Accent */}
          <path
            d="M13 7.5L9.5 12.5H13.5L10.5 16.5"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="yt-pro-grad" x1="8" y1="5.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF0055" />
              <stop offset="0.5" stopColor="#FF4500" />
              <stop offset="1" stopColor="#FFB800" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  clickable = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', svg: 'w-4 h-4', text: 'text-base', spark: 'w-2 h-2' },
    md: { box: 'w-9 h-9', svg: 'w-5 h-5', text: 'text-lg', spark: 'w-2.5 h-2.5' },
    lg: { box: 'w-11 h-11', svg: 'w-6 h-6', text: 'text-xl', spark: 'w-3 h-3' },
    xl: { box: 'w-14 h-14', svg: 'w-8 h-8', text: 'text-2xl', spark: 'w-4 h-4' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-3 group cursor-pointer select-none ${className}`}>
      {/* Bold, Colorful 3D Squircle with Lightning-Cut Play Button */}
      <div
        className={`relative ${currentSize.box} rounded-xl bg-gradient-to-tr from-[#FF0055] via-[#8B5CF6] to-[#00F5FF] p-[2px] shadow-[0_0_22px_rgba(255,0,85,0.4),0_0_28px_rgba(0,245,255,0.3)] group-hover:shadow-[0_0_35px_rgba(255,0,85,0.65),0_0_40px_rgba(0,245,255,0.5)] transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-1`}
      >
        <div className="w-full h-full bg-[#08060E] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Inner multi-color refraction & neon glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF0055]/30 via-[#8B5CF6]/20 to-[#00F5FF]/30" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00F5FF] rounded-full blur-[4px] opacity-70" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#FF0055] rounded-full blur-[4px] opacity-70" />

          {/* Bold Colorful Lightning Play Glyph */}
          <svg
            className={`${currentSize.svg} relative z-10 transition-transform duration-300 group-hover:scale-110`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bold Triangular Blade */}
            <path
              d="M7 4.5L19 12L7 19.5V4.5Z"
              fill="url(#brand-grad-blade)"
              stroke="#FFF"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            {/* High-voltage Lightning Bolt Strike across play button */}
            <path
              d="M13 7L9 12.5H13.5L10 17.5"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Cyber Spark Stars */}
            <circle cx="18" cy="6" r="1" fill="#00F5FF" />
            <circle cx="6" cy="19" r="1" fill="#FFB800" />
            <defs>
              <linearGradient id="brand-grad-blade" x1="7" y1="4.5" x2="19" y2="19.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF0055" />
                <stop offset="0.4" stopColor="#9333EA" />
                <stop offset="0.75" stopColor="#3B82F6" />
                <stop offset="1" stopColor="#00F5FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Text: Bold Futuristic Typography */}
      {showText && (
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <span className={`text-white font-black ${currentSize.text} tracking-tight`}>
            Clip
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0055] via-[#A855F7] to-[#00F5FF]">
              Forge
            </span>
          </span>
          <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-black tracking-widest bg-gradient-to-r from-[#FF0055]/25 via-[#8B5CF6]/25 to-[#00F5FF]/25 border border-[#8B5CF6]/50 text-white rounded-md shadow-[0_0_12px_rgba(139,92,246,0.4)]">
            AI PRO
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return <Link href="/">{content}</Link>;
  }

  return content;
};

