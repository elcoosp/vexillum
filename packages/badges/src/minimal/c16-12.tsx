// c16-12 · Accent — Minimal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1612({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c16-12 inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "baseline", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "gap": "4px" }}>
      <span className="label font-medium" tw="font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontWeight": "500" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>
      <span className="accent text-[9px] font-bold" tw="text-[9px] font-bold" style={{ "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "fontSize": "9px", "fontWeight": "700", "verticalAlign": "super" }}>
        {extra}

      </span>

    </div>
  );
}
