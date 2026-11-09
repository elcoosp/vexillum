// c33-07 · Pill pile — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3307({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-07 pill-pile relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "position": "relative", "display": "inline-flex", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0 0 8px 0" }}>
      <span className="pile pile-2" style={{ "position": "absolute", "top": "8px", "left": "4px", "right": "4px", "bottom": "0", "background": "var(--vx-a-muted, oklch(0.9600 0.0180 252.00))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px" }}></span>
      <span className="pile pile-1" style={{ "position": "absolute", "top": "4px", "left": "2px", "right": "2px", "bottom": "0", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px" }}></span>
      <span className="pill flex items-center" style={{ "position": "relative", "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 14px", "gap": "8px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px", "boxShadow": "0 1px 2px rgba(15,23,42,0.05)" }}>
        <span className="label" style={{ "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
          {label}
        </span>
        <span className="sep" style={{ "width": "1px", "height": "12px", "background": "var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "flex": "none" }}></span>
        <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>
  );
}
