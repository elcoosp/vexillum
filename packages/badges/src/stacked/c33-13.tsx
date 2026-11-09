// c33-13 · Inset panels — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3313({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-13 inset-panels inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "borderRadius": "8px", "padding": "4px" }}>
      <span className="panel label flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "3px 8px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "borderRadius": "3px" }}>
        <span style={{ "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.10em", "textTransform": "uppercase" }}>
          {label}
        </span>
      </span>
      <span className="panel value flex items-center" style={{ "display": "flex", "alignItems": "center", "margin": "3px 5px 0 5px", "padding": "3px 8px", "background": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-v-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "3px", "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {value}
      </span>
    </div>
  );
}
