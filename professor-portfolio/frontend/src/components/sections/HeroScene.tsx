import React, { useEffect, useRef } from 'react';
import { heroConfig } from '../../config/hero';
import { storyCards } from '../../config/sections';

interface HeroSceneProps {
  progress: number; // smoothed p: 0.00 to 1.00
  reducedMotion?: boolean;
}

interface Particle {
  cx: number;
  cy: number;
  cz: number;
  hx: number;
  hy: number;
  hz: number;
  strand: number; // 0 = Strand A (cyan), 1 = Strand B (magenta), 2 = Dust (violet)
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

export const HeroScene: React.FC<HeroSceneProps> = ({ progress, reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // Phase A->B overlap: fade out chain smoothly as carousel takes over (0.52 -> 0.66)
  const chainOpacity = progress > heroConfig.timeline.overlapStart
    ? Math.max(0, 1 - (progress - heroConfig.timeline.overlapStart) / (heroConfig.timeline.overlapEnd - heroConfig.timeline.overlapStart))
    : 1;

  const isChainHidden = chainOpacity <= 0.005;

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const chainOpacityRef = useRef(chainOpacity);
  chainOpacityRef.current = chainOpacity;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    let stageWidth = container.clientWidth;
    let stageHeight = container.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const isMobile = () => stageWidth < 720;

    // Sprite Generation for High-Performance Additive Blending (matches index.html)
    const SPRITE_SIZE = 32;
    function makeSprite(colorCore: string, colorGlow: string): HTMLCanvasElement {
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

    const spriteCyan = makeSprite('rgba(255, 255, 255, 1)', 'rgba(0, 240, 255, 0.85)');
    const spriteMagenta = makeSprite('rgba(255, 255, 255, 1)', 'rgba(255, 43, 214, 0.85)');
    const spriteViolet = makeSprite('rgba(255, 255, 255, 0.8)', 'rgba(123, 92, 255, 0.65)');

    // Helix Constants (from index.html)
    const HELIX_TURNS = 3;
    const HELIX_HEIGHT = 2.4;
    let HELIX_RADIUS = isMobile() ? 0.44 : 0.6;
    let CARD_RADIUS = isMobile() ? 0.80 : 1.9;

    let particles: Particle[] = [];

    function initParticles() {
      particles = [];
      const mobile = isMobile();
      const helixCount = mobile ? 2600 : 4600;
      const dustCount = mobile ? 400 : 700;
      HELIX_RADIUS = mobile ? 0.44 : 0.6;
      CARD_RADIUS = mobile ? 0.80 : 1.9;

      const { cloudSpread } = heroConfig.particles;

      // 1. Double-Helix Particles (Strand A: Cyan, Strand B: Magenta)
      for (let i = 0; i < helixCount; i++) {
        const t = Math.random();
        const strand = i % 2;
        const angle = t * HELIX_TURNS * 2 * Math.PI + strand * Math.PI;
        const jitterX = (Math.random() - 0.5) * 0.04;
        const jitterY = (Math.random() - 0.5) * 0.04;
        const jitterZ = (Math.random() - 0.5) * 0.04;

        const hx = HELIX_RADIUS * Math.cos(angle) + jitterX;
        const hy = -t * HELIX_HEIGHT + jitterY;
        const hz = HELIX_RADIUS * Math.sin(angle) + jitterZ;

        // Cloud Gaussian distribution
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random());
        const cx = r * Math.sin(phi) * Math.cos(theta) * cloudSpread.x;
        const cy = r * Math.sin(phi) * Math.sin(theta) * cloudSpread.y;
        const cz = r * Math.cos(phi) * cloudSpread.z;

        const baseSize = mobile ? (Math.random() * 1.0 + 0.8) : (Math.random() * 1.5 + 1.0);
        const baseAlpha = Math.random() * 0.35 + 0.65;

        particles.push({
          cx, cy, cz,
          hx, hy, hz,
          strand,
          seed: Math.random() * 100,
          baseSize,
          baseAlpha
        });
      }

      // 2. Faint Violet Dust inside cylinder at 35% alpha
      for (let i = 0; i < dustCount; i++) {
        const t = Math.random();
        const r = HELIX_RADIUS * Math.sqrt(Math.random()) * 0.9;
        const theta = Math.random() * Math.PI * 2;
        const hx = r * Math.cos(theta);
        const hy = -t * HELIX_HEIGHT;
        const hz = r * Math.sin(theta);

        const u = Math.random();
        const v = Math.random();
        const phi = Math.acos(2.0 * v - 1.0);
        const cr = Math.cbrt(Math.random());
        const cx = cr * Math.sin(phi) * Math.cos(theta) * cloudSpread.x;
        const cy = cr * Math.sin(phi) * Math.sin(theta) * cloudSpread.y;
        const cz = cr * Math.cos(phi) * cloudSpread.z;

        const baseSize = mobile ? (Math.random() * 0.8 + 0.6) : (Math.random() * 1.2 + 0.8);

        particles.push({
          cx, cy, cz,
          hx, hy, hz,
          strand: 2,
          seed: Math.random() * 100,
          baseSize,
          baseAlpha: 0.35
        });
      }
    }

    function resize() {
      if (!container || !canvas) return;
      stageWidth = container.clientWidth;
      stageHeight = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(stageWidth * dpr);
      canvas.height = Math.floor(stageHeight * dpr);
      canvas.style.width = stageWidth + 'px';
      canvas.style.height = stageHeight + 'px';

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      initParticles();
    }

    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    const startTime = performance.now();

    function render(now: number) {
      animId = requestAnimationFrame(render);
      const currentOpacity = chainOpacityRef.current;
      if (currentOpacity <= 0.005) {
        // Hide all cards when chain is faded out
        for (let i = 0; i < 6; i++) {
          const el = cardRefs.current[i];
          if (el) el.style.opacity = '0';
        }
        return;
      }

      const p = progressRef.current;
      const elapsedSec = (now - startTime) * 0.001;
      const mobile = isMobile();

      // Clear Canvas
      context.clearRect(0, 0, stageWidth, stageHeight);
      context.globalCompositeOperation = 'lighter';

      // Cloud-to-helix morph factor (over p 0.00 -> 0.20)
      const morph = smoothstep(0.00, 0.20, p);

      // Camera Descent: moves down the chain as user scrolls (from index.html)
      const d = smoothstep(0.18, 0.95, p);
      const camY = -0.4 - d * 0.88;

      // Spin: A = d * 3 * PI + time * 0.08 (from index.html)
      const timeOffset = reducedMotion ? 0 : elapsedSec * 0.08;
      const A = d * 3 * Math.PI + timeOffset;

      const cosA = Math.cos(A);
      const sinA = Math.sin(A);

      // Projection: unit = min(stageWidth, stageHeight) * 0.3 (from index.html)
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

      // Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // Smooth morph from cloud to helix
        const px = pt.cx + (pt.hx - pt.cx) * morph;
        const py = pt.cy + (pt.hy - pt.cy) * morph;
        const pz = pt.cz + (pt.hz - pt.cz) * morph;

        const proj = project(px, py, pz);

        if (proj.sx < -10 || proj.sx > stageWidth + 10 || proj.sy < -10 || proj.sy > stageHeight + 10) {
          continue;
        }

        const shimmer = reducedMotion ? 1.0 : (0.85 + 0.15 * Math.sin(elapsedSec * 1.3 + pt.seed));
        const alpha = clamp(pt.baseAlpha * shimmer * currentOpacity, 0.05, 1.0);

        const sprite = (pt.strand === 0) ? spriteCyan : (pt.strand === 1) ? spriteMagenta : spriteViolet;
        const pSize = Math.max(3, pt.baseSize * proj.persp * (pt.strand === 2 ? 4 : 5));

        context.globalAlpha = alpha;
        context.drawImage(sprite, proj.sx - pSize * 0.5, proj.sy - pSize * 0.5, pSize, pSize);
      }

      context.globalAlpha = 1.0;

      // Project and Render Cards directly via DOM refs (exact matches to index.html for 60fps)
      const halfCardW = mobile ? 77 : 85;
      const halfCardH = mobile ? 48 : 52;

      for (let i = 0; i < 6; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const angle_i = (i / 6) * 2 * Math.PI;
        const t_i = 0.18 + (i / 5) * 0.56;

        const cx = CARD_RADIUS * Math.cos(angle_i);
        const cy = -t_i * HELIX_HEIGHT;
        const cz = CARD_RADIUS * Math.sin(angle_i);

        const proj = project(cx, cy, cz);

        let reveal = 0;
        if (reducedMotion) {
          reveal = 1.0;
        } else {
          const start_i = 0.18 + i * 0.08;
          const end_i = start_i + 0.08;
          reveal = smoothstep(start_i, end_i, p);
        }

        const isOffScreenY = (proj.sy < -120 || proj.sy > stageHeight + 120);

        if (reveal <= 0.001 || isOffScreenY) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }

        let sx = proj.sx;
        const s = clamp(proj.persp * 0.95, 0.55, 1.15);

        if (mobile) {
          const visualHalfW = halfCardW * s;
          sx = clamp(sx, 16 + visualHalfW, stageWidth - 16 - visualHalfW);
        }

        const isFront = proj.zr < 0;
        const depthOpacity = isFront ? 1.0 : 0.6;
        const zIndex = isFront ? 3 : 1;
        const finalOpacity = reveal * depthOpacity * currentOpacity;

        const riseY = (1 - reveal) * 40;
        const translateX = sx - halfCardW;
        const translateY = proj.sy - halfCardH + riseY;

        el.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0px) scale(${s.toFixed(3)})`;
        el.style.opacity = finalOpacity.toFixed(3);
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = finalOpacity > 0.1 ? 'auto' : 'none';
      }
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  if (isChainHidden) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      style={{ opacity: chainOpacity }}
    >
      {/* Ambient background glow from index.html */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full blur-[70px] -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(123, 92, 255, 0.12) 0%, rgba(0, 240, 255, 0.06) 40%, transparent 70%)'
        }}
      />

      {/* Canvas 2D for particle helix and dust */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* 6 Project Cards Container (DOM elements matching index.html) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {storyCards.map((card, idx) => (
          <article
            key={card.id}
            ref={(el) => { cardRefs.current[idx] = el; }}
            className="absolute rounded-[14px] text-left pointer-events-auto flex flex-col justify-between select-none will-change-transform opacity-0"
            style={{
              width: '170px',
              height: '104px',
              padding: '10px 12px',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.14) 0%, rgba(123, 92, 255, 0.09) 50%, rgba(255, 43, 214, 0.14) 100%)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 0 25px rgba(123, 92, 255, 0.32), inset 0 0 15px rgba(0, 240, 255, 0.15)'
            }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[8.5px] font-bold tracking-[0.08em] uppercase text-brand-cyan bg-brand-cyan/15 px-1.5 py-0.5 rounded border border-brand-cyan/30">
                {card.tag || card.eyebrow}
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full bg-brand-magenta shadow-[0_0_8px_#FF2BD6]"
              />
            </div>

            {/* Card Body */}
            <div className="mt-0.5">
              <h3 className="text-[11px] font-bold text-white tracking-[-0.01em] leading-[1.2] truncate">
                {card.title}
              </h3>
              <p className="text-[8px] leading-[1.35] text-neutral-200/80 mt-0.5 line-clamp-2 font-normal">
                {card.body}
              </p>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between text-[7.5px] font-semibold text-brand-violet tracking-[0.04em] border-t border-white/[0.08] pt-1">
              <span>{idx % 2 === 0 ? 'STRAND A' : 'STRAND B'}</span>
              <a
                href={card.link || "#projects"}
                className="text-brand-cyan hover:text-white uppercase font-mono transition-colors"
              >
                SYSTEMS →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
