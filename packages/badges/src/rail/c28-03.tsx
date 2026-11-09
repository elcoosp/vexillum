// c28-03 · ink rail — Rail
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2803({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c28-03 ink t-rail inline-flex flex-col items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[5px] leading-none" tw="inline-flex flex-col items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[5px] leading-none" style={{ "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "auto", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "flexDirection": "column", "border": "1px solid var(--vx-b-200, oklch(0.8200 0.0180 252.00))", "borderRadius": "5px", "overflow": "hidden" }}>
      <span className="rw flex items-center whitespace-nowrap" tw="flex items-center whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "display": "flex", "alignItems": "center", "height": "24px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 5px 0 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "whiteSpace": "nowrap" }}>
          {icon ?? <IconSlot />}
          {label}

        </span>
        <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px 0 5px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "whiteSpace": "nowrap" }}>
          {value}

        </span>

      </span>
      <span className="rl flex items-center justify-between gap-[12px] whitespace-nowrap font-semibold leading-none" tw="flex items-center justify-between gap-[12px] whitespace-nowrap font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "height": "15px", "borderTop": "1px solid var(--vx-b-200, oklch(0.8200 0.0180 252.00))", "background": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "fontWeight": "600", "fontSize": "8.5px", "lineHeight": "1", "letterSpacing": ".03em", "color": "var(--vx-s-white, #ffffff)", "whiteSpace": "nowrap" }}>
        <span className="x1 whitespace-nowrap" tw="whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "letterSpacing": ".03em", "color": "var(--vx-s-white, #ffffff)", "whiteSpace": "nowrap" }}>
          {extra}

        </span>
        <span className="x2 whitespace-nowrap" tw="whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "letterSpacing": ".03em", "color": "var(--vx-s-white, #ffffff)", "whiteSpace": "nowrap" }}>
          {"ok"}

        </span>

      </span>

    </div>
  );
}
