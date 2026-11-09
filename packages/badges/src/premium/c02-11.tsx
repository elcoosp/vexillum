// c02-11 · Diagonal divide — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0211({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-11 inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "borderRadius": "6px", "overflow": "hidden", "boxShadow": "0 2px 6px rgba(0,0,0,0.08)" }}>
      <div className="label inline-flex items-center gap-[6px] relative" tw="inline-flex items-center gap-[6px] relative" style={{ "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "padding": "0 16px 0 10px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%", "clipPath": "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)", "marginRight": "-6px", "position": "relative", "zIndex": "2" }}>
        {icon ?? <IconSlot />}
        <span>
          {label}

        </span>

      </div>
      <div className="value inline-flex items-center gap-[6px] font-bold" tw="inline-flex items-center gap-[6px] font-bold" style={{ "background": "linear-gradient(135deg, var(--vx-v-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81)) 100%)", "color": "var(--vx-v-a-on, oklch(1.0000 0.0000 89.88))", "padding": "0 10px 0 16px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%", "fontWeight": "700" }}>
        <span>
          {value}

        </span>

      </div>

    </div>
  );
}
