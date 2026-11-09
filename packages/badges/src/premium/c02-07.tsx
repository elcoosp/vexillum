// c02-07 · Folded ribbon — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0207({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-07 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(180deg, var(--vx-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-a-deep, oklch(0.5109 0.1542 259.81)) 100%)", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "padding": "0 14px", "gap": "8px", "position": "relative", "margin": "0 8px", "boxShadow": "0 2px 4px rgba(0,0,0,0.15)" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "top": "0", "width": "8px", "height": "100%", "background": "inherit", "left": "-8px", "clipPath": "polygon(100% 0, 100% 100%, 0 50%)", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-medium" tw="font-medium" style={{ "fontWeight": "500", "opacity": "0.9" }}>
        {label}

      </span>
      <span className="sep" style={{ "opacity": "0.5" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "fontWeight": "700" }}>
        {value}

      </span>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "top": "0", "width": "8px", "height": "100%", "background": "inherit", "right": "-8px", "clipPath": "polygon(0 0, 0 100%, 100% 50%)", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
