// c15-10 · Success tint — Status
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1510({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c15-10 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-ok, oklch(0.6959 0.1491 162.48))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-m-ok-60-000000, oklch(0.4175 0.0895 162.48))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-m-ok-60-000000, oklch(0.4175 0.0895 162.48))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
