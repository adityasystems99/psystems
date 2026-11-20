import React, { useState, useEffect } from 'react';
import { storyCards } from '../../config/sections';
import { heroConfig } from '../../config/hero';
import { ArrowUpRight } from 'lucide-react';

interface CardCarouselProps {
  progress: number; // smoothed p: 0.00 to 1.00
  activeIndex: number;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ progress, activeIndex }) => {
  const { overlapStart, phaseASplit } = heroConfig.timeline;

  // Phase B progress: cq = (p - 0.6) / 0.4
  const cq = Math.max(0, Math.min(1, (progress - phaseASplit) / (1.0 - phaseASplit)));

  // Carousel fade-in during overlap (0.52 - 0.66)
  const carouselOpacity = progress >= overlapStart
    ? Math.min(1, (progress - overlapStart) / (phaseASplit - overlapStart))
    : 0;

  const isVisible = carouselOpacity > 0.01;
  const cardCount = storyCards.length;

  // Continuous position along cards: pos = cq * (N - 1)
  const pos = cq * (cardCount - 1);

  // Responsive stage width tracking on resize
  const [stageWidth, setStageWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setStageWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = stageWidth < 720;
  // Rule 2: spread = min(300px, stageWidth * 0.55). On 390px this gives ~215px.
  const spread = Math.min(300, stageWidth * 0.55);

  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden transition-opacity duration-300"
      style={{
        opacity: carouselOpacity,
        background: 'radial-gradient(circle at 50% 50%, rgba(123, 92, 255, 0.12) 0%, transparent 70%)'
      }}
    >
      <div
        className="relative w-full max-w-5xl h-[420px] flex items-center justify-center"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {storyCards.map((card, idx) => {
          const off = idx - pos;
          const dist = Math.abs(off);

          // Clamped rotation & depth per rules
          const rotateY = Math.max(-2.2, Math.min(2.2, off)) * -32;
          const translateX = off * spread;
          const translateZ = -dist * 220;
          const scale = Math.max(0.7, Math.min(1.0, 1 - dist * 0.08));
          const opacity = Math.max(0, Math.min(1.0, 1 - dist * 0.3));
          const zIndex = Math.round(100 - dist * 10);

          const isFront = Math.round(pos) === idx;

          return (
            <div
              key={card.id}
              tabIndex={isFront ? 0 : -1}
              aria-hidden={!isFront}
              className={`absolute pointer-events-auto rounded-[22px] flex flex-col justify-between select-none transition-transform duration-100 ease-out ${
                isMobile ? 'p-5' : 'p-7'
              }`}
              style={{
                width: isMobile ? '84vw' : 'min(520px, 84vw)',
                height: 'min(380px, 56vh)',
                transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                background: 'rgba(5, 6, 12, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                boxShadow: isFront
                  ? '0 0 50px rgba(123, 92, 255, 0.35), inset 0 0 25px rgba(0, 240, 255, 0.15)'
                  : '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Top Eyebrow & Status */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-cyan">
                    {card.eyebrow}
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-400">
                    0{card.id} / 0{cardCount}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl font-normal text-white leading-tight tracking-tight">
                  {card.title}
                </h3>

                {/* Body Text */}
                <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm md:text-base text-[#9AA3C4] leading-relaxed font-light line-clamp-3">
                  {card.body}
                </p>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Interactive Node // {card.tag}
                </span>

                <a
                  href={card.link || "#projects"}
                  tabIndex={isFront ? 0 : -1}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan hover:text-background transition-colors"
                >
                  <span>Explore</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
