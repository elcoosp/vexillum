// c33-05 · Card on card — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3305({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c33-05 card-on-card relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "position": "relative", "display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "12px 0 0 0" }}>
      <span className="body value" style={{ "display": "block", "background": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-v-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "13px 14px 6px", "fontSize": "15px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums", "boxShadow": "0 1px 3px rgba(15,23,42,0.08)" }}>
        {value}
      </span>
      <span className="head icon flex items-center gap-[5px]" style={{ "position": "absolute", "top": "0", "left": "8px", "display": "flex", "alignItems": "center", "gap": "5px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "borderRadius": "5px", "padding": "3px 8px", "fontSize": "8.5px", "fontWeight": "800", "letterSpacing": "0.08em", "textTransform": "uppercase", "boxShadow": "0 1px 2px rgba(15,23,42,0.20)" }}>
        {icon ?? <IconSlot />}
        <span>
          {label}
        </span>
      </span>
    </div>
  );
}
