// c05-08 · Hatched — Brutalist
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0508({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c05-08 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "position": "relative" }}>
      <span className="absolute rounded-[4px]" tw="absolute rounded-[4px]" style={{ "position": "absolute", "backgroundImage": "repeating-linear-gradient(45deg, transparent 0, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)", "borderRadius": "4px", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative font-bold" tw="relative font-bold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-b-300, oklch(0.6820 0.0783 260.80))" }}>
        {"·"}

      </span>
      <span className="value relative font-extrabold" tw="relative font-extrabold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}
