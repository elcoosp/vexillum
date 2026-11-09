// c07-09 · Perforated — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0709({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-09 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "backgroundImage": "repeating-linear-gradient(90deg, transparent 0, transparent 3px, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 3px, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 4px)", "opacity": "0.1", "top": "3px", "right": "3px", "bottom": "3px", "left": "3px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative uppercase font-bold" tw="relative uppercase font-bold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {"·"}

      </span>
      <span className="value relative font-extrabold" tw="relative font-extrabold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}
