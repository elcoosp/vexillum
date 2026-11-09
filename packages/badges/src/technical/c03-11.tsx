// c03-11 · Schematic nodes — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0311({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-11 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "0 1px 3px rgba(0,0,0,0.04)" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "4px", "height": "4px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "50%", "left": "-2px", "top": "50%", "transform": "translateY(-50%)", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px] font-mono" tw="text-[11px] font-mono" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}>
        {"·"}

      </span>
      <span className="value text-[11px] font-bold font-mono" tw="text-[11px] font-bold font-mono" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "700" }}>
        {value}

      </span>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "4px", "height": "4px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "50%", "right": "-2px", "top": "50%", "transform": "translateY(-50%)", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
