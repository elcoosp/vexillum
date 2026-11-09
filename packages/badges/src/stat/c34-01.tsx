// c34-01 · KPI delta — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3401({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c34-01 kpi inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "gap": "8px", "padding": "5px 10px 5px 8px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "boxShadow": "0 1px 2px rgba(15,23,42,0.05)" }}>
      <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="col" style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
        <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "13.5px", "fontWeight": "800", "lineHeight": "1", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
      <span className="extra delta" style={{ "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "999px", "padding": "3px 7px", "fontSize": "9.5px", "fontWeight": "700", "flex": "none" }}>
        {extra}
      </span>
    </div>
  );
}
