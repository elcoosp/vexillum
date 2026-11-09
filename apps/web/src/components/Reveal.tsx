import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — scroll-triggered entrance for landing-page sections.
 *
 * An IntersectionObserver flips `.is-visible` the first time the element
 * enters the viewport (once, then the observer disconnects). The motion
 * itself lives in CSS (`.vx-reveal`: opacity + translateY only — no layout
 * work), and `prefers-reduced-motion` shows the content immediately.
 * Before the observer runs the element starts hidden, so there is no
 * flash-then-jump.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Stagger delay in ms — siblings can cascade without extra observers. */
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // no observer (old engine / test env) → show immediately
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("vx-reveal", visible && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
