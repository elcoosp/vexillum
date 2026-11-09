// c07-03 · Riveted — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0703({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-03 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "4px", "height": "4px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "50%", "top": "50%", "transform": "translateY(-50%)", "left": "4px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase font-bold" tw="uppercase font-bold" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em", "paddingLeft": "6px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800", "paddingRight": "6px" }}>
        {value}

      </span>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "4px", "height": "4px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "50%", "top": "50%", "transform": "translateY(-50%)", "right": "4px", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
