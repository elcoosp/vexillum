// c08-06 · Pebble — Organic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0806({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c08-06 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "30px", "background": "linear-gradient(135deg, var(--vx-m-warn-15-s-white, oklch(0.9589 0.0279 285.35)) 0%, var(--vx-m-warn-20-s-white, oklch(0.9477 0.0360 293.86)) 100%)", "borderRadius": "60% 40% 60% 40% / 50% 50% 50% 50%", "padding": "0 20px", "gap": "8px", "boxShadow": "0 2px 8px var(--vx-m-warn-15-t, oklch(0.7686 0.1647 70.08 / 0.15))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-m-warn-60-000000, oklch(0.4612 0.0988 70.08))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-m-warn-60-000000, oklch(0.4612 0.0988 70.08))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
