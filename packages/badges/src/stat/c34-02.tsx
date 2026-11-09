// c34-02 · Trend pill — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3402({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c34-02 trend-pill inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px", "overflow": "hidden" }}>
      <span className="brand icon flex items-center gap-[5px]" style={{ "display": "flex", "alignItems": "center", "gap": "5px", "padding": "0 10px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))" }}>
        {icon ?? <IconSlot />}
        <span className="label" style={{ "fontSize": "10.5px", "fontWeight": "700" }}>
          {label}
        </span>
      </span>
      <span className="value flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "0 11px", "background": "var(--vx-v-s-50, oklch(0.9812 0.0094 259.81))" }}>
        <span style={{ "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
        <span className="extra" style={{ "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "999px", "padding": "2px 6px", "fontSize": "9px", "fontWeight": "700" }}>
          {extra}
        </span>
      </span>
    </div>
  );
}
