import { useEffect, useRef, useState } from 'react';

interface UseScrollProgressOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  lerpFactor?: number;
  reducedMotion?: boolean;
}

export function useScrollProgress({
  containerRef,
  lerpFactor = 0.1,
  reducedMotion = false
}: UseScrollProgressOptions) {
  const [progress, setProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    // Check if ?p= is passed in URL query for testing / screenshot acceptance
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const forcedP = searchParams.get('p');
      if (forcedP !== null) {
        const val = parseFloat(forcedP);
        if (!isNaN(val)) {
          targetProgressRef.current = val;
          currentProgressRef.current = val;
          setProgress(val);
          return;
        }
      }
    }

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = container.clientHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      targetProgressRef.current = rawProgress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let animId: number;
    const update = () => {
      if (reducedMotion) {
        // Stepwise progress for reduced motion
        currentProgressRef.current = targetProgressRef.current;
        setProgress(currentProgressRef.current);
      } else {
        const diff = targetProgressRef.current - currentProgressRef.current;
        if (Math.abs(diff) > 0.0001) {
          currentProgressRef.current += diff * lerpFactor;
          setProgress(currentProgressRef.current);
        }
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, [containerRef, lerpFactor, reducedMotion]);

  return {
    p: progress,
    rawTarget: targetProgressRef.current,
    setProgressStep: (stepProgress: number) => {
      targetProgressRef.current = stepProgress;
      currentProgressRef.current = stepProgress;
      setProgress(stepProgress);
    }
  };
}
