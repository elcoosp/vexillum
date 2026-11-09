// c34-04 · Rank medal — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3404({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-04 rank inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "gap": "8px", "padding": "4px 12px 4px 4px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px" }}>
      <span className="medal flex items-center justify-center" style={{ "display": "flex", "alignItems": "center", "justifyContent": "center", "width": "24px", "height": "24px", "borderRadius": "50%", "background": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "10px", "fontWeight": "800", "flex": "none" }}>
        #1
      </span>
      <span className="col" style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
        <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "13px", "fontWeight": "800", "lineHeight": "1", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>
  );
}
