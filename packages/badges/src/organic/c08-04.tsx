// c08-04 · Squircle — Organic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0804({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c08-04 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "linear-gradient(135deg, var(--vx-a-muted, oklch(0.9623 0.0188 259.81)) 0%, var(--vx-a-soft, oklch(0.9058 0.0470 259.81)) 100%)", "borderRadius": "40% 60% 60% 40% / 50% 50% 50% 50%", "padding": "0 18px", "gap": "8px", "boxShadow": "0 2px 8px var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "fontWeight": "600" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-a-ink, oklch(0.3427 0.1034 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
