// c01-03 · Unified pill — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0103({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c01-03 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "999px", "padding": "0 12px 0 8px", "gap": "8px", "boxShadow": "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-medium" tw="font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontWeight": "500" }}>
        {label}

      </span>
      <div className="sep shrink-0" tw="shrink-0" style={{ "width": "1px", "height": "12px", "background": "var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "flexShrink": "0" }}></div>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-strong, oklch(0.2596 0.0505 264.08))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
