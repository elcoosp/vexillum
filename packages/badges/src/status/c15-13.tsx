// c15-13 · Info tint — Status
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1513({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c15-13 inline-flex items-center gap-[6px] overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[6px] overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "border": "1px solid var(--vx-a-soft, oklch(0.9058 0.0470 259.81))", "borderRadius": "4px", "padding": "0 10px 0 0", "gap": "6px", "overflow": "hidden" }}>
      <div className="icon inline-flex items-center justify-center" tw="inline-flex items-center justify-center" style={{ "width": "26px", "height": "100%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "marginRight": "8px" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-a-ink, oklch(0.3427 0.1034 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
