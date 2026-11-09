// c12-09 · Delta ticker — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1209({ label, value }: BadgeProps) {
  return (
    <div className="badge c12-09 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace" }}>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="delta up text-[11px] font-bold" tw="text-[11px] font-bold" style={{ "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "fontWeight": "700", "fontSize": "11px" }}>
        <span style={{ "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true">
          {"↑ "}

        </span>
        {value}

      </span>

    </div>
  );
}
