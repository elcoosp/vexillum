// c15-05 · Glow ring — Status
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1505({ label, value }: BadgeProps) {
  return (
    <div className="badge c15-05 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="ring" style={{ "width": "12px", "height": "12px", "borderRadius": "50%", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "boxShadow": "0 0 0 2px var(--vx-s-white, oklch(0.9925 0.0038 259.81)), 0 0 0 3px var(--vx-ok, oklch(0.6959 0.1491 162.48)), 0 0 8px var(--vx-m-ok-40-t, oklch(0.6959 0.1491 162.48 / 0.40))" }}></div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
