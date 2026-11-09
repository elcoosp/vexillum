// c04-16 · Light sweep — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0416({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-16 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "0 2px 6px rgba(0,0,0,0.06)" }}>
      <span className="absolute rounded-[6px]" tw="absolute rounded-[6px]" style={{ "position": "absolute", "borderRadius": "6px", "background": "linear-gradient(90deg, transparent 0%, var(--vx-m-a-10-t, oklch(0.6231 0.1880 259.81 / 0.10)) 50%, transparent 100%)", "animation": "sweep 2s ease-in-out infinite", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%", "position": "relative", "zIndex": "1" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative" tw="relative" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "position": "relative", "zIndex": "1" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "position": "relative", "zIndex": "1" }}>
        {"·"}

      </span>
      <span className="value relative font-bold" tw="relative font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "position": "relative", "zIndex": "1" }}>
        {value}

      </span>

    </div>
  );
}
