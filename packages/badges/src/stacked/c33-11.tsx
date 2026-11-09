// c33-11 · Stack list — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3311({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c33-11 stack-list inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "overflow": "hidden" }}>
      <span className="row icon flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "3px 9px", "background": "var(--vx-s-100, oklch(0.9661 0.0169 259.81))", "borderLeft": "3px solid var(--vx-a, oklch(0.6231 0.1880 259.81))" }}>
        {icon ?? <IconSlot />}
        <span className="label" style={{ "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.07em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
          {label}
        </span>
      </span>
      <span className="value" style={{ "display": "block", "padding": "4px 9px", "borderTop": "1px solid var(--vx-v-b-100, oklch(0.8819 0.0331 263.82))", "borderLeft": "3px solid var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81))", "fontSize": "12.5px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
