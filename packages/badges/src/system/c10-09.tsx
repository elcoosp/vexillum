// c10-09 · Star rating — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1009({ label, value }: BadgeProps) {
  return (
    <div className="badge c10-09 inline-flex items-center gap-[4px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[4px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 10px", "gap": "4px" }}>
      <span className="star inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center" }}>
        {label}

      </span>
      <span className="star inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center" }}>
        {"★"}

      </span>
      <span className="star inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center" }}>
        {"★"}

      </span>
      <span className="star inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center" }}>
        {"★"}

      </span>
      <span className="star empty inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "display": "inline-flex", "alignItems": "center" }}>
        {"★"}

      </span>
      <span className="value text-[12px] font-bold" tw="text-[12px] font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "fontSize": "12px", "marginLeft": "4px" }}>
        {value}

      </span>

    </div>
  );
}
