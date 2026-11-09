// c06-02 · Italic serif — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0602({ label, value }: BadgeProps) {
  return (
    <div className="badge c06-02 inline-flex flex-col items-start gap-[2px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start gap-[2px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "2px", "maxWidth": "326px" }}>
      <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "fontSize": "10px", "textTransform": "uppercase", "letterSpacing": "0.15em", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value italic text-[20px] font-bold font-serif" tw="italic text-[20px] font-bold font-serif" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "20px", "fontWeight": "700", "letterSpacing": "-0.02em", "fontFamily": "'Instrument Serif', serif", "fontStyle": "italic", "whiteSpace": "normal" }}>
        {value}

      </span>
      <div className="line" style={{ "width": "100%", "height": "1px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}></div>

    </div>
  );
}
