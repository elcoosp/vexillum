// c18-10 · duo border — Frame
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1810({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c18-10 duo t-fr inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[5px] leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[5px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0 3px", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "border": "2px solid var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "borderRadius": "5px", "borderColor": "var(--vx-a, oklch(0.5400 0.1600 252.00)) var(--vx-t-heading, oklch(0.2400 0.0200 252.00)) var(--vx-t-heading, oklch(0.2400 0.0200 252.00)) var(--vx-a, oklch(0.5400 0.1600 252.00))" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 6px 0 8px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-[3px]" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold rounded-[3px]" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 10px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "height": "calc(100% - 6px)", "borderRadius": "3px", "background": "var(--vx-v-a-soft, oklch(0.9100 0.0450 252.00))", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
