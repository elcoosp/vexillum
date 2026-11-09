/**
 * BadgeFrame — the presentation contract for rendered badges.
 *
 * The API renders every badge inside an 18 px transparent pad (the server's
 * `DEFAULT_PAD_PX`): shadows, glows and overhanging decorations (the seal's
 * 14 px hang, offset stacks) stay visible, and the badge never touches the
 * bitmap edge. The live preview shows exactly the same presentation.
 *
 * Oversized badges fit instead of scrolling: the frame measures the badge's
 * layout box (`offsetWidth`/`offsetHeight`, both immune to zoom) against the
 * room available inside the pad and applies a CSS `zoom` factor when the
 * badge exceeds its card in either dimension. Zoom re-rasterizes at the
 * reduced size (no transform blur), keeps the layout box honest (no
 * scrollbar, no dead gap), and leaves CSS animations running untouched.
 * Badges that already fit render at exact 1:1 — the preview stays
 * pixel-faithful to the API bytes. The height ratio no-ops while the frame
 * is auto-sized; it engages only when a parent bounds the frame (the
 * playground's `max-h` preview box), so tall badges scale down instead of
 * clipping. `overflow-hidden` is only a guard: every registry decoration
 * fits inside the 18 px pad budget, the same budget the server clips at.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BadgeFrameProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  ariaLabel?: string;
  /** Inline styles for the frame (e.g. the dark-mode preview surface). */
  style?: CSSProperties;
}

/**
 * Transparent room (px, every side) around the badge — mirrors the server's
 * `DEFAULT_PAD_PX` so the preview presents the badge exactly like the API
 * bytes do, and no decoration (max overhang ≈ 16 px) can touch the edge.
 */
export const BADGE_PAD_PX = 18;

export function BadgeFrame({ children, className, innerClassName, ariaLabel, style }: BadgeFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || typeof ResizeObserver === "undefined") return;

    // `offsetWidth`/`offsetHeight` read the badge's own-coordinate layout
    // box: neither changes when we zoom the element, so re-measuring can
    // never feed back on itself. (ResizeObserver batches deliveries per
    // frame.)
    const measure = () => {
      const naturalW = inner.offsetWidth;
      const naturalH = inner.offsetHeight;
      const availW = frame.clientWidth - BADGE_PAD_PX * 2;
      const availH = frame.clientHeight - BADGE_PAD_PX * 2;
      if (!naturalW || !availW) return;
      // Two-dimensional fit: an auto-sized frame's clientHeight tracks its
      // content (pad + badge), so the height ratio is exactly 1 and no-ops;
      // it only shrinks the zoom when a parent actually bounds the frame's
      // height (the playground's max-h preview box). A frame or badge that
      // reports no height at all (jsdom, display:none) is width-fitted only.
      const heightBounded = naturalH > 0 && availH > 0;
      const next = heightBounded
        ? Math.min(availW / naturalW, availH / naturalH, 1)
        : Math.min(availW / naturalW, 1);
      const clamped = Math.max(next, 0.05);
      setZoom((prev) => (Math.abs(prev - clamped) > 0.001 ? clamped : prev));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    ro.observe(inner);
    measure();
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      data-vx-frame="fit"
      aria-label={ariaLabel}
      style={{ padding: `${BADGE_PAD_PX}px`, ...style }}
      className={cn("flex w-full justify-center overflow-hidden rounded-md", className)}
    >
      <div ref={innerRef} data-vx-fit className={cn("w-fit shrink-0", innerClassName)} style={{ zoom }}>
        {children}
      </div>
    </div>
  );
}
