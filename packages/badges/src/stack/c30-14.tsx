// c30-14 · value lg — Stack
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3014({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c30-14 t-stk inline-flex flex-col items-center overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex flex-col items-center overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "auto", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "flexDirection": "column", "border": "1px solid var(--vx-b-200, oklch(0.8200 0.0180 252.00))", "borderRadius": "4px", "overflow": "hidden" }}>
      <span className="top flex items-center justify-between gap-[14px] whitespace-nowrap" tw="flex items-center justify-between gap-[14px] whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "4px 12px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "14px", "width": "100%", "background": "var(--vx-s-white, #ffffff)", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        <span className="k whitespace-nowrap uppercase font-bold leading-none" tw="whitespace-nowrap uppercase font-bold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "fontWeight": "700", "fontSize": "8.5px", "lineHeight": "1", "letterSpacing": ".09em", "textTransform": "uppercase", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "whiteSpace": "nowrap" }}>
          {icon ?? <IconSlot />}
          {label}

        </span>
        <span className="u whitespace-nowrap text-[10px] font-medium" tw="whitespace-nowrap text-[10px] font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "fontSize": "10px", "fontWeight": "500", "color": "var(--vx-t-subtle, oklch(0.6400 0.0150 252.00))", "whiteSpace": "nowrap" }}>
          {value}

        </span>

      </span>
      <span className="bot flex items-center justify-between gap-[14px] whitespace-nowrap" tw="flex items-center justify-between gap-[14px] whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "4px 12px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "14px", "width": "100%", "background": "var(--vx-a-muted, oklch(0.9600 0.0180 252.00))", "borderTop": "1px solid var(--vx-b-200, oklch(0.8200 0.0180 252.00))", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "whiteSpace": "nowrap" }}>
        <span className="n whitespace-nowrap tabular-nums text-[18px] font-bold" tw="whitespace-nowrap tabular-nums text-[18px] font-bold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "fontSize": "18px", "fontWeight": "700", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "fontVariantNumeric": "tabular-nums", "whiteSpace": "nowrap" }}>
          {extra}

        </span>
        <span className="d whitespace-nowrap text-[10px] font-bold" tw="whitespace-nowrap text-[10px] font-bold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "fontSize": "10px", "fontWeight": "700", "color": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "whiteSpace": "nowrap" }}>
          {"rel"}

        </span>

      </span>

    </div>
  );
}
