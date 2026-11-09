// c07-15 · Brushed metal — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0715({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-15 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-metal-4, oklch(0.4430 0.0747 259.76))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "repeating-linear-gradient(90deg, transparent 0, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%", "position": "relative", "zIndex": "1" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative uppercase font-bold" tw="relative uppercase font-bold" style={{ "color": "var(--vx-d-text, oklch(0.8971 0.0240 264.06))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em", "position": "relative", "zIndex": "1" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "color": "var(--vx-b-300, oklch(0.6820 0.0783 260.80))", "position": "relative", "zIndex": "1" }}>
        {"·"}

      </span>
      <span className="value relative font-extrabold" tw="relative font-extrabold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "800", "position": "relative", "zIndex": "1" }}>
        {value}

      </span>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "linear-gradient(90deg, var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15)) 0%, transparent 50%, var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15)) 100%)", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
