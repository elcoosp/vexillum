// c08-12 · Flow — Organic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0812({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c08-12 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "30px", "background": "linear-gradient(135deg, var(--vx-s-200, oklch(0.9435 0.0282 259.81)) 0%, var(--vx-m-err-25-s-white, oklch(0.9036 0.0548 291.19)) 100%)", "borderRadius": "60% 40% 50% 50% / 50% 50% 40% 60%", "padding": "0 20px", "gap": "8px", "boxShadow": "0 2px 8px var(--vx-m-err-15-t, oklch(0.6368 0.2078 25.33 / 0.15))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
