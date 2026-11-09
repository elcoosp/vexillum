// c16-04 · Mono — Minimal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1604({ label, value }: BadgeProps) {
  return (
    <div className="badge c16-04 inline-flex items-baseline gap-[4px] whitespace-nowrap text-[11px] font-semibold font-mono leading-none" tw="inline-flex items-baseline gap-[4px] whitespace-nowrap text-[11px] font-semibold font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "baseline", "fontSize": "11px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "gap": "4px", "fontFamily": "'JetBrains Mono', monospace" }}>
      <span className="label font-medium" tw="font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontWeight": "500" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
