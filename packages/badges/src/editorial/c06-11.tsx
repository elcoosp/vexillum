// c06-11 · Superscript — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0611({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c06-11 inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-baseline gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "baseline", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "gap": "4px", "padding": "8px 0" }}>
      <span className="label text-[11px] font-medium" tw="text-[11px] font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px", "fontWeight": "500" }}>
        {label}

      </span>
      <span className="value text-[14px] font-bold" tw="text-[14px] font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "14px", "fontWeight": "700" }}>
        {value}

      </span>
      <span className="super text-[9px] font-bold" tw="text-[9px] font-bold" style={{ "fontSize": "9px", "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "fontWeight": "700", "verticalAlign": "super" }}>
        {extra}

      </span>

    </div>
  );
}
