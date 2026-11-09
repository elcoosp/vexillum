import { useEffect, useRef, useState } from "react";

/**
 * Count-up ticker for dashboard stats (interior.dev school): the number
 * springs from its previous value to the new one over ~600ms with an
 * ease-out curve, so refreshes read as "the number moved" instead of a
 * hard swap. Respects prefers-reduced-motion (jumps straight to the
 * target) and never formats mid-flight differently than the final render —
 * the caller passes the same `format` fn for both.
 */
export function useCountUp(target: number, format: (n: number) => string): string {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const dur = 600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      // ease-out quint — fast start, soft landing
      const e = 1 - Math.pow(1 - t, 5);
      const value = Math.round(from + (target - from) * e);
      setDisplay(value);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return format(display);
}
