// c12-11 · Step rail — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1211({ label }: BadgeProps) {
  return (
    <div className="badge c12-11 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="rail flex items-center gap-[4px]" tw="flex items-center gap-[4px]" style={{ "display": "flex", "gap": "4px", "alignItems": "center" }}>
        <span className="step done" style={{ "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))" }}></span>
        <span className="step done" style={{ "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))" }}></span>
        <span className="step active" style={{ "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "animation": "stepPulse 1.5s ease-in-out infinite" }} data-anim="stepPulse"></span>
        <span className="step" style={{ "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}></span>
        <span className="step" style={{ "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}></span>

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px" }}>
        {label}

      </span>

    </div>
  );
}
