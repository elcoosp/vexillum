// c34-03 · Odometer — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3403({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-03 odometer inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "gap": "3px", "padding": "6px 12px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-d-bg, oklch(0.2492 0.0546 265.16))", "border": "1px solid var(--vx-d-border, oklch(0.4355 0.0700 259.75))", "borderRadius": "8px" }}>
      <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.10em", "textTransform": "uppercase", "color": "var(--vx-d-text-mut, oklch(0.6955 0.0529 261.02))" }}>
        {label}
      </span>
      <span className="value" style={{ "fontSize": "16px", "fontWeight": "800", "lineHeight": "1", "fontFamily": "'JetBrains Mono', ui-monospace, monospace", "letterSpacing": "-0.02em", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
