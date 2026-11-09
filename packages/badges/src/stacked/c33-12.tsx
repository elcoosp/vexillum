// c33-12 · Totem — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3312({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c33-12 totem inline-flex flex-col items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "overflow": "hidden" }}>
      <span className="orb icon flex items-center justify-center" style={{ "display": "flex", "alignItems": "center", "justifyContent": "center", "width": "20px", "height": "20px", "borderRadius": "50%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "marginTop": "7px", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "marginTop": "3px", "fontSize": "8px", "fontWeight": "800", "letterSpacing": "0.12em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {label}
      </span>
      <span className="value" style={{ "alignSelf": "stretch", "textAlign": "center", "marginTop": "4px", "padding": "4px 12px 6px", "borderTop": "1px solid var(--vx-v-b-100, oklch(0.8819 0.0331 263.82))", "fontSize": "13px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
