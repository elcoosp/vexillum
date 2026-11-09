// c24-12 · dashed ink — Ring
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2412({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c24-12 dash t-ring white inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "borderRadius": "999px", "background": "var(--vx-s-white, #ffffff)", "outline": "1.5px dashed var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "outlineOffset": "3px" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 5px 0 14px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-full" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-full" style={{ "boxSizing": "border-box", "margin": "0 3px", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-s-white, #ffffff)", "fontVariantNumeric": "tabular-nums", "height": "calc(100% - 6px)", "borderRadius": "999px", "background": "var(--vx-v-t-heading, oklch(0.2400 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
