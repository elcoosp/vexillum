// c02-13 · Offset frame — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0213({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-13 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "0 1px 3px rgba(0,0,0,0.04)" }}>
      <span className="absolute rounded-[8px]" tw="absolute rounded-[8px]" style={{ "position": "absolute", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "pointerEvents": "none", "top": "-2px", "right": "-2px", "bottom": "-2px", "left": "-2px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
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
      <span className="absolute rounded-[10px]" tw="absolute rounded-[10px]" style={{ "position": "absolute", "border": "1px solid var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "borderRadius": "10px", "pointerEvents": "none", "top": "-5px", "right": "-5px", "bottom": "-5px", "left": "-5px", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
