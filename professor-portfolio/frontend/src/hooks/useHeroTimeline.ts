import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Timing and palette constants in one central configuration object
export const TIMELINE_CONFIG = {
  DURATION: 10.0, // seconds for full cycle
  PARTICLE_COUNT_DESKTOP: 12000,
  PARTICLE_COUNT_MOBILE: 5000,
  MAX_DEVICE_PIXEL_RATIO: 2.0,
  PHASES: {
    RIBBON: { start: 0.0, end: 2.5 },
    WAVE: { start: 2.5, end: 4.5 },
    VORTEX: { start: 4.5, end: 7.0 },
    FLASH: { start: 7.0, end: 7.4 },
    GALAXY: { start: 7.4, end: 10.0 }
  },
  PALETTE: {
    baseDark: '#05060a',
    electricBlue: '#00f0ff',
    violet: '#8b5cf6',
    warmOrange: '#f97316',
    coral: '#ff4738',
    white: '#ffffff'
  }
};

interface UseHeroTimelineProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  reducedMotion: boolean;
  vertexShader: string;
  fragmentShader: string;
}

export function useHeroTimeline({
  canvasRef,
  containerRef,
  reducedMotion,
  vertexShader,
  fragmentShader
}: UseHeroTimelineProps) {
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Detect WebGL support
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to CSS styling', e);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 2.4;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile
      ? TIMELINE_CONFIG.PARTICLE_COUNT_MOBILE
      : TIMELINE_CONFIG.PARTICLE_COUNT_DESKTOP;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, TIMELINE_CONFIG.MAX_DEVICE_PIXEL_RATIO);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Buffers for geometric forms
    const initialPositions = new Float32Array(particleCount * 3);
    const vortexPositions = new Float32Array(particleCount * 3);
    const galaxyPositions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const seeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const seed = Math.random();
      seeds[i] = seed;
      sizes[i] = 0.035 + Math.random() * 0.045;

      // 1. Initial Portal Ring / Ribbon (Oval with waviness)
      const ringAngle = (i / particleCount) * Math.PI * 2.0;
      const ringRadius = 0.85 + (Math.random() - 0.5) * 0.28;
      initialPositions[i3] = Math.cos(ringAngle) * ringRadius * 1.35;
      initialPositions[i3 + 1] = Math.sin(ringAngle) * ringRadius * 0.95;
      initialPositions[i3 + 2] = (Math.random() - 0.5) * 0.35;

      // 2. Central Vortex (Tightly spiraled core)
      const vDist = Math.pow(Math.random(), 1.6) * 1.1;
      const vAngle = Math.random() * Math.PI * 2.0;
      vortexPositions[i3] = Math.cos(vAngle) * vDist;
      vortexPositions[i3 + 1] = Math.sin(vAngle) * vDist;
      vortexPositions[i3 + 2] = (Math.random() - 0.5) * 0.5 * (1.0 - vDist);

      // 3. Tilted Spiral Galaxy Disk
      const armIndex = i % 2;
      const armOffset = (armIndex * Math.PI);
      const gDist = 0.12 + Math.pow(Math.random(), 1.4) * 1.3;
      const gTheta = gDist * 4.5 + armOffset + (Math.random() - 0.5) * 0.45;
      // Incline galaxy plane by ~35 degrees
      const gx = Math.cos(gTheta) * gDist;
      const gy = (Math.sin(gTheta) * gDist) * 0.55;
      const gz = Math.sin(gTheta) * gDist * 0.45 + (Math.random() - 0.5) * 0.15;
      galaxyPositions[i3] = gx;
      galaxyPositions[i3 + 1] = gy - 0.15;
      galaxyPositions[i3 + 2] = gz;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    geometry.setAttribute('aInitialPos', new THREE.BufferAttribute(initialPositions, 3));
    geometry.setAttribute('aVortexPos', new THREE.BufferAttribute(vortexPositions, 3));
    geometry.setAttribute('aGalaxyPos', new THREE.BufferAttribute(galaxyPositions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const uniforms = {
      uTime: { value: 0.0 },
      uPhase: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.0, 0.0) },
      uAspect: { value: container.clientWidth / container.clientHeight },
      uPixelRatio: { value: pixelRatio }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Mouse movement listener
    const targetMouse = new THREE.Vector2(0, 0);
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.set(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Touch support for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        targetMouse.set(x, y);
      }
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // IntersectionObserver to pause rendering when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // VisibilityChange listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
      } else {
        isVisibleRef.current = true;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      uniforms.uAspect.value = width / height;
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      if (reducedMotion) {
        // Render static final composition (Phase = 0.85 galaxy)
        uniforms.uTime.value = 5.0;
        uniforms.uPhase.value = 0.85;
        renderer.render(scene, camera);
        return;
      }

      const elapsedTime = clock.getElapsedTime();
      const loopTime = elapsedTime % TIMELINE_CONFIG.DURATION;
      const phase = loopTime / TIMELINE_CONFIG.DURATION;

      uniforms.uTime.value = elapsedTime;
      uniforms.uPhase.value = phase;

      // Smooth mouse interpolation
      uniforms.uMouse.value.lerp(targetMouse, 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvasRef, containerRef, reducedMotion, vertexShader, fragmentShader]);
}

