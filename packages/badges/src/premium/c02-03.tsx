// c02-03 · Double rule — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0203({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-03 inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "padding": "3px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "position": "relative" }}>
      <span className="absolute rounded-[2px]" tw="absolute rounded-[2px]" style={{ "position": "absolute", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "2px", "pointerEvents": "none", "top": "3px", "right": "3px", "bottom": "3px", "left": "3px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="inner inline-flex items-center gap-[8px]" tw="inline-flex items-center gap-[8px]" style={{ "height": "100%", "padding": "0 10px", "display": "inline-flex", "alignItems": "center", "gap": "8px" }}>
        <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
          {icon ?? <IconSlot />}

        </div>
        <span className="label uppercase text-[11px]" tw="uppercase text-[11px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px", "textTransform": "uppercase", "letterSpacing": "0.1em" }}>
          {label}

        </span>
        <span className="sep" style={{ "color": "var(--vx-b-200, oklch(0.8170 0.0486 258.66))" }}>
          {"·"}

        </span>
        <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
          {value}

        </span>

      </div>

    </div>
  );
}
