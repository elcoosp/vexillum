// c33-03 · Soft stack — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3303({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-03 soft-stack inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "height": "28px", "padding": "0 12px", "gap": "8px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 1px rgba(15,23,42,0.04), 0 2px 4px rgba(15,23,42,0.06), 0 4px 9px rgba(15,23,42,0.09)" }}>
      <span className="label" style={{ "fontSize": "11.5px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="dot" style={{ "width": "3px", "height": "3px", "borderRadius": "50%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "flex": "none" }}></span>
      <span className="value" style={{ "fontSize": "12.5px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
