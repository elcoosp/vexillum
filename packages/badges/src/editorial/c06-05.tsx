// c06-05 · Italic accent — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0605({ label, value }: BadgeProps) {
  return (
    <div className="badge c06-05 inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "4px", "maxWidth": "326px" }}>
      <span className="label italic text-[11px] font-serif" tw="italic text-[11px] font-serif" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px", "fontFamily": "'Instrument Serif', serif", "fontStyle": "italic" }}>
        {label}

      </span>
      <span className="value text-[16px] font-bold" tw="text-[16px] font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "16px", "fontWeight": "700", "letterSpacing": "-0.01em", "whiteSpace": "normal" }}>
        {value}

      </span>
      <div className="line" style={{ "width": "40px", "height": "1px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}></div>

    </div>
  );
}
