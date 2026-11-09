// c33-10 · Staircase — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3310({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-10 staircase inline-flex items-start whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-start whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0" }}>
      <span className="step step-label flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "24px", "padding": "0 10px", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="step step-value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "24px", "marginTop": "9px", "marginLeft": "5px", "padding": "0 12px", "background": "var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81))", "color": "var(--vx-v-a-on, oklch(1.0000 0.0000 89.88))", "borderRadius": "6px", "fontSize": "12px", "fontWeight": "800", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
