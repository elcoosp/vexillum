// c32-16 · flat · pill — Spark
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3216({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c32-16 pill t-spk inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "border": "1px solid var(--vx-b-200, oklch(0.8200 0.0180 252.00))", "borderRadius": "999px" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 5px 0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "whiteSpace": "nowrap" }}>
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 5px 0 4px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "whiteSpace": "nowrap" }}>
        {value}

      </span>
      <span className="cw flex items-center whitespace-nowrap" tw="flex items-center whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 10px 0 4px", "width": "58px", "display": "flex", "alignItems": "center", "color": "var(--vx-a, oklch(0.5400 0.1600 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}

      </span>

    </div>
  );
}
