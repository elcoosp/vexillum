// c01-16 · Unit counter — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0116({ label, value }: BadgeProps) {
  return (
    <div className="badge c01-16 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "boxShadow": "0 1px 2px rgba(0,0,0,0.02)" }}>
      <span className="label font-medium" tw="font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontWeight": "500" }}>
        {label}

      </span>
      <div className="sep shrink-0" tw="shrink-0" style={{ "width": "1px", "height": "12px", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "flexShrink": "0" }}></div>
      <span className="value tabular-nums font-bold" tw="tabular-nums font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "fontVariantNumeric": "tabular-nums" }}>
        {value}

      </span>

    </div>
  );
}
