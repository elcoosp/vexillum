// c05-04 · Double thick — Brutalist
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0504({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c05-04 inline-flex items-center gap-[6px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[6px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "30px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "3px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 10px", "gap": "6px", "position": "relative" }}>
      <span className="absolute rounded-[2px]" tw="absolute rounded-[2px]" style={{ "position": "absolute", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "2px", "pointerEvents": "none", "top": "3px", "right": "3px", "bottom": "3px", "left": "3px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase text-[11px] font-extrabold" tw="uppercase text-[11px] font-extrabold" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800", "textTransform": "uppercase", "letterSpacing": "0.05em", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}
