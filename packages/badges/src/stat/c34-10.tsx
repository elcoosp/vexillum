// c34-10 · Stat chip — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3410({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-10 chip inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "22px", "padding": "0 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "borderRadius": "6px" }}>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
      <span className="dot" style={{ "width": "3px", "height": "3px", "borderRadius": "50%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "flex": "none" }}></span>
      <span className="label" style={{ "fontSize": "10px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
    </div>
  );
}
