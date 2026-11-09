// c33-14 · Overlap tabs — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3314({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-14 overlap-tabs relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "position": "relative", "display": "inline-flex", "flexDirection": "column", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "9px 0 0 0" }}>
      <span className="tab-value value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 12px", "background": "var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81))", "color": "var(--vx-v-a-on, oklch(1.0000 0.0000 89.88))", "borderRadius": "6px", "fontSize": "11.5px", "fontWeight": "800" }}>
        {value}
      </span>
      <span className="tab-label label flex items-center" style={{ "position": "absolute", "top": "0", "left": "6px", "display": "flex", "alignItems": "center", "height": "18px", "padding": "0 8px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "5px", "fontSize": "8.5px", "fontWeight": "800", "letterSpacing": "0.07em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "boxShadow": "0 1px 2px rgba(15,23,42,0.08)" }}>
        {label}
      </span>
    </div>
  );
}
