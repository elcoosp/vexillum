// c02-02 · Overlapping seal — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0202({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-02 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px 0 22px", "gap": "8px", "position": "relative", "boxShadow": "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="icon-circle inline-flex items-center justify-center absolute" tw="inline-flex items-center justify-center absolute" style={{ "position": "absolute", "left": "-10px", "top": "50%", "transform": "translateY(-50%)", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "linear-gradient(135deg, var(--vx-ok, oklch(0.6959 0.1491 162.48)) 0%, var(--vx-ok, oklch(0.6959 0.1491 162.48)) 100%)", "border": "2px solid var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "boxShadow": "0 2px 4px var(--vx-m-ok-30-t, oklch(0.6959 0.1491 162.48 / 0.30))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
