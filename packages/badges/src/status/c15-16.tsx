// c15-16 · Dark neon — Status
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1516({ label, value }: BadgeProps) {
  return (
    <div className="badge c15-16 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="dot" style={{ "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "boxShadow": "0 0 8px var(--vx-m-ok-80-t, oklch(0.6959 0.1491 162.48 / 0.80))" }}></div>
      <span className="label" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
