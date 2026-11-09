// c02-10 · Brushed metal — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0210({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-10 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(180deg, var(--vx-s-50, oklch(0.9812 0.0094 259.81)) 0%, var(--vx-s-200, oklch(0.9435 0.0282 259.81)) 100%)", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-s-300, oklch(0.9171 0.0414 259.81))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "textShadow": "0 1px 0 rgba(255,255,255,0.6)" }}>
        {value}

      </span>

    </div>
  );
}
