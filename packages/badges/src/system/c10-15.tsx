// c10-15 · Language share — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1015({ label, value }: BadgeProps) {
  return (
    <div className="badge c10-15 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 10px", "gap": "8px" }}>
      <span className="label text-[12px]" tw="text-[12px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "12px" }}>
        {label}

      </span>
      <div className="bar flex overflow-hidden rounded-[3px]" tw="flex overflow-hidden rounded-[3px]" style={{ "display": "flex", "width": "80px", "height": "6px", "borderRadius": "3px", "overflow": "hidden", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}>
        <span className="seg ts" style={{ "height": "100%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "flex": "82" }}></span>
        <span className="seg js" style={{ "height": "100%", "background": "#f7df1e", "flex": "12" }}></span>
        <span className="seg other" style={{ "height": "100%", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "flex": "6" }}></span>

      </div>
      <span className="pct tabular-nums text-[11px] font-bold" tw="tabular-nums text-[11px] font-bold" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "fontSize": "11px", "fontVariantNumeric": "tabular-nums" }}>
        {value}

      </span>

    </div>
  );
}
