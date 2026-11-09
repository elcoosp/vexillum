// c15-11 · Warning tint — Status
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1511({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c15-11 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-m-warn-15-s-white, oklch(0.9589 0.0279 285.35))", "border": "1px solid var(--vx-warn, oklch(0.7686 0.1647 70.08))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-m-warn-60-000000, oklch(0.4612 0.0988 70.08))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value">
        {value}

      </span>

    </div>
  );
}
