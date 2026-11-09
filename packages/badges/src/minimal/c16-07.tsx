// c16-07 · Serif italic — Minimal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1607({ label, value }: BadgeProps) {
  return (
    <div className="badge c16-07 inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "baseline", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "gap": "4px" }}>
      <span className="label font-medium" tw="font-medium" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "fontWeight": "500" }}>
        {label}

      </span>
      <span className="value italic text-[16px] font-bold font-serif" tw="italic text-[16px] font-bold font-serif" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "fontFamily": "'Instrument Serif', serif", "fontSize": "16px", "fontStyle": "italic" }}>
        {value}

      </span>

    </div>
  );
}
