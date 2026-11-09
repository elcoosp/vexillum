// c04-03 · Fiber optic — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0403({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-03 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-d-bg, oklch(0.2492 0.0546 265.16))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "0", "right": "0", "bottom": "0", "height": "2px", "background": "linear-gradient(90deg, var(--vx-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-a-bright, oklch(0.7738 0.1128 259.81)) 100%)", "boxShadow": "0 0 8px var(--vx-m-a-60-t, oklch(0.6231 0.1880 259.81 / 0.60))", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-d-text, oklch(0.8971 0.0240 264.06))" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-d-border, oklch(0.4355 0.0700 259.75))" }}>
        {"·"}

      </span>
      <span className="value relative font-bold" tw="relative font-bold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
