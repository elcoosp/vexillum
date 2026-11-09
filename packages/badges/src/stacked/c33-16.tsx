// c33-16 · Beads — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3316({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-16 beads inline-flex flex-col items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0" }}>
      <span className="bead label flex items-center gap-[5px]" style={{ "display": "flex", "alignItems": "center", "gap": "5px", "padding": "3px 10px", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px", "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="link" style={{ "width": "2px", "height": "5px", "background": "var(--vx-b-300, oklch(0.6820 0.0783 260.80))", "flex": "none" }}></span>
      <span className="bead value flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "4px 12px", "background": "var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81))", "color": "var(--vx-v-a-on, oklch(1.0000 0.0000 89.88))", "borderRadius": "999px", "fontSize": "12px", "fontWeight": "800", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
