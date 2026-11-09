// c07-10 · Diamond plate — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0710({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-10 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-metal-4, oklch(0.4430 0.0747 259.76))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "backgroundImage": "linear-gradient(45deg, var(--vx-metal-3, oklch(0.5669 0.0596 263.36)) 25%, transparent 25%, transparent 75%, var(--vx-metal-3, oklch(0.5669 0.0596 263.36)) 75%), linear-gradient(45deg, var(--vx-metal-3, oklch(0.5669 0.0596 263.36)) 25%, transparent 25%, transparent 75%, var(--vx-metal-3, oklch(0.5669 0.0596 263.36)) 75%)", "backgroundSize": "4px 4px", "backgroundPosition": "0 0, 2px 2px", "opacity": "0.5", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%", "position": "relative", "zIndex": "1" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative uppercase font-bold" tw="relative uppercase font-bold" style={{ "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em", "position": "relative", "zIndex": "1" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "color": "var(--vx-metal-2, oklch(0.7001 0.0445 261.10))", "position": "relative", "zIndex": "1" }}>
        {"·"}

      </span>
      <span className="value relative font-extrabold" tw="relative font-extrabold" style={{ "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))", "fontWeight": "800", "position": "relative", "zIndex": "1" }}>
        {value}

      </span>

    </div>
  );
}
