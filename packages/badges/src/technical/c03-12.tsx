// c03-12 · Tolerance band — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0312({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-12 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "overflow": "hidden", "boxShadow": "0 1px 3px rgba(0,0,0,0.04)" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "0", "top": "0", "bottom": "0", "width": "4px", "background": "linear-gradient(180deg, var(--vx-ok, oklch(0.6959 0.1491 162.48)) 0%, var(--vx-ok, oklch(0.6959 0.1491 162.48)) 33%, var(--vx-warn, oklch(0.7686 0.1647 70.08)) 33%, var(--vx-warn, oklch(0.7686 0.1647 70.08)) 66%, var(--vx-err, oklch(0.6368 0.2078 25.33)) 66%, var(--vx-err, oklch(0.6368 0.2078 25.33)) 100%)", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px" }}>
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
