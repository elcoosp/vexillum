// c04-12 · Light leak — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0412({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-12 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(135deg, var(--vx-m-warn-15-s-white, oklch(0.9589 0.0279 285.35)) 0%, var(--vx-m-warn-20-s-white, oklch(0.9477 0.0360 293.86)) 50%, var(--vx-warn, oklch(0.7686 0.1647 70.08)) 100%)", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "position": "relative", "overflow": "hidden", "boxShadow": "0 2px 8px var(--vx-m-warn-30-t, oklch(0.7686 0.1647 70.08 / 0.30)), inset 0 1px 0 rgba(255,255,255,0.4)" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "top": "-50%", "right": "-20%", "width": "100px", "height": "100px", "background": "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)", "borderRadius": "50%", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "color": "var(--vx-m-warn-60-000000, oklch(0.4612 0.0988 70.08))", "display": "inline-flex", "alignItems": "center", "height": "100%", "position": "relative", "zIndex": "1" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative" tw="relative" style={{ "color": "var(--vx-m-warn-60-000000, oklch(0.4612 0.0988 70.08))", "position": "relative", "zIndex": "1" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "position": "relative", "zIndex": "1" }}>
        {"·"}

      </span>
      <span className="value relative font-bold" tw="relative font-bold" style={{ "color": "var(--vx-v-m-warn-75-000000, oklch(0.5765 0.1235 70.08))", "fontWeight": "700", "position": "relative", "zIndex": "1" }}>
        {value}

      </span>

    </div>
  );
}
