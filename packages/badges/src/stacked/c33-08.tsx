// c33-08 · Layer bars — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3308({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c33-08 layer-bars inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "overflow": "hidden" }}>
      <span className="bar-top icon flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "4px 10px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))" }}>
        {icon ?? <IconSlot />}
        <span className="label" style={{ "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.10em", "textTransform": "uppercase" }}>
          {label}
        </span>
      </span>
      <span className="value flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "5px 10px", "background": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontSize": "12.5px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
