// c15-12 · Danger tint — Status
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1512({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c15-12 inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-err, oklch(0.6368 0.2078 25.33))", "borderRadius": "999px", "padding": "0 10px 0 3px", "gap": "6px" }}>
      <div className="icon inline-flex items-center justify-center" tw="inline-flex items-center justify-center" style={{ "width": "20px", "height": "20px", "borderRadius": "50%", "background": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
