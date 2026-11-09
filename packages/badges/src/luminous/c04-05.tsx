// c04-05 · Bioluminescent — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0405({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-05 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "border": "1px solid var(--vx-ok, oklch(0.6959 0.1491 162.48))", "borderRadius": "999px", "padding": "0 12px", "gap": "8px", "boxShadow": "0 0 16px var(--vx-m-ok-40-t, oklch(0.6959 0.1491 162.48 / 0.40)), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "display": "inline-flex", "alignItems": "center", "height": "100%", "filter": "drop-shadow(0 0 4px var(--vx-m-ok-60-t, oklch(0.6959 0.1491 162.48 / 0.60)))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-m-ok-60-000000, oklch(0.4175 0.0895 162.48))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
