// c34-07 · Progress stat — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3407({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-07 progress inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "gap": "5px", "padding": "6px 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "minWidth": "148px" }}>
      <span className="row flex items-center justify-between gap-[8px]" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px" }}>
        <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "13px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
      <span className="track" style={{ "position": "relative", "display": "block", "alignSelf": "stretch", "height": "4px", "borderRadius": "2px", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}>
        <span className="fill" style={{ "position": "absolute", "left": "0", "top": "0", "height": "4px", "width": "58px", "borderRadius": "2px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}></span>
      </span>
    </div>
  );
}
