import React, { useEffect, useRef } from 'react';

// ============================================================================
// CONSTANTS & PALETTE (Exposed at top of file per deliverable specification)
// ============================================================================
export const PARTICLE_COUNT_DESKTOP = 4000;
export const PARTICLE_COUNT_MOBILE = 2000;

export const PALETTE = {
  base: '#07060F',                     // Near-black indigo base
  cyan: '#00F0FF',                     // Neon Cyan
  magenta: '#FF2BD6',                  // Neon Magenta
  violet: '#7B5CFF',                   // Luminous Violet
  centerGlow: 'rgba(123, 92, 255, 0.14)',
  vignetteCenter: 'rgba(7, 6, 15, 0.60)', // Center darkening for text legibility
};

interface CosmicBackgroundProps {
  scrollProgress?: number; // 0 to 1
  className?: string;
  style?: React.CSSProperties;
}

interface Particle {
  // Base properties
  color: string;
  baseSize: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;

  // Organic random offsets
  ox: number;
  oy: number;
  oz: number;

  // Point target (p: 0.00 - 0.25)
  ptRadius: number;
  ptTheta: number;
  ptPhi: number;

  // Spherical swarm target (p: 0.25 - 0.55)
  spRadius: number;
  spTheta: number;
  spPhi: number;
  spBreathePhase: number;

  // Spiral galaxy target (p: 0.55 - 1.00)
  arm: number; // 0 or 1
  armU: number; // 0.08 to 1.0
  armScatterAngle: number;
  armScatterDist: number;
  armSpeed: number;
}

interface DistantStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  scrollProgress,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (fallbackRef.current) {
        fallbackRef.current.style.display = 'block';
      }
      return;
    }

    const context: CanvasRenderingContext2D = ctx;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let stageWidth = window.innerWidth;
    let stageHeight = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let rawP = scrollProgress !== undefined ? scrollProgress : 0;
    let smoothedP = prefersReducedMotion ? 1.0 : rawP;

    // Distant Stars (10-20% opacity static points slowly twinkling)
    const STAR_COUNT = 220;
    const distantStars: DistantStar[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      distantStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.2 + 0.6,
        baseAlpha: Math.random() * 0.10 + 0.10, // 10% - 20%
        twinkleSpeed: Math.random() * 1.5 + 0.8,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Pre-rendered offscreen glowing sprites for cinema-grade additive blending performance
    const SPRITE_SIZE = 32;
    function createGlowSprite(colorCore: string, colorGlow: string): HTMLCanvasElement {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = SPRITE_SIZE;
      sCanvas.height = SPRITE_SIZE;
      const sctx = sCanvas.getContext('2d');
      if (!sctx) return sCanvas;
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
    const spriteViolet = createGlowSprite('rgba(255, 255, 255, 0.95)', 'rgba(123, 92, 255, 0.75)');

    // Generate Subtle Film Grain (3% opacity)
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 160;
    grainCanvas.height = 160;
    const gctx = grainCanvas.getContext('2d');
    if (gctx) {
      const gImg = gctx.createImageData(160, 160);
      const data = gImg.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 9; // ~3.5% alpha
      }
      gctx.putImageData(gImg, 0, 0);
    }

    // Particle Swarm Generation
    const isMobile = () => window.innerWidth < 720;
    let particles: Particle[] = [];
    let cachedIsMobile: boolean | null = null;

    function initSwarm() {
      particles = [];
      const mobile = isMobile();
      cachedIsMobile = mobile;
      const count = mobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

      for (let i = 0; i < count; i++) {
        // Color distribution: ~40% Cyan, ~40% Magenta, ~20% Violet
        const colorRand = Math.random();
        let color = PALETTE.cyan;
        if (colorRand > 0.80) {
          color = PALETTE.violet;
        } else if (colorRand > 0.40) {
          color = PALETTE.magenta;
        }

        const baseSize = Math.random() * 1.4 + 0.6; // 0.6 - 2.0px
        const baseAlpha = Math.random() * 0.45 + 0.45;
        const pulsePhase = Math.random() * Math.PI * 2;
        const pulseSpeed = Math.random() * 1.8 + 1.0;

        // Organic offset
        const ox = (Math.random() - 0.5) * 40;
        const oy = (Math.random() - 0.5) * 40;
        const oz = (Math.random() - 0.5) * 40;

        // 1. Point target: tightly focused single point at center
        const ptRadius = Math.pow(Math.random(), 3) * 36; // highly concentrated core
        const ptTheta = Math.random() * Math.PI * 2;
        const ptPhi = Math.acos(2 * Math.random() - 1);

        // 2. Spherical swarm target: breathing sphere
        const spRadius = Math.cbrt(Math.random()) * 260; // uniform 3D sphere
        const spTheta = Math.random() * Math.PI * 2;
        const spPhi = Math.acos(2 * Math.random() - 1);
        const spBreathePhase = Math.random() * Math.PI * 2;

        // 3. Spiral galaxy target: two-arm spiral with streaming particles
        const arm = i % 2; // Arm 0 or Arm 1
        const armU = Math.pow(Math.random(), 0.65) * 0.92 + 0.08; // 0.08 - 1.0
        const armScatterAngle = Math.random() * Math.PI * 2;
        const armScatterDist = (1 - armU * 0.6) * (Math.random() * 26 + 6);
        const armSpeed = (Math.random() * 0.06 + 0.04) * (1 / (armU + 0.25));

        particles.push({
          color,
          baseSize,
          baseAlpha,
          pulsePhase,
          pulseSpeed,
          ox,
          oy,
          oz,
          ptRadius,
          ptTheta,
          ptPhi,
          spRadius,
          spTheta,
          spPhi,
          spBreathePhase,
          arm,
          armU,
          armScatterAngle,
          armScatterDist,
          armSpeed
        });
      }
    }

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

      if (cachedIsMobile !== isMobile()) {
        initSwarm();
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Scroll listener if scrollProgress prop is omitted
    const handleScroll = () => {
      if (scrollProgress !== undefined) return;
      const urlParams = new URLSearchParams(window.location.search);
      const queryP = urlParams.get('p');
      if (queryP !== null && !isNaN(parseFloat(queryP))) {
        rawP = clamp(parseFloat(queryP), 0, 1);
        return;
      }
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        rawP = clamp(window.scrollY / maxScroll, 0, 1);
      }
    };
    if (scrollProgress === undefined) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // Visibility management
    let isVisible = !document.hidden;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let animId = 0;
    const startTime = performance.now();

    function renderFrame(now: number) {
      if (!isVisible) {
        animId = requestAnimationFrame(renderFrame);
        return;
      }

      const elapsedSec = (now - startTime) * 0.001;

      // Smooth progress: lerp about 0.1 per frame
      const targetP = scrollProgress !== undefined ? scrollProgress : rawP;
      if (prefersReducedMotion) {
        smoothedP = 1.0;
      } else {
        smoothedP += (targetP - smoothedP) * 0.10;
      }

      // Base Background Fill
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = PALETTE.base;
      context.fillRect(0, 0, stageWidth, stageHeight);

      // Soft Violet Radial Glow behind center
      const centerX = stageWidth * 0.5;
      const centerY = stageHeight * 0.5;
      const glowGrad = context.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(stageWidth, stageHeight) * 0.65
      );
      glowGrad.addColorStop(0, 'rgba(123, 92, 255, 0.12)');
      glowGrad.addColorStop(0.45, 'rgba(0, 240, 255, 0.04)');
      glowGrad.addColorStop(1, 'rgba(7, 6, 15, 0)');
      context.fillStyle = glowGrad;
      context.fillRect(0, 0, stageWidth, stageHeight);

      // Two to three large, heavily blurred nebula blobs drifting slowly (6-12% opacity)
      const tDrift = prefersReducedMotion ? 0 : elapsedSec * 0.08;
      const nebulae = [
        {
          x: centerX + Math.cos(tDrift * 0.8) * 160,
          y: centerY + Math.sin(tDrift * 0.7) * 90,
          radius: 360,
          color: 'rgba(123, 92, 255, 0.09)' // violet blob
        },
        {
          x: centerX + Math.sin(tDrift * 0.9) * 200,
          y: centerY - Math.cos(tDrift * 0.6) * 120,
          radius: 320,
          color: 'rgba(0, 240, 255, 0.07)' // cyan blob
        },
        {
          x: centerX - Math.cos(tDrift * 0.5) * 180,
          y: centerY + Math.sin(tDrift * 1.1) * 110,
          radius: 300,
          color: 'rgba(255, 43, 214, 0.08)' // magenta blob
        }
      ];

      for (const neb of nebulae) {
        const nGrad = context.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        nGrad.addColorStop(0, neb.color);
        nGrad.addColorStop(1, 'rgba(7, 6, 15, 0)');
        context.fillStyle = nGrad;
        context.beginPath();
        context.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
        context.fill();
      }

      // Faint distant twinkling stars (10-20% opacity)
      context.fillStyle = '#FFFFFF';
      for (let i = 0; i < distantStars.length; i++) {
        const star = distantStars[i];
        const twinkle = prefersReducedMotion ? 1.0 : (0.75 + 0.25 * Math.sin(elapsedSec * star.twinkleSpeed + star.twinklePhase));
        context.globalAlpha = clamp(star.baseAlpha * twinkle, 0.05, 0.25);
        context.fillRect(star.x * stageWidth, star.y * stageHeight, star.size, star.size);
      }
      context.globalAlpha = 1.0;

      // ======================================================================
      // PARTICLE SWARM & SHAPE TRANSFORMATIONS (ADDITIVE BLENDING)
      // ======================================================================
      context.globalCompositeOperation = 'lighter';

      // Shape weightings computed smoothly across scroll progress
      // p: 0.00 - 0.25 -> Point gathering
      // p: 0.25 - 0.55 -> Spherical swarm breathing
      // p: 0.55 - 1.00 -> Two-arm spiral galaxy rotating
      const p = smoothedP;
      const wPoint = 1.0 - smoothstep(0.12, 0.32, p);
      const wSphere = smoothstep(0.15, 0.35, p) * (1.0 - smoothstep(0.48, 0.68, p));
      const wGalaxy = smoothstep(0.50, 0.72, p);

      // Normalization sum so transitions remain perfectly balanced
      const totalWeight = wPoint + wSphere + wGalaxy || 1.0;
      const normPoint = wPoint / totalWeight;
      const normSphere = wSphere / totalWeight;
      const normGalaxy = wGalaxy / totalWeight;

      // Continuous slow idle drift: 0.05 rad/s
      const idleRot = prefersReducedMotion ? 0 : elapsedSec * 0.05;
      const cosRot = Math.cos(idleRot);
      const sinRot = Math.sin(idleRot);

      // Breathing oscillation for sphere
      const sphereBreathe = prefersReducedMotion ? 1.0 : (1.0 + 0.08 * Math.sin(elapsedSec * 1.8));

      // Galaxy rotation & arm streaming
      const galaxyRot = idleRot * 1.5;

      const scaleUnit = Math.min(stageWidth, stageHeight) * 0.52;

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // 1. Point Coordinate
        // Particles converge toward bright central focal point
        const ptR = pt.ptRadius * (scaleUnit / 300);
        const ptX = ptR * Math.sin(pt.ptPhi) * Math.cos(pt.ptTheta) + pt.ox * 0.15;
        const ptY = ptR * Math.sin(pt.ptPhi) * Math.sin(pt.ptTheta) + pt.oy * 0.15;
        const ptZ = ptR * Math.cos(pt.ptPhi) + pt.oz * 0.15;

        // 2. Spherical Swarm Coordinate
        const spR = pt.spRadius * (scaleUnit / 280) * sphereBreathe;
        const spX = spR * Math.sin(pt.spPhi) * Math.cos(pt.spTheta) + pt.ox * 0.5;
        const spY = spR * Math.sin(pt.spPhi) * Math.sin(pt.ptTheta) + pt.oy * 0.5;
        const spZ = spR * Math.cos(pt.spPhi) * 0.75 + pt.oz * 0.5;

        // 3. Two-Arm Spiral Galaxy Coordinate
        // Logarithmic arms rotating with streaming particles
        const armBaseAngle = pt.arm * Math.PI;
        const streamingOffset = prefersReducedMotion ? 0 : elapsedSec * pt.armSpeed;
        const armAngle = armBaseAngle + pt.armU * 3.4 * Math.PI + galaxyRot + streamingOffset;
        const galaxyR = pt.armU * scaleUnit * 1.15;

        const scatterX = Math.cos(pt.armScatterAngle) * pt.armScatterDist;
        const scatterY = Math.sin(pt.armScatterAngle) * pt.armScatterDist;

        const gx = galaxyR * Math.cos(armAngle) + scatterX + pt.ox * 0.25;
        const gy = (galaxyR * Math.sin(armAngle) + scatterY + pt.oy * 0.25) * 0.44; // tilted galaxy plane
        const gz = (pt.oz * 0.3) + Math.sin(armAngle) * 20;

        // Blended Position
        const rawX = ptX * normPoint + spX * normSphere + gx * normGalaxy;
        const rawY = ptY * normPoint + spY * normSphere + gy * normGalaxy;
        const rawZ = ptZ * normPoint + spZ * normSphere + gz * normGalaxy;

        // Apply idle rotation around Y-axis
        const rotX = rawX * cosRot + rawZ * sinRot;
        const rotZ = -rawX * sinRot + rawZ * cosRot;
        const rotY = rawY;

        // Perspective projection
        const cameraDist = 800;
        const persp = cameraDist / (cameraDist + rotZ);
        const screenX = centerX + rotX * persp;
        const screenY = centerY + rotY * persp;

        if (screenX < -20 || screenX > stageWidth + 20 || screenY < -20 || screenY > stageHeight + 20) {
          continue;
        }

        // Shimmer alpha pulsing
        const shimmer = prefersReducedMotion ? 1.0 : (0.80 + 0.20 * Math.sin(elapsedSec * pt.pulseSpeed + pt.pulsePhase));
        let alpha = clamp(pt.baseAlpha * shimmer * persp, 0.08, 1.0);

        // Core brightening at p: 0.00 - 0.25
        if (normPoint > 0.4) {
          alpha = clamp(alpha * (1.0 + normPoint * 0.5), 0.1, 1.0);
        }

        const size = Math.max(1.2, pt.baseSize * persp * 4.2);
        const sprite = pt.color === PALETTE.cyan ? spriteCyan : (pt.color === PALETTE.magenta ? spriteMagenta : spriteViolet);

        context.globalAlpha = alpha;
        context.drawImage(sprite, screenX - size * 0.5, screenY - size * 0.5, size, size);
      }

      // Bright central luminous core beacon at p: 0.00 - 0.25
      if (normPoint > 0.05) {
        const coreSize = 64 * normPoint;
        const coreGrad = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        coreGrad.addColorStop(0.2, 'rgba(0, 240, 255, 0.75)');
        coreGrad.addColorStop(0.5, 'rgba(123, 92, 255, 0.40)');
        coreGrad.addColorStop(1, 'rgba(7, 6, 15, 0)');
        context.fillStyle = coreGrad;
        context.beginPath();
        context.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
        context.fill();
      }

      // ======================================================================
      // VIGNETTE & FILM GRAIN OVERLAY (Readability & Cinematic Depth)
      // ======================================================================
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1.0;

      // Darkened center & edge vignette so text / cards stay effortlessly readable
      const vignetteGrad = context.createRadialGradient(
        centerX, centerY, 80,
        centerX, centerY, Math.max(stageWidth, stageHeight) * 0.70
      );
      vignetteGrad.addColorStop(0, PALETTE.vignetteCenter);
      vignetteGrad.addColorStop(0.40, 'rgba(7, 6, 15, 0.35)');
      vignetteGrad.addColorStop(1, 'rgba(7, 6, 15, 0.85)');
      context.fillStyle = vignetteGrad;
      context.fillRect(0, 0, stageWidth, stageHeight);

      // Subtle Film Grain Overlay at 3% opacity
      if (grainCanvas.width > 0) {
        const pattern = context.createPattern(grainCanvas, 'repeat');
        if (pattern) {
          context.fillStyle = pattern;
          context.fillRect(0, 0, stageWidth, stageHeight);
        }
      }

      animId = requestAnimationFrame(renderFrame);
    }

    animId = requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', resize);
      if (scrollProgress === undefined) {
        window.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      {/* Static CSS radial-gradient fallback if WebGL/Canvas2D is unavailable */}
      <div
        ref={fallbackRef}
        className="hidden absolute top-0 left-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(123, 92, 255, 0.18) 0%, rgba(0, 240, 255, 0.08) 45%, #07060F 85%)'
        }}
      />
    </div>
  );
};

export default CosmicBackground;
