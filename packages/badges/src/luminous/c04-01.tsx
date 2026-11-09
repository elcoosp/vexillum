// c04-01 · Neon tube — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0401({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-01 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-d-bg, oklch(0.2492 0.0546 265.16))", "border": "2px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "999px", "padding": "0 12px", "gap": "8px", "boxShadow": "0 0 12px var(--vx-m-a-50-t, oklch(0.6231 0.1880 259.81 / 0.50)), 0 0 24px var(--vx-m-a-30-t, oklch(0.6231 0.1880 259.81 / 0.30))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "filter": "drop-shadow(0 0 4px var(--vx-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80)))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
