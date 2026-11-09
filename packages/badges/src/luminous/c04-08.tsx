// c04-08 · Starfield — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0408({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-08 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(180deg, var(--vx-d-bg, oklch(0.2492 0.0546 265.16)) 0%, var(--vx-m-a-10-0b0b12, oklch(0.2002 0.0322 282.04)) 100%)", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute text-[10px]" tw="absolute text-[10px]" style={{ "position": "absolute", "right": "8px", "top": "4px", "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "fontSize": "10px", "textShadow": "0 0 6px var(--vx-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80))", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true">
        {"✦"}

      </span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))" }}>
        {"·"}

      </span>
      <span className="value relative font-bold" tw="relative font-bold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
