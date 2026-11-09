// c06-07 · Numeral — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0607({ label, value }: BadgeProps) {
  return (
    <div className="badge c06-07 inline-flex items-baseline gap-[6px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-baseline gap-[6px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "baseline", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "gap": "6px", "padding": "8px 0" }}>
      <span className="numeral text-[32px] font-normal font-serif leading-none" tw="text-[32px] font-normal font-serif leading-none" style={{ "fontFamily": "'Instrument Serif', serif", "fontSize": "32px", "fontWeight": "400", "lineHeight": "1", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {"42"}

      </span>
      <div className="text flex flex-col gap-[2px]" tw="flex flex-col gap-[2px]" style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
        <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "10px", "textTransform": "uppercase", "letterSpacing": "0.1em", "fontWeight": "600" }}>
          {label}

        </span>
        <span className="value text-[12px] font-bold" tw="text-[12px] font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "12px", "fontWeight": "700" }}>
          {value}

        </span>

      </div>

    </div>
  );
}
