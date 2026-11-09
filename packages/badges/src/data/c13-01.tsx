// c13-01 · Metric card — Data
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1301({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c13-01 inline-flex flex-col items-center gap-[4px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" tw="inline-flex flex-col items-center gap-[4px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "padding": "10px 14px", "gap": "4px", "boxShadow": "0 1px 3px rgba(0,0,0,0.04)", "minWidth": "100px", "maxWidth": "326px" }}>
      <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "fontSize": "10px", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "textTransform": "uppercase", "letterSpacing": "0.08em", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value text-[18px] font-bold" tw="text-[18px] font-bold" style={{ "fontSize": "18px", "fontWeight": "700", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "letterSpacing": "-0.02em", "whiteSpace": "normal" }}>
        {value}

      </span>
      <span className="trend up text-[10px] font-semibold" tw="text-[10px] font-semibold" style={{ "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "fontSize": "10px", "fontWeight": "600" }}>
        {extra}

      </span>

    </div>
  );
}
