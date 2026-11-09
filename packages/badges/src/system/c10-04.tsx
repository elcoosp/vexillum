// c10-04 · Command palette — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1004({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c10-04 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "6px", "padding": "0 10px", "gap": "8px", "boxShadow": "0 1px 3px rgba(0,0,0,0.06)" }}>
      <span className="kbd inline-flex items-center justify-center text-[11px] font-semibold rounded-[4px] font-mono" tw="inline-flex items-center justify-center text-[11px] font-semibold rounded-[4px] font-mono" style={{ "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "minWidth": "20px", "height": "20px", "padding": "0 6px", "background": "var(--vx-s-50, oklch(0.9812 0.0094 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderBottomWidth": "2px", "borderRadius": "4px", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {value}

      </span>
      <span className="kbd inline-flex items-center justify-center text-[11px] font-semibold rounded-[4px] font-mono" tw="inline-flex items-center justify-center text-[11px] font-semibold rounded-[4px] font-mono" style={{ "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "minWidth": "20px", "height": "20px", "padding": "0 6px", "background": "var(--vx-s-50, oklch(0.9812 0.0094 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderBottomWidth": "2px", "borderRadius": "4px", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {extra}

      </span>
      <span className="label text-[12px]" tw="text-[12px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "12px" }}>
        {label}

      </span>

    </div>
  );
}
