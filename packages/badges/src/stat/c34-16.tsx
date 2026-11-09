// c34-16 · Receipt total — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3416({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-16 receipt inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "26px", "padding": "0 12px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px" }}>
      <span className="label" style={{ "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="leader" style={{ "flex": "1 1 auto", "minWidth": "14px", "height": "1px", "alignSelf": "center", "background": "repeating-linear-gradient(90deg, var(--vx-b-100, oklch(0.8819 0.0331 263.82)) 0 2px, transparent 2px 5px)" }}></span>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
