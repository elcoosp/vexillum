// c04-06 · Laser scan — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0406({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-06 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-d-bg, oklch(0.2492 0.0546 265.16))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "0", "top": "50%", "transform": "translateY(-50%)", "width": "100%", "height": "1px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "boxShadow": "0 0 8px var(--vx-m-a-80-t, oklch(0.6231 0.1880 259.81 / 0.80)), 0 0 16px var(--vx-m-a-40-t, oklch(0.6231 0.1880 259.81 / 0.40))", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
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
