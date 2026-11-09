// c28-14 · tinted divider — Rail
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2814({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c28-14 t-rail tint inline-flex flex-col items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[5px] leading-none" tw="inline-flex flex-col items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[5px] leading-none" style={{ "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "auto", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "flexDirection": "column", "border": "1px solid var(--vx-m-a-38-w, oklch(0.8568 0.0739 259.82))", "borderRadius": "5px", "overflow": "hidden" }}>
      <span className="rw flex items-center whitespace-nowrap" tw="flex items-center whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "display": "flex", "alignItems": "center", "height": "24px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 5px 0 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "whiteSpace": "nowrap" }}>
          {icon ?? <IconSlot />}
          {label}

        </span>
        <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px 0 5px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "whiteSpace": "nowrap" }}>
          {value}

        </span>

      </span>
      <span className="rl flex items-center justify-between gap-[12px] whitespace-nowrap font-semibold leading-none" tw="flex items-center justify-between gap-[12px] whitespace-nowrap font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "height": "15px", "borderTop": "1px solid var(--vx-m-a-38-w, oklch(0.8568 0.0739 259.82))", "background": "var(--vx-a-muted, oklch(0.9600 0.0180 252.00))", "fontWeight": "600", "fontSize": "8.5px", "lineHeight": "1", "letterSpacing": ".03em", "color": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "whiteSpace": "nowrap" }}>
        <span className="x1 whitespace-nowrap" tw="whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "letterSpacing": ".03em", "color": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "whiteSpace": "nowrap" }}>
          {extra}

        </span>
        <span className="x2 whitespace-nowrap" tw="whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "letterSpacing": ".03em", "color": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "whiteSpace": "nowrap" }}>
          {"·"}

        </span>

      </span>

    </div>
  );
}
