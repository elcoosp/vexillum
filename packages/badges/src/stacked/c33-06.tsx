// c33-06 · Index tab — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3306({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-06 index-tab inline-flex flex-col items-start whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0" }}>
      <span className="tab label" style={{ "display": "block", "padding": "4px 12px 5px", "background": "var(--vx-a-muted, oklch(0.9600 0.0180 252.00))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderBottom": "0", "borderRadius": "6px 6px 0 0", "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.10em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="drawer value flex items-center" style={{ "display": "flex", "alignItems": "center", "background": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-v-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "0 6px 6px 6px", "padding": "6px 14px", "fontSize": "12.5px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "boxShadow": "0 1px 2px rgba(15,23,42,0.05)" }}>
        {value}
      </span>
    </div>
  );
}
