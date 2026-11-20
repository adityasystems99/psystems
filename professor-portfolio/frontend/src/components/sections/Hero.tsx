import React, { useState, useEffect } from 'react';
import { storyCaptions } from '../../config/sections';
import { heroConfig } from '../../config/hero';

interface HeroProps {
  progress: number; // smoothed p: 0.00 to 1.00
}

export const Hero: React.FC<HeroProps> = ({ progress }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 720);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Headline & Subline fade out by p 0.12
  const heroOpacity = progress < heroConfig.timeline.heroFadeEnd
    ? 1 - (progress / heroConfig.timeline.heroFadeEnd)
    : 0;

  // 2. Chain Caption 1 (range 0.40 - 0.56)
  const c1Range = heroConfig.captions.range1;
  let caption1Opacity = 0;
  if (progress >= c1Range.start && progress <= c1Range.end) {
    const mid = (c1Range.start + c1Range.end) / 2;
    if (progress < mid) {
      caption1Opacity = (progress - c1Range.start) / (mid - c1Range.start);
    } else {
      caption1Opacity = (c1Range.end - progress) / (c1Range.end - mid);
    }
  }

  // 3. Chain Caption 2 (range 0.66 - 1.00, or in chain phase)
  const c2Range = heroConfig.captions.range2;
  let caption2Opacity = 0;
  if (progress >= 0.50 && progress <= 0.62) {
    const mid = 0.56;
    if (progress < mid) {
      caption2Opacity = (progress - 0.50) / (mid - 0.50);
    } else {
      caption2Opacity = (0.62 - progress) / (0.62 - mid);
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center text-center px-4">
      {/* Hero Headline & Subline (p 0.00 - 0.12) */}
      {heroOpacity > 0.01 && (
        <div
          className="max-w-4xl mx-auto flex flex-col items-center transition-opacity duration-150"
          style={{ opacity: heroOpacity }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] backdrop-blur-md text-xs sm:text-sm font-medium text-brand-cyan mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span>{storyCaptions.hero.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-snug max-w-xl mx-auto px-4 text-glow">
            Engineering systems that <br className="sm:hidden" /> redefine interaction
          </h1>

          <p className="mt-6 text-sm sm:text-base md:text-lg text-neutral-400 max-w-xl font-normal leading-relaxed">
            {storyCaptions.hero.subline}
          </p>

          <div className="mt-12 flex flex-col items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest font-mono">
            <span>Scroll down to initiate sequence</span>
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
              <div className="w-1.5 h-2 bg-brand-cyan rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Caption 1 (cp ~0.40 - 0.56) */}
      {caption1Opacity > 0.01 && (
        <div
          className={`absolute max-w-lg px-6 py-3 rounded-2xl sm:rounded-full glass-panel border border-brand-cyan/30 text-white transition-opacity duration-200 ${
            isMobile ? 'bottom-[14%] top-auto' : 'top-24 bottom-auto'
          }`}
          style={{
            opacity: caption1Opacity,
            textShadow: '0 2px 10px rgba(0, 240, 255, 0.5)'
          }}
        >
          <h2
            className="font-light tracking-wide text-white text-sm sm:text-base"
            style={isMobile ? { fontSize: '28px', lineHeight: '1.25' } : undefined}
          >
            {storyCaptions.chain.caption1}
          </h2>
        </div>
      )}

      {/* Caption 2 (cp ~0.50 - 0.62) */}
      {caption2Opacity > 0.01 && (
        <div
          className={`absolute max-w-lg px-6 py-3 rounded-2xl sm:rounded-full glass-panel border border-brand-magenta/30 text-white transition-opacity duration-200 ${
            isMobile ? 'bottom-[14%]' : 'bottom-24'
          }`}
          style={{
            opacity: caption2Opacity,
            textShadow: '0 2px 10px rgba(255, 43, 214, 0.5)'
          }}
        >
          <h2
            className="font-light tracking-wide text-white text-sm sm:text-base"
            style={isMobile ? { fontSize: '28px', lineHeight: '1.25' } : undefined}
          >
            {storyCaptions.chain.caption2}
          </h2>
        </div>
      )}
    </div>
  );
};
