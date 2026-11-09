// c31-12 · stacked chips — Float
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3112({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c31-12 t-flt vert inline-flex flex-col items-center gap-[3px] relative whitespace-nowrap text-[12px] font-semibold rounded-[9px] leading-none" tw="inline-flex flex-col items-center gap-[3px] relative whitespace-nowrap text-[12px] font-semibold rounded-[9px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "3px", "position": "relative", "height": "auto", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "maxWidth": "100%", "background": "var(--vx-a-muted, oklch(0.9600 0.0180 252.00))", "border": "1px solid var(--vx-b-100, oklch(0.9000 0.0120 252.00))", "borderRadius": "9px", "gap": "3px", "flexDirection": "column" }}>
      <span className="l label inline-flex items-center justify-between gap-[6px] whitespace-nowrap font-semibold rounded-[6px]" tw="inline-flex items-center justify-between gap-[6px] whitespace-nowrap font-semibold rounded-[6px]" style={{ "boxSizing": "border-box", "margin": "0", "padding": "5px 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "background": "var(--vx-a-on, #ffffff)", "borderRadius": "6px", "height": "auto", "boxShadow": "0 1px 2px rgb(16 24 40/.08), 0 0 0 1px var(--vx-m-t-heading-7-w, oklch(0.9468 0.0014 252.00))", "width": "100%", "justifyContent": "space-between", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center justify-between gap-[6px] whitespace-nowrap tabular-nums text-[13px] font-bold rounded-[6px]" tw="inline-flex items-center justify-between gap-[6px] whitespace-nowrap tabular-nums text-[13px] font-bold rounded-[6px]" style={{ "boxSizing": "border-box", "margin": "0", "padding": "5px 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "700", "color": "var(--vx-v-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "fontVariantNumeric": "tabular-nums", "background": "var(--vx-v-a-on, #ffffff)", "borderRadius": "6px", "height": "auto", "boxShadow": "0 1px 2px rgb(16 24 40/.08), 0 0 0 1px var(--vx-v-m-t-heading-7-w, oklch(0.9468 0.0014 252.00))", "width": "100%", "justifyContent": "space-between", "fontSize": "13px", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
