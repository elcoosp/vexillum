import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Segmented control with a sliding thumb (interior.dev school): the active
 * pill GLIDES between tabs instead of blinking in place. The thumb is an
 * absolutely-positioned span measured from the active button's box, so the
 * buttons themselves never move — zero layout shift, spring easing, and the
 * whole thing collapses gracefully to the plain active style under
 * prefers-reduced-motion (the transition simply doesn't run).
 */
export function Tabs({ tabs, active, onChange, className, ariaLabel }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    // dataset scan instead of CSS.escape — jsdom has no global `CSS`
    const el = [...list.querySelectorAll<HTMLButtonElement>("button[data-tab-id]")].find(
      (b) => b.dataset.tabId === active,
    );
    if (!el) {
      setThumb(null);
      return;
    }
    setThumb({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  }, [active]);

  useEffect(() => {
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn("relative flex flex-wrap gap-1", className)}
    >
      {thumb && (
        <span
          aria-hidden
          className="absolute rounded-md bg-primary shadow-sm"
          style={{
            left: thumb.left,
            top: thumb.top,
            width: thumb.width,
            height: thumb.height,
            transition: "left 260ms var(--vx-spring), top 260ms var(--vx-spring), width 260ms var(--vx-spring), height 260ms var(--vx-spring)",
          }}
        />
      )}
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            data-tab-id={t.id}
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={cn(
              "vx-press relative z-10 rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-accent",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export interface MeterProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
  tone?: "auto" | "accent";
}

/** Quota meter with an honest tone: amber past 75%, red past 90%. */
export function Meter({ value, max, label, className, tone = "auto" }: MeterProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor =
    tone === "accent"
      ? "bg-accent"
      : pct > 90
        ? "bg-rose-500"
        : pct > 75
          ? "bg-amber-500"
          : "bg-emerald-500";
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono font-semibold">{pct}%</span>
        </div>
      )}
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label ?? "usage"}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
