// c04-04 · Aurora fill — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0404({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-04 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(135deg, var(--vx-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-a, oklch(0.6231 0.1880 259.81)) 25%, var(--vx-err, oklch(0.6368 0.2078 25.33)) 50%, var(--vx-warn, oklch(0.7686 0.1647 70.08)) 75%, var(--vx-ok, oklch(0.6959 0.1491 162.48)) 100%)", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "boxShadow": "0 4px 12px var(--vx-m-a-30-t, oklch(0.6231 0.1880 259.81 / 0.30)), inset 0 1px 0 rgba(255,255,255,0.3)", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "display": "inline-flex", "alignItems": "center", "height": "100%", "position": "relative", "zIndex": "1" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "opacity": "0.95" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "opacity": "0.5" }}>
        {"·"}

      </span>
      <span className="value relative font-bold" tw="relative font-bold" style={{ "position": "relative", "zIndex": "1", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
