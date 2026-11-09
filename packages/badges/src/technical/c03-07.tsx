// c03-07 · Spec tab — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0307({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-07 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[2px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[2px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "2px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "4px 4px 0 var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
      <span className="absolute text-[9px] font-bold font-mono" tw="absolute text-[9px] font-bold font-mono" style={{ "position": "absolute", "top": "-8px", "left": "8px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 4px", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "9px", "fontWeight": "700", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "letterSpacing": "0.1em", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true">
        {"SPEC"}

      </span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px] font-mono" tw="text-[11px] font-mono" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-b-200, oklch(0.8170 0.0486 258.66))" }}>
        {"·"}

      </span>
      <span className="value text-[11px] font-bold font-mono" tw="text-[11px] font-bold font-mono" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
