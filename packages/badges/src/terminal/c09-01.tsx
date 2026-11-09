// c09-01 · Classic shell — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0901({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-01 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-d-surface, oklch(0.2971 0.0301 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "border": "1px solid var(--vx-d-border, oklch(0.4355 0.0700 259.75))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-d-text-mut, oklch(0.6955 0.0529 261.02))", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep shrink-0" tw="shrink-0" style={{ "width": "1px", "height": "12px", "background": "var(--vx-d-border, oklch(0.4355 0.0700 259.75))", "flexShrink": "0" }}></div>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))", "fontSize": "11px" }}>
        {value}

      </span>

    </div>
  );
}
