// c26-11 · triple pill — Contour
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2611({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c26-11 c3 pill t-con inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0 3px", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "border": "1px solid var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "borderRadius": "999px", "boxShadow": "inset 0 0 0 1px var(--vx-s-white, #ffffff), inset 0 0 0 2px var(--vx-a-bright, oklch(0.7400 0.1200 252.00)), inset 0 0 0 3px var(--vx-s-white, #ffffff), inset 0 0 0 4px var(--vx-m-a-38-w, oklch(0.8568 0.0739 259.82))" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 6px 0 9px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-full" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-full" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-on, #ffffff)", "fontVariantNumeric": "tabular-nums", "height": "calc(100% - 6px)", "borderRadius": "999px", "background": "var(--vx-v-a, oklch(0.5400 0.1600 252.00))", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
