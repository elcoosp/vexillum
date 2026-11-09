// c09-04 · Dollar prompt — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0904({ label }: BadgeProps) {
  return (
    <div className="badge c09-04 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-d-surface, oklch(0.2971 0.0301 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "border": "1px solid var(--vx-d-border, oklch(0.4355 0.0700 259.75))" }}>
      <span className="dollar text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "fontSize": "11px" }}>
        <span style={{ "marginRight": "4px", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true">
          {"$"}

        </span>

      </span>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-d-text, oklch(0.8971 0.0240 264.06))", "fontSize": "11px" }}>
        {label}

      </span>

    </div>
  );
}
