// c22-04 · double rule — Ledger
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2204({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c22-04 dbl t-led inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[7px] leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[7px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "border": "1px solid var(--vx-b-200, oklch(0.8200 0.0180 252.00))", "borderRadius": "7px", "minWidth": "150px" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-t-muted, oklch(0.4600 0.0200 252.00))", "paddingLeft": "11px", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="ld whitespace-nowrap" tw="whitespace-nowrap" style={{ "boxSizing": "border-box", "margin": "0 8px", "padding": "0", "flex": "1", "height": "4px", "borderBottom": "0", "backgroundImage": "linear-gradient(var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 0, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 1px, transparent 1px, transparent 3px, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 3px, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 4px)", "backgroundPosition": "0% 0%", "backgroundRepeat": "no-repeat", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "whiteSpace": "nowrap" }}></span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 11px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "paddingRight": "11px", "marginLeft": "auto", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
