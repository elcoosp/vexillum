// c34-09 · Delta down — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3409({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c34-09 delta-down inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0 12px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "borderRadius": "999px" }}>
      <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "fontSize": "11px", "fontWeight": "700", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
        {label}
      </span>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
