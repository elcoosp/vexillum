// c33-09 · Carbon copy — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3309({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-09 carbon-copy relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "position": "relative", "display": "inline-flex", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "5px 5px 0 0" }}>
      <span className="copy" style={{ "position": "absolute", "top": "0", "left": "5px", "right": "0", "bottom": "0", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px" }}></span>
      <span className="face flex items-center" style={{ "position": "relative", "display": "flex", "alignItems": "center", "height": "24px", "padding": "0 10px", "gap": "8px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px" }}>
        <span className="label" style={{ "fontSize": "10.5px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>
  );
}
