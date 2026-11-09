// c06-14 · Fade bar — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0614({ label, value }: BadgeProps) {
  return (
    <div className="badge c06-14 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "gap": "8px", "padding": "8px 0" }}>
      <div className="margin" style={{ "width": "2px", "height": "24px", "background": "linear-gradient(180deg, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 0%, transparent 100%)" }}></div>
      <div className="content flex flex-col gap-[2px]" tw="flex flex-col gap-[2px]" style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
        <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "10px", "textTransform": "uppercase", "letterSpacing": "0.1em", "fontWeight": "600" }}>
          {label}

        </span>
        <span className="value text-[14px] font-bold" tw="text-[14px] font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "14px", "fontWeight": "700" }}>
          {value}

        </span>

      </div>

    </div>
  );
}
