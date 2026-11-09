// c33-01 · Paper stack — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3301({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c33-01 stacked relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "position": "relative", "display": "inline-flex", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0 8px 8px 0" }}>
      <span className="ghost ghost-2" style={{ "position": "absolute", "top": "8px", "left": "8px", "right": "0", "bottom": "0", "background": "var(--vx-a-muted, oklch(0.9600 0.0180 252.00))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px" }}></span>
      <span className="ghost ghost-1" style={{ "position": "absolute", "top": "4px", "left": "4px", "right": "0", "bottom": "0", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px" }}></span>
      <span className="face flex items-center" style={{ "position": "relative", "display": "flex", "alignItems": "center", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "boxShadow": "0 1px 2px rgba(15,23,42,0.06)" }}>
        <span className="label icon flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "height": "100%", "padding": "0 9px 0 10px", "borderRight": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "fontWeight": "600" }}>
          {icon ?? <IconSlot />}
          <span>
            {label}
          </span>
        </span>
        <span className="value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "100%", "padding": "0 12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))" }}>
          <span>
            {value}
          </span>
        </span>
      </span>
    </div>
  );
}
