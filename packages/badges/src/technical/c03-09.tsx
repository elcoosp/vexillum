// c03-09 · Tolerance — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0309({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-09 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "boxShadow": "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px] font-mono" tw="text-[11px] font-mono" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="tolerance inline-flex items-center gap-[4px] text-[11px] font-bold font-mono" tw="inline-flex items-center gap-[4px] text-[11px] font-bold font-mono" style={{ "display": "inline-flex", "alignItems": "center", "gap": "4px", "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "700" }}>
        <span style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true">
          {"±"}

        </span>
        {value}

      </span>

    </div>
  );
}
