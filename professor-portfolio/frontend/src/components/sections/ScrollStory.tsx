import React, { useEffect, useRef, useState } from 'react';
import { profileConfig } from '../../config/profile';

const spiralCards = [
  {
    id: 1,
    tag: "Project // 01",
    title: "Distributed Stream Core",
    desc: "Zero-copy event pipeline processing 2.4M msgs/sec with deterministic latency.",
    strand: "STRAND A",
    category: "SYSTEMS",
    link: "https://github.com/adityasystems99/psystems"
  },
  {
    id: 2,
    tag: "Project // 02",
    title: "Microkernel Hypervisor",
    desc: "Hardware-isolated sandbox with sub-microsecond IPC and memory virtualization.",
    strand: "STRAND B",
    category: "OS INTERNALS",
    link: "https://github.com/adityasystems99/psystems"
  },
  {
    id: 3,
    tag: "Project // 03",
    title: "Tensor Mesh Visualizer",
    desc: "Real-time WebGL manifold mapping with GPU compute kernel acceleration.",
    strand: "STRAND A",
    category: "GRAPHICS",
    link: "https://github.com/adityasystems99/psystems"
  },
  {
    id: 4,
    tag: "Project // 04",
    title: "Byzantine Consensus",
    desc: "Fault-tolerant distributed state machine replication over partitioned WAN.",
    strand: "STRAND B",
    category: "NETWORKS",
    link: "https://github.com/adityasystems99/psystems"
  },
  {
    id: 5,
    tag: "Project // 05",
    title: "SSA Vector Compiler",
    desc: "Intermediate representation optimizing pass for AVX-512 SIMD pipelines.",
    strand: "STRAND A",
    category: "COMPILERS",
    link: "https://github.com/adityasystems99/psystems"
  },
  {
    id: 6,
    tag: "Project // 06",
    title: "Lockless Ring Buffer",
    desc: "Cache-line aligned memory sharing supporting RDMA remote direct access.",
    strand: "STRAND B",
    category: "CONCURRENCY",
    link: "https://github.com/adityasystems99/psystems"
  }
];

interface Particle {
  x: number;
  y: number;
  z: number;
  strand: number;
  seed: number;
  baseSize: number;
  baseAlpha: number;
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const ScrollStory: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroHeaderRef = useRef<HTMLDivElement>(null);
  const progressCounterRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const caption1Ref = useRef<HTMLDivElement>(null);
  const caption2Ref = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!canvas || !scrollContainer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    // Viewport State
    let stageWidth = window.innerWidth;
    let stageHeight = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Scroll Progress State
    let rawP = 0;
    let shownP = 0;
    let isForcedP = false;

    // Deterministic QA query parameter (?p=0.38)
    const urlParams = new URLSearchParams(window.location.search);
    const queryP = urlParams.get('p');
    if (queryP !== null && !isNaN(parseFloat(queryP))) {
      rawP = clamp(parseFloat(queryP), 0, 1);
      shownP = rawP;
      isForcedP = true;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // +1 = clockwise as seen from above. Use -1 to reverse.
    const SPIN_DIR = 1;

    // Particle System Parameters
    const isMobile = () => window.innerWidth < 720;
    const HELIX_TURNS = 3;
    const HELIX_HEIGHT = 2.4;
    let HELIX_RADIUS = isMobile() ? 0.44 : 0.6;
    let CARD_RADIUS = isMobile() ? 0.80 : 1.9;

    let particles: Particle[] = [];
    let dustParticles: Particle[] = [];
    let particlesMobile: boolean | null = null;

    function initParticles() {
      particles = [];
      dustParticles = [];
      const mobile = isMobile();
      particlesMobile = mobile;
      const helixCount = mobile ? 2600 : 4600;
      const dustCount = mobile ? 400 : 700;
      HELIX_RADIUS = mobile ? 0.44 : 0.6;
      CARD_RADIUS = mobile ? 0.80 : 1.9;

      // Helix Particles (Strand A: Cyan #00F0FF, Strand B: Magenta #FF2BD6)
      for (let i = 0; i < helixCount; i++) {
        const t = Math.random();
        const strand = i % 2;
        const angle = t * HELIX_TURNS * 2 * Math.PI + strand * Math.PI;
        const jitterX = (Math.random() - 0.5) * 0.04;
        const jitterY = (Math.random() - 0.5) * 0.04;
        const jitterZ = (Math.random() - 0.5) * 0.04;

        const x = HELIX_RADIUS * Math.cos(angle) + jitterX;
        const y = -t * HELIX_HEIGHT + jitterY;
        const z = HELIX_RADIUS * Math.sin(angle) + jitterZ;
        const seed = Math.random() * 100;
        const baseSize = mobile ? (Math.random() * 1.0 + 0.8) : (Math.random() * 1.5 + 1.0);

        particles.push({
          x, y, z, strand, seed, baseSize,
          baseAlpha: Math.random() * 0.35 + 0.65
        });
      }

      // Faint Violet Dust inside cylinder at 35% alpha
      for (let i = 0; i < dustCount; i++) {
        const t = Math.random();
        const r = HELIX_RADIUS * Math.sqrt(Math.random()) * 0.9;
        const theta = Math.random() * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = -t * HELIX_HEIGHT;
        const z = r * Math.sin(theta);
        const seed = Math.random() * 100;
        const baseSize = mobile ? (Math.random() * 0.8 + 0.6) : (Math.random() * 1.2 + 0.8);

        dustParticles.push({
          x, y, z, strand: 2, seed, baseSize,
          baseAlpha: 0.35
        });
      }
    }

    // Pre-rendered offscreen glowing sprites for cinema-grade additive blending performance
    const SPRITE_SIZE = 32;
    function createGlowSprite(colorCore: string, colorGlow: string): HTMLCanvasElement {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = SPRITE_SIZE;
      sCanvas.height = SPRITE_SIZE;
      const sctx = sCanvas.getContext('2d')!;
      const center = SPRITE_SIZE / 2;
      const grad = sctx.createRadialGradient(center, center, 0, center, center, center);
      grad.addColorStop(0, colorCore);
      grad.addColorStop(0.35, colorGlow);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      return sCanvas;
    }

    const spriteCyan = createGlowSprite('rgba(255, 255, 255, 1)', 'rgba(0, 240, 255, 0.85)');
    const spriteMagenta = createGlowSprite('rgba(255, 255, 255, 1)', 'rgba(255, 43, 214, 0.85)');
    const spriteViolet = createGlowSprite('rgba(255, 255, 255, 0.8)', 'rgba(123, 92, 255, 0.65)');

    // Resize Canvas with high-DPI scaling
    function resize() {
      if (!canvas) return;
      stageWidth = window.innerWidth;
      stageHeight = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(stageWidth * dpr);
      canvas.height = Math.floor(stageHeight * dpr);
      canvas.style.width = stageWidth + 'px';
      canvas.style.height = stageHeight + 'px';

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      if (particlesMobile !== isMobile()) initParticles();
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Scroll Event Listener
    function onScroll() {
      if (isForcedP || !scrollContainer) return;
      const rect = scrollContainer.getBoundingClientRect();
      const maxScroll = scrollContainer.clientHeight - window.innerHeight;
      if (maxScroll > 0) {
        rawP = clamp(-rect.top / maxScroll, 0, 1);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Visibility state
    let isVisible = !document.hidden;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Animation Loop
    const startTime = performance.now();
    let animFrameId: number;

    function renderFrame(now: number) {
      if (!isVisible) {
        animFrameId = requestAnimationFrame(renderFrame);
        return;
      }

      const elapsedSec = (now - startTime) * 0.001;

      // Smooth progress: shown += (p - shown) * 0.045
      if (prefersReducedMotion) {
        shownP = 1.0;
      } else if (isForcedP) {
        shownP = rawP;
      } else {
        shownP += (rawP - shownP) * 0.045;
      }

      // Update Progress Counter HUD
      if (progressCounterRef.current) {
        progressCounterRef.current.textContent = 'P // ' + shownP.toFixed(2);
      }

      // Smoothly dissolve hero title as user scrolls down the chain
      if (heroHeaderRef.current) {
        const heroOpacity = clamp(1 - shownP * 5.5, 0, 1);
        const heroTranslateY = -shownP * 140;
        heroHeaderRef.current.style.opacity = heroOpacity.toFixed(3);
        heroHeaderRef.current.style.transform = `translate(-50%, ${heroTranslateY.toFixed(1)}px)`;
        heroHeaderRef.current.style.pointerEvents = heroOpacity > 0.05 ? 'auto' : 'none';
      }

      // Hide scroll hint once user scrolls past 0.08
      if (scrollHintRef.current) {
        const isScrolledPast = shownP > 0.08;
        scrollHintRef.current.style.opacity = isScrolledPast ? '0' : '1';
        scrollHintRef.current.style.visibility = isScrolledPast ? 'hidden' : 'visible';
      }

      // Update Captions (0.40–0.56 and 0.66–1.00)
      if (caption1Ref.current) {
        const inRange1 = shownP >= 0.40 && shownP <= 0.56;
        caption1Ref.current.style.opacity = inRange1 ? '1' : '0';
        caption1Ref.current.style.transform = inRange1 ? 'translateY(0)' : 'translateY(16px)';
      }
      if (caption2Ref.current) {
        const inRange2 = shownP >= 0.66 && shownP <= 1.00;
        caption2Ref.current.style.opacity = inRange2 ? '1' : '0';
        caption2Ref.current.style.transform = inRange2 ? 'translateY(0)' : 'translateY(16px)';
      }

      // Clear Canvas
      context.clearRect(0, 0, stageWidth, stageHeight);
      context.globalCompositeOperation = 'lighter';

      // CAMERA AND ROTATION
      const d = smoothstep(0.18, 0.95, shownP);
      const camY = -0.35 - d * 0.95;

      // Spin: A = d * 2.2 * PI + time * 0.04
      const timeOffset = prefersReducedMotion ? 0 : elapsedSec * 0.04;
      const A = SPIN_DIR * (d * 2.2 * Math.PI + timeOffset);

      const cosA = Math.cos(A);
      const sinA = Math.sin(A);

      // PROJECTION
      const unit = Math.min(stageWidth, stageHeight) * 0.3;
      const halfW = stageWidth * 0.5;
      const halfH = stageHeight * 0.5;

      function project(x: number, y: number, z: number) {
        const xr = x * cosA + z * sinA;
        const zr = -x * sinA + z * cosA;
        const yr = y - camY;

        const clampedZ = clamp(zr, -0.6, 0.6);
        const persp = 1 / (1 + clampedZ * 0.9);

        const sx = halfW + xr * unit * persp;
        const sy = halfH + yr * unit * persp;
        return { xr, yr, zr, persp, sx, sy };
      }

      // Draw Helix Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const proj = project(p.x, p.y, p.z);

        if (proj.sx < -10 || proj.sx > stageWidth + 10 || proj.sy < -10 || proj.sy > stageHeight + 10) {
          continue;
        }

        const shimmer = prefersReducedMotion ? 1.0 : (0.85 + 0.15 * Math.sin(elapsedSec * 1.3 + p.seed));
        const alpha = clamp(p.baseAlpha * shimmer, 0.05, 1.0);

        const sprite = (p.strand === 0) ? spriteCyan : spriteMagenta;
        const pSize = Math.max(3, p.baseSize * proj.persp * 5);

        context.globalAlpha = alpha;
        context.drawImage(sprite, proj.sx - pSize * 0.5, proj.sy - pSize * 0.5, pSize, pSize);
      }

      // Draw Dust Particles (inside cylinder at 35% alpha)
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];
        const proj = project(p.x, p.y, p.z);

        if (proj.sx < -10 || proj.sx > stageWidth + 10 || proj.sy < -10 || proj.sy > stageHeight + 10) {
          continue;
        }

        const shimmer = prefersReducedMotion ? 1.0 : (0.85 + 0.15 * Math.sin(elapsedSec * 1.1 + p.seed));
        const alpha = clamp(p.baseAlpha * shimmer, 0.05, 0.6);
        const pSize = Math.max(2, p.baseSize * proj.persp * 4);

        context.globalAlpha = alpha;
        context.drawImage(spriteViolet, proj.sx - pSize * 0.5, proj.sy - pSize * 0.5, pSize, pSize);
      }

      context.globalAlpha = 1.0;

      // PROJECT CARDS
      interface CardProjData {
        index: number;
        proj: ReturnType<typeof project>;
        reveal: number;
        adjustedSy: number;
      }
      const projectedCards: CardProjData[] = [];

      for (let i = 0; i < 6; i++) {
        const angle_i = (i / 6) * 2 * Math.PI;
        const t_i = 0.18 + (i / 5) * 0.56;

        const cx = CARD_RADIUS * Math.cos(angle_i);
        const cy = -t_i * HELIX_HEIGHT;
        const cz = CARD_RADIUS * Math.sin(angle_i);

        const proj = project(cx, cy, cz);

        let reveal = 0;
        if (prefersReducedMotion) {
          reveal = 1.0;
        } else {
          const start_i = 0.12 + i * 0.12;
          const end_i = start_i + 0.10;
          reveal = smoothstep(start_i, end_i, shownP);
        }

        projectedCards.push({
          index: i,
          proj,
          reveal,
          adjustedSy: proj.sy
        });
      }

      // Nudge vertical position if two cards land within 40px (from index.html)
      for (let i = 0; i < projectedCards.length; i++) {
        for (let j = i + 1; j < projectedCards.length; j++) {
          const cardA = projectedCards[i];
          const cardB = projectedCards[j];
          if (cardA.reveal > 0.05 && cardB.reveal > 0.05) {
            const dx = Math.abs(cardA.proj.sx - cardB.proj.sx);
            const dy = Math.abs(cardA.adjustedSy - cardB.adjustedSy);
            if (dx < 60 && dy < 40) {
              if (cardA.adjustedSy < cardB.adjustedSy) {
                cardA.adjustedSy -= 20;
                cardB.adjustedSy += 20;
              } else {
                cardA.adjustedSy += 20;
                cardB.adjustedSy -= 20;
              }
            }
          }
        }
      }

      // Render Cards to DOM
      const isMobileScreen = isMobile();
      const halfCardW = isMobileScreen ? 92 : 120;
      const halfCardH = isMobileScreen ? 55 : 70;

      for (let i = 0; i < projectedCards.length; i++) {
        const cardData = projectedCards[i];
        const el = cardElementsRef.current[i];
        if (!el) continue;

        const proj = cardData.proj;
        const reveal = cardData.reveal;
        const sy = cardData.adjustedSy;
        let sx = proj.sx;

        const s = clamp(proj.persp * 0.95, 0.55, 1.15);

        if (isMobileScreen) {
          const visualHalfW = halfCardW * s;
          sx = clamp(sx, 16 + visualHalfW, stageWidth - 16 - visualHalfW);
        }

        const isOffScreenY = (sy < -120 || sy > stageHeight + 120);

        if (reveal <= 0.001 || isOffScreenY) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }

        const isFront = proj.zr < 0;
        const depthOpacity = isFront ? 1.0 : 0.6;
        const zIndex = isFront ? 3 : 1;
        const finalOpacity = reveal * depthOpacity;

        const riseY = (1 - reveal) * 40;
        const translateX = sx - halfCardW;
        const translateY = sy - halfCardH + riseY;

        el.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0px) scale(${s.toFixed(3)})`;
        el.style.opacity = finalOpacity.toFixed(3);
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = finalOpacity > 0.1 ? 'auto' : 'none';
      }

      animFrameId = requestAnimationFrame(renderFrame);
    }

    animFrameId = requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      id="spiral"
      className="relative w-full h-[800vh] bg-transparent"
    >
      {/* Sticky Full-Screen Stage (matches index.html) */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-transparent">
        {/* Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full blur-[70px] z-[1]"
          style={{
            background: 'radial-gradient(circle, rgba(123, 92, 255, 0.09) 0%, rgba(0, 240, 255, 0.04) 40%, transparent 70%)'
          }}
        />

        {/* Canvas 2D for particle helix and dust */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full block z-[2] pointer-events-none"
        />

        {/* Luminous Professor Hero (matching reference image) */}
        <div
          ref={heroHeaderRef}
          className="absolute top-[20%] max-[720px]:top-[16%] left-1/2 -translate-x-1/2 w-[92%] max-w-[960px] text-center z-10 pointer-events-auto transition-opacity duration-300"
        >
          {/* Top Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-[#D4A574]/40 backdrop-blur-md mb-4 shadow-[0_0_16px_rgba(212,165,116,0.18)]">
            <div className="w-2 h-2 rounded-full bg-[#7B5CFF] shadow-[0_0_8px_#7B5CFF]" />
            <span className="text-[11px] max-[720px]:text-[9px] font-mono tracking-[0.15em] uppercase text-[#E5A962] font-semibold">
              3D RESEARCH PORTFOLIO · HARDWARE SECURITY
            </span>
          </div>

          {/* Luminous Professor Headline */}
          <h1 className="font-serif text-[48px] max-[720px]:text-[28px] md:text-[56px] lg:text-[64px] font-normal tracking-[-0.01em] text-white leading-[1.08] [text-shadow:0_0_35px_rgba(255,255,255,0.5),0_0_75px_rgba(123,92,255,0.4),0_0_120px_rgba(0,240,255,0.25)]">
            Professor Lalit Kumar Vashishtha
          </h1>

          {/* Subtitle matching reference */}
          <p className="mt-3.5 text-[14.5px] max-[720px]:text-[11.5px] leading-[1.5] text-[#D8A76B] font-sans tracking-[0.01em] max-w-[760px] mx-auto opacity-95">
            Assistant Professor of Computer Science at KIIT · PhD candidate at BITS Pilani · Hardware security on RISC-V and formal methods
          </p>

          {/* Terminal prompt symbol */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 font-mono text-[14px] text-[#E5A962]">
            <span>$</span>
            <span className="inline-block w-2 h-3.5 bg-[#E5A962] animate-pulse" />
          </div>

          {/* Quick link action pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-[720px]:gap-1.5 pointer-events-auto">
            {[
              { label: "Google Scholar", href: "#projects" },
              { label: "GitHub", href: "https://github.com/adityasystems99/psystems" },
              { label: "LinkedIn", href: "https://linkedin.com" },
              { label: "Blog", href: "#about" },
              { label: "Academic CV", href: "#about" },
              { label: "Contact", href: "#contact" }
            ].map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
                className="px-3.5 py-1.5 rounded-full text-[11px] max-[720px]:text-[9.5px] font-mono tracking-[0.05em] text-slate-300 bg-white/[0.04] border border-white/[0.12] hover:border-[#00F0FF]/60 hover:text-white hover:bg-[#00F0FF]/10 backdrop-blur-md transition-all shadow-sm"
              >
                {btn.label}
              </a>
            ))}
          </div>
        </div>

        {/* Project Cards Layer */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[3]">
          {spiralCards.map((card, idx) => (
            <article
              key={card.id}
              ref={(el) => { cardElementsRef.current[idx] = el; }}
              className="absolute top-0 left-0 w-[240px] max-[720px]:w-[185px] h-[140px] max-[720px]:h-[110px] rounded-[16px] p-[14px_16px] max-[720px]:p-[10px_12px] flex flex-col justify-between will-change-transform select-none opacity-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.14) 0%, rgba(123, 92, 255, 0.09) 50%, rgba(255, 43, 214, 0.14) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 0 28px rgba(123, 92, 255, 0.35), inset 0 0 16px rgba(0, 240, 255, 0.15)'
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[9.5px] max-[720px]:text-[8.5px] font-bold tracking-[0.08em] uppercase text-[#00F0FF] bg-[rgba(0,240,255,0.14)] px-[8px] py-[2px] rounded-[4px] border border-[rgba(0,240,255,0.28)]">
                  {card.tag}
                </span>
                <div className="w-[8px] h-[8px] rounded-full bg-[#FF2BD6] shadow-[0_0_10px_#FF2BD6]" />
              </div>

              <div className="mt-[2px]">
                <h3 className="text-[13px] max-[720px]:text-[11px] font-bold text-white tracking-[-0.01em] leading-[1.25] truncate">
                  {card.title}
                </h3>
                <p className="text-[10px] max-[720px]:text-[8.5px] leading-[1.4] text-[rgba(226,232,240,0.82)] mt-[4px] line-clamp-2">
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[9px] max-[720px]:text-[8px] text-[rgba(123,92,255,0.95)] font-semibold tracking-[0.04em] border-t border-[rgba(255,255,255,0.08)] pt-[5px]">
                <span>{card.strand}</span>
                <a
                  href={card.link}
                  className="hover:text-white transition-colors"
                >
                  {card.category}
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Lower Captions (0.40–0.56 and 0.66–1.00) */}
        <div className="absolute bottom-[28px] max-[720px]:bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] max-w-[580px] text-center z-10 pointer-events-none px-3">
          <div
            ref={caption1Ref}
            className="absolute bottom-0 left-0 w-full opacity-0 translate-y-4 transition-all duration-400 ease-out pointer-events-none"
          >
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#FF2BD6] [text-shadow:0_0_16px_rgba(255,43,214,0.7)] mb-[6px] inline-block">
              RESEARCH // EXPLORATION
            </span>
            <h2 className="text-[23px] max-[720px]:text-[17px] font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.95),0_0_24px_rgba(123,92,255,0.5)] leading-[1.2]">
              Distributed Systems &amp; Resilient Cores
            </h2>
            <p className="text-[13px] max-[720px]:text-[11px] leading-[1.5] max-[720px]:leading-[1.4] text-[rgba(226,232,240,0.88)] mt-[6px] [text-shadow:0_2px_10px_rgba(0,0,0,0.98)]">
              Investigating asynchronous concurrency protocols and low-latency transactional architectures.
            </p>
          </div>

          <div
            ref={caption2Ref}
            className="absolute bottom-0 left-0 w-full opacity-0 translate-y-4 transition-all duration-400 ease-out pointer-events-none"
          >
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#FF2BD6] [text-shadow:0_0_16px_rgba(255,43,214,0.7)] mb-[6px] inline-block">
              GRAPHICS // REAL-TIME
            </span>
            <h2 className="text-[23px] max-[720px]:text-[17px] font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.95),0_0_24px_rgba(123,92,255,0.5)] leading-[1.2]">
              Accelerated Geometry &amp; Visual Manifolds
            </h2>
            <p className="text-[13px] max-[720px]:text-[11px] leading-[1.5] max-[720px]:leading-[1.4] text-[rgba(226,232,240,0.88)] mt-[6px] [text-shadow:0_2px_10px_rgba(0,0,0,0.98)]">
              Mathematical modeling of high-order structures rendered through direct hardware pipelines.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Top HUD (Brand Title & Progress Counter) */}
      <header className="fixed top-[84px] max-[720px]:top-[72px] left-0 w-full px-[32px] max-[720px]:px-[16px] flex justify-between items-center z-20 pointer-events-none">
        <div className="flex items-center gap-[10px] bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-[8px] h-[8px] rounded-full bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]" />
          <span className="text-[12px] max-[720px]:text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.85)]">
            Spiral Chain // Particle Helix
          </span>
        </div>
        <div
          ref={progressCounterRef}
          className="font-mono text-[12px] max-[720px]:text-[10px] font-semibold tracking-[0.08em] text-[#00F0FF] bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.25)] px-[12px] max-[720px]:px-[10px] py-[5px] max-[720px]:py-[3px] rounded-[20px] backdrop-blur-[6px]"
        >
          P // 0.00
        </div>
      </header>

      {/* Fixed Bottom Scroll Hint */}
      <div
        ref={scrollHintRef}
        className="fixed bottom-[24px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[6px] text-[10px] font-semibold tracking-[0.2em] uppercase text-[rgba(255,255,255,0.6)] z-20 pointer-events-none transition-all duration-300"
      >
        <span>Scroll</span>
        <div className="w-[14px] h-[14px] border-b-2 border-r-2 border-[rgba(0,240,255,0.8)] rotate-45 animate-bounce" />
      </div>
    </div>
  );
};
