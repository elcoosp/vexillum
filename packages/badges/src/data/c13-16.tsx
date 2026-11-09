// c13-16 · Table row — Data
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1316({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c13-16 inline-flex flex-col items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" tw="inline-flex flex-col items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "padding": "10px 14px", "gap": "6px", "boxShadow": "0 1px 3px rgba(0,0,0,0.04)", "minWidth": "140px", "maxWidth": "326px" }}>
      <div className="row flex items-center justify-between text-[11px]" tw="flex items-center justify-between text-[11px]" style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "center", "fontSize": "11px" }}>
        <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
          {label}

        </span>
        <span className="value tabular-nums font-bold" tw="tabular-nums font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "fontVariantNumeric": "tabular-nums", "whiteSpace": "normal" }}>
          {value}

        </span>

      </div>
      <div className="divider" style={{ "height": "1px", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}></div>
      <div className="row flex items-center justify-between text-[11px]" tw="flex items-center justify-between text-[11px]" style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "center", "fontSize": "11px" }}>
        <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
          {extra}

        </span>
        <span className="value tabular-nums font-bold" tw="tabular-nums font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "fontVariantNumeric": "tabular-nums" }}>
          {"18 KB"}

        </span>

      </div>

    </div>
  );
}
