// c25-03 · pale cap — Cap
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2503({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c25-03 pale t-cap inline-flex items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" tw="inline-flex items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" style={{ "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "borderRadius": "8px", "boxShadow": "0 1px 2px rgb(16 24 40/.10), 0 0 0 1px var(--vx-b-100, oklch(0.9000 0.0120 252.00))", "overflow": "hidden" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "background": "var(--vx-a-bright, oklch(0.7400 0.1200 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 13px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
