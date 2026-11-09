// c06-10 · Italic value — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0610({ label, value }: BadgeProps) {
  return (
    <div className="badge c06-10 inline-flex items-baseline gap-[6px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-baseline gap-[6px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "baseline", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "gap": "6px", "padding": "8px 0" }}>
      <span className="label text-[11px] font-medium" tw="text-[11px] font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px", "fontWeight": "500" }}>
        {label}

      </span>
      <span className="value italic text-[16px] font-bold font-serif" tw="italic text-[16px] font-bold font-serif" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "16px", "fontWeight": "700", "fontFamily": "'Instrument Serif', serif", "fontStyle": "italic" }}>
        {value}

      </span>

    </div>
  );
}
