// c07-12 · Welded — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0712({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-12 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(180deg, var(--vx-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-a-deep, oklch(0.5109 0.1542 259.81)) 100%)", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "6px", "height": "6px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "50%", "top": "50%", "transform": "translateY(-50%)", "left": "4px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "paddingLeft": "8px", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase font-extrabold" tw="uppercase font-extrabold" style={{ "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "fontWeight": "800", "textTransform": "uppercase", "letterSpacing": "0.05em" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-m-a-55-000000, oklch(0.3427 0.1034 259.81))", "opacity": "0.6" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-a-on, oklch(1.0000 0.0000 89.88))", "fontWeight": "800", "paddingRight": "8px" }}>
        {value}

      </span>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "6px", "height": "6px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "50%", "top": "50%", "transform": "translateY(-50%)", "right": "4px", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
