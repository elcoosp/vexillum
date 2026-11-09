// c09-05 · Pink accent — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0905({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-05 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-d-text-mut, oklch(0.6955 0.0529 261.02))", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep" style={{ "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}></div>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-err, oklch(0.6368 0.2078 25.33))", "fontSize": "11px" }}>
        {value}

      </span>

    </div>
  );
}
