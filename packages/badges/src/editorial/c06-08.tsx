// c06-08 · Marginal — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0608({ label, value }: BadgeProps) {
  return (
    <div className="badge c06-08 inline-flex flex-col items-start gap-[2px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start gap-[2px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "2px", "padding": "8px 0 8px 12px", "borderLeft": "3px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "maxWidth": "326px" }}>
      <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "10px", "textTransform": "uppercase", "letterSpacing": "0.15em", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value italic text-[16px] font-bold font-serif" tw="italic text-[16px] font-bold font-serif" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "16px", "fontWeight": "700", "fontFamily": "'Instrument Serif', serif", "fontStyle": "italic", "whiteSpace": "normal" }}>
        {value}

      </span>

    </div>
  );
}
