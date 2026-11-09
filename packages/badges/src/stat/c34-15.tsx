// c34-15 · Unit capsule — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3415({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c34-15 unit-capsule inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0 4px 0 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px" }}>
      <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
      <span className="unit" style={{ "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "borderRadius": "999px", "padding": "3px 6px", "fontSize": "8.5px", "fontWeight": "700", "flex": "none" }}>
        ms
      </span>
    </div>
  );
}
