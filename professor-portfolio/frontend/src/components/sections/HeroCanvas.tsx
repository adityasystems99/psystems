import React, { useRef } from 'react';
import { useHeroTimeline } from '../../hooks/useHeroTimeline';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import vertexShader from '../../shaders/hero.vert.glsl?raw';
import fragmentShader from '../../shaders/hero.frag.glsl?raw';

export const HeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useHeroTimeline({
    canvasRef,
    containerRef,
    reducedMotion,
    vertexShader,
    fragmentShader
  });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto select-none"
      aria-hidden="true"
    >
      {/* Three.js Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Atmospheric Radial Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 hero-vignette" />

      {/* CSS Fallback Backdrop if WebGL fails or reduced motion */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.15),rgba(139,92,246,0.1),transparent_70%)]" />
    </div>
  );
};

