// c01-11 · Bracket frame — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0111({ label, value }: BadgeProps) {
  return (
    <div className="badge c01-11 inline-flex items-center gap-[6px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[6px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "4px", "padding": "0 8px", "gap": "6px", "position": "relative" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "3px", "height": "16px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "top": "50%", "transform": "translateY(-50%)", "left": "-1px", "borderRadius": "2px 0 0 2px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-s-300, oklch(0.9171 0.0414 259.81))" }}>
        {"|"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "3px", "height": "16px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "top": "50%", "transform": "translateY(-50%)", "right": "-1px", "borderRadius": "0 2px 2px 0", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
