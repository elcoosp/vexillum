// c12-15 · Clock hand — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1215({ label }: BadgeProps) {
  return (
    <div className="badge c12-15 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="clock relative" tw="relative" style={{ "width": "14px", "height": "14px", "border": "1.5px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "50%", "position": "relative" }}>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "calc(50% - 0.75px)", "top": "calc(50% - 4.5px)", "width": "1.5px", "height": "4.5px", "borderRadius": "1px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "transformOrigin": "bottom", "animation": "vx-tick 2s linear infinite" }} data-pseudo="before" aria-hidden="true"></span>
        <span className="hour absolute" tw="absolute" style={{ "position": "absolute", "left": "calc(50% - 0.75px)", "top": "calc(50% - 3px)", "width": "1.5px", "height": "3px", "borderRadius": "1px", "background": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "transformOrigin": "bottom", "animation": "vx-tick 8s linear infinite" }} aria-hidden="true"></span>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "calc(50% - 1.25px)", "top": "calc(50% - 1.25px)", "width": "2.5px", "height": "2.5px", "borderRadius": "50%", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }} data-pseudo="after" aria-hidden="true"></span>

      </div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>

    </div>
  );
}
