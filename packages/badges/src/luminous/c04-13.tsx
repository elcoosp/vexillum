// c04-13 · Glow stick — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0413({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-13 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(90deg, var(--vx-a, oklch(0.6959 0.1491 162.48)) 0%, var(--vx-a-bright, oklch(0.7459 0.1491 162.48)) 100%)", "borderRadius": "999px", "padding": "0 12px", "gap": "8px", "boxShadow": "0 0 16px var(--vx-m-a-50-t, oklch(0.6959 0.1491 162.48 / 0.50)), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-deep, oklch(0.4175 0.0895 162.48))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-a-deep, oklch(0.4175 0.0895 162.48))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-a, oklch(0.6959 0.1491 162.48))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-a-deep, oklch(0.5219 0.1118 162.48))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
