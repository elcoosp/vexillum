// c06-16 · Headline — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0616({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c06-16 inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "4px", "padding": "8px 0", "maxWidth": "326px" }}>
      <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "10px", "textTransform": "uppercase", "letterSpacing": "0.15em", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value text-[24px] font-extrabold leading-none" tw="text-[24px] font-extrabold leading-none" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "24px", "fontWeight": "800", "letterSpacing": "-0.03em", "lineHeight": "1", "whiteSpace": "normal" }}>
        {value}

      </span>
      <span className="sub text-[11px] font-medium" tw="text-[11px] font-medium" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "fontSize": "11px", "fontWeight": "500" }}>
        {extra}

      </span>

    </div>
  );
}
