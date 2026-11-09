// c14-16 · Instagram — Social
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1416({ label, icon }: BadgeProps) {
  return (
    <div className="badge c14-16 inline-flex items-center whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" style={{ "boxSizing": "border-box", "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(135deg, var(--vx-warn, oklch(0.7686 0.1647 70.08)) 0%, var(--vx-err, oklch(0.6368 0.2078 25.33)) 50%, var(--vx-a, oklch(0.6231 0.1880 259.81)) 100%)", "borderRadius": "8px", "padding": "1px", "boxShadow": "0 2px 6px rgba(225, 29, 72, 0.30)" }}>
      <div className="inner inline-flex items-center rounded-[7px]" tw="inline-flex items-center rounded-[7px]" style={{ "height": "100%", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "7px", "padding": "0 10px 0 4px", "gap": "6px", "display": "inline-flex", "alignItems": "center" }}>
        <div className="icon inline-flex items-center justify-center rounded-[6px]" tw="inline-flex items-center justify-center rounded-[6px]" style={{ "width": "18px", "height": "18px", "borderRadius": "6px", "background": "linear-gradient(135deg, var(--vx-warn, oklch(0.7686 0.1647 70.08)) 0%, var(--vx-err, oklch(0.6368 0.2078 25.33)) 50%, var(--vx-a, oklch(0.6231 0.1880 259.81)) 100%)", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "flexShrink": "0" }}>
          {icon ?? <IconSlot />}
        </div>
        <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
