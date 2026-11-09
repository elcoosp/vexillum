// c34-05 · Rate meter — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3405({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c34-05 rate inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "overflow": "hidden" }}>
      <span className="label flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "0 10px", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "fontSize": "11px", "fontWeight": "600" }}>
        <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "flex": "none" }}>
          {icon ?? <IconSlot />}
        </span>
        <span>
          {label}
        </span>
      </span>
      <span className="value flex items-center gap-[3px]" style={{ "display": "flex", "alignItems": "center", "gap": "3px", "padding": "0 10px", "fontSize": "13px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
        <span className="unit" style={{ "fontSize": "9.5px", "fontWeight": "600", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>/s</span>
      </span>
    </div>
  );
}
