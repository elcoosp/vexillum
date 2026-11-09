// c03-15 · Vernier — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0315({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-15 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[2px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[2px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "2px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "0 2px 4px rgba(0,0,0,0.08)" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "0", "right": "0", "bottom": "-6px", "height": "4px", "background": "repeating-linear-gradient(to right, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 0px, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 1px, transparent 1px, transparent 5px)", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px] font-mono" tw="text-[11px] font-mono" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-s-300, oklch(0.9171 0.0414 259.81))" }}>
        {"·"}

      </span>
      <span className="value text-[11px] font-bold font-mono" tw="text-[11px] font-bold font-mono" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
