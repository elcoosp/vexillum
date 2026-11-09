// c07-01 · Warning stripe — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0701({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-01 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "overflow": "hidden", "boxShadow": "0 2px 4px rgba(0,0,0,0.15)" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "repeating-linear-gradient(45deg, transparent 0, transparent 8px, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 8px, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 12px)", "opacity": "0.18", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative uppercase font-extrabold" tw="relative uppercase font-extrabold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "fontWeight": "800", "textTransform": "uppercase", "letterSpacing": "0.05em" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-m-a-55-000000, oklch(0.3427 0.1034 259.81))", "opacity": "0.7" }}>
        {"·"}

      </span>
      <span className="value relative font-extrabold" tw="relative font-extrabold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-a-on, oklch(1.0000 0.0000 89.88))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}
