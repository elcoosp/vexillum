// c26-14 · quad ink — Contour
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2614({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c26-14 c4 ink t-con inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0 3px", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "border": "1px solid var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "borderRadius": "4px", "boxShadow": "inset 0 0 0 1px var(--vx-s-white, #ffffff), inset 0 0 0 2px var(--vx-m-a-38-w, oklch(0.8568 0.0739 259.82)), inset 0 0 0 3px var(--vx-s-white, #ffffff), inset 0 0 0 4px var(--vx-a-soft, oklch(0.9100 0.0450 252.00)), inset 0 0 0 5px var(--vx-s-white, #ffffff), inset 0 0 0 6px var(--vx-m-a-38-w, oklch(0.8568 0.0739 259.82))" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 6px 0 9px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-[2px]" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-[2px]" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-s-white, #ffffff)", "fontVariantNumeric": "tabular-nums", "height": "calc(100% - 6px)", "borderRadius": "2px", "background": "var(--vx-v-t-heading, oklch(0.2400 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
