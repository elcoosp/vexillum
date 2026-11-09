// c10-07 · Semicircle gauge — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1007({ label }: BadgeProps) {
  return (
    <div className="badge c10-07 inline-flex flex-col items-center gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-center gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "4px", "maxWidth": "326px" }}>
      <div className="gauge overflow-hidden relative" tw="overflow-hidden relative" style={{ "width": "60px", "height": "30px", "position": "relative", "overflow": "hidden" }}>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "border": "6px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderBottom": "none", "borderRadius": "60px 60px 0 0", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "6px", "right": "6px", "top": "6px", "height": "18px", "border": "6px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderBottom": "none", "borderRadius": "60px 60px 0 0", "clipPath": "polygon(0 0, 70% 0, 70% 100%, 0 100%)", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

      </div>
      <span className="score text-[12px] font-bold" tw="text-[12px] font-bold" style={{ "fontSize": "12px", "fontWeight": "700", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {label}

      </span>

    </div>
  );
}
