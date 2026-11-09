// c10-16 · Language dot — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1016({ label, value }: BadgeProps) {
  return (
    <div className="badge c10-16 inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 10px", "gap": "6px" }}>
      <div className="dot ts" style={{ "width": "10px", "height": "10px", "borderRadius": "50%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}></div>
      <span className="label text-[12px] font-medium" tw="text-[12px] font-medium" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "12px", "fontWeight": "500" }}>
        {label}

      </span>
      <span className="pct tabular-nums text-[11px]" tw="tabular-nums text-[11px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px", "fontVariantNumeric": "tabular-nums" }}>
        {value}

      </span>

    </div>
  );
}
