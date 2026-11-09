// c08-16 · Breeze — Organic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0816({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c08-16 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "30px", "background": "linear-gradient(135deg, var(--vx-m-ok-15-s-white, oklch(0.9480 0.0256 245.21)) 0%, var(--vx-m-ok-20-s-white, oklch(0.9332 0.0329 240.34)) 100%)", "borderRadius": "50% 50% 50% 50% / 60% 40% 60% 40%", "padding": "0 20px", "gap": "8px", "boxShadow": "0 2px 8px var(--vx-m-ok-15-t, oklch(0.6959 0.1491 162.48 / 0.15))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-m-ok-60-000000, oklch(0.4175 0.0895 162.48))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-m-ok-60-000000, oklch(0.4175 0.0895 162.48))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-m-ok-60-000000, oklch(0.4175 0.0895 162.48))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
