// c14-13 · Discord — Social
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1413({ label, icon }: BadgeProps) {
  return (
    <div className="badge c14-13 inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(135deg, var(--vx-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-a, oklch(0.6231 0.1880 259.81)) 100%)", "borderRadius": "8px", "padding": "0 12px", "gap": "6px", "boxShadow": "0 2px 8px var(--vx-m-a-40-t, oklch(0.6231 0.1880 259.81 / 0.40)), inset 0 1px 0 rgba(255,255,255,0.25)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700", "textShadow": "0 1px 2px rgba(0,0,0,0.2)" }}>
        {label}

      </span>

    </div>
  );
}
