// c16-10 · Unit — Minimal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1610({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c16-10 inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "baseline", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "gap": "4px" }}>
      <span className="label font-medium" tw="font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontWeight": "500" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>
      <span className="unit text-[10px] font-medium" tw="text-[10px] font-medium" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "fontSize": "10px", "fontWeight": "500", "marginLeft": "1px" }}>
        {extra}

      </span>

    </div>
  );
}
