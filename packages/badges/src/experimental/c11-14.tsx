// c11-14 · Corner notification — Experimental
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1114({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c11-14 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "position": "relative" }}>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>
      <span className="notif inline-flex items-center justify-center absolute text-[10px] font-bold rounded-full" tw="inline-flex items-center justify-center absolute text-[10px] font-bold rounded-full" style={{ "position": "absolute", "top": "-6px", "right": "-6px", "minWidth": "18px", "height": "18px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "999px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "fontSize": "10px", "fontWeight": "700", "padding": "0 5px", "border": "2px solid var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
        {extra}

      </span>

    </div>
  );
}
