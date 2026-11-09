// c12-08 · Orbit — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1208({ label, value }: BadgeProps) {
  return (
    <div className="badge c12-08 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="orbit relative" tw="relative" style={{ "width": "14px", "height": "14px", "position": "relative" }}>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "border": "1.5px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "50%", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "top": "-2px", "left": "50%", "width": "4px", "height": "4px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "50%", "transform": "translateX(-50%)", "animation": "orbit 2s linear infinite", "transformOrigin": "50% 9px", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

      </div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
