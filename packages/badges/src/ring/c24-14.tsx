// c24-14 · hollow square — Ring
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2414({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c24-14 hollow sq t-ring inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "28px", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "maxWidth": "100%", "borderRadius": "999px", "background": "var(--vx-a-bright, oklch(0.7400 0.1200 252.00))", "outline": "1.5px solid var(--vx-a, oklch(0.5400 0.1600 252.00))", "outlineOffset": "3px" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 5px 0 14px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-a-on, #ffffff)", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-[4px]" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-[4px]" style={{ "boxSizing": "border-box", "margin": "0 3px", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "height": "calc(100% - 6px)", "borderRadius": "4px", "background": "var(--vx-v-a-on, #ffffff)", "boxShadow": "inset 0 0 0 1.5px var(--vx-v-a, oklch(0.5400 0.1600 252.00))", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
