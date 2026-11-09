// c13-15 · Area chart — Data
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1315({ label, value }: BadgeProps) {
  return (
    <div className="badge c13-15 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="area overflow-hidden relative" tw="overflow-hidden relative" style={{ "width": "60px", "height": "14px", "position": "relative", "overflow": "hidden" }}>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "linear-gradient(180deg, var(--vx-m-a-30-t, oklch(0.6231 0.1880 259.81 / 0.30)), var(--vx-m-a-5-t, oklch(0.6231 0.1880 259.81 / 0.05)))", "clipPath": "polygon(0 80%, 20% 60%, 40% 70%, 60% 30%, 80% 40%, 100% 20%, 100% 100%, 0 100%)", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
        <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "none", "borderTop": "1.5px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "clipPath": "polygon(0 80%, 20% 60%, 40% 70%, 60% 30%, 80% 40%, 100% 20%, 100% 21%, 80% 41%, 60% 31%, 40% 71%, 20% 61%, 0 81%)", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

      </div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
