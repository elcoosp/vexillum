// c20-14 · outline tab — Tab
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2014({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c20-14 oh t-tab inline-flex flex-col items-start overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[7px] leading-none" tw="inline-flex flex-col items-start overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[7px] leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "auto", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "maxWidth": "100%", "flexDirection": "column", "background": "var(--vx-a-soft, oklch(0.9100 0.0450 252.00))", "borderRadius": "7px", "overflow": "hidden" }}>
      <span className="tb inline-flex items-center gap-[6px] whitespace-nowrap text-[11px] font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[11px] font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "3px 12px", "background": "var(--vx-a-on, #ffffff)", "color": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "borderRadius": "0 7px 0 0", "fontWeight": "600", "fontSize": "11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "boxShadow": "inset 0 0 0 1.5px var(--vx-a, oklch(0.5400 0.1600 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="vl flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "6px 13px 7px", "color": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "fontWeight": "600", "fontVariantNumeric": "tabular-nums", "display": "flex", "alignItems": "center", "gap": "6px", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
