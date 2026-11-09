// c09-03 · CRT scanline — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0903({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-03 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-d-bg, oklch(0.2492 0.0546 265.16))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "border": "1px solid var(--vx-d-border, oklch(0.4355 0.0700 259.75))", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative text-[11px]" tw="relative text-[11px]" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-d-text-mut, oklch(0.6955 0.0529 261.02))", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-d-border, oklch(0.4355 0.0700 259.75))" }}></div>
      <span className="value relative text-[11px]" tw="relative text-[11px]" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))", "fontSize": "11px" }}>
        {value}

      </span>

    </div>
  );
}
