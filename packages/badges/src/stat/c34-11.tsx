// c34-11 · Bracket stat — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3411({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-11 bracket inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "center", "gap": "5px", "padding": "4px 9px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "4px" }}>
      <span className="label" style={{ "fontSize": "10px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="bracket-open" style={{ "fontFamily": "'JetBrains Mono', ui-monospace, monospace", "fontSize": "12px", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>[</span>
      <span className="value" style={{ "fontFamily": "'JetBrains Mono', ui-monospace, monospace", "fontSize": "12.5px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
      <span className="bracket-close" style={{ "fontFamily": "'JetBrains Mono', ui-monospace, monospace", "fontSize": "12px", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>]</span>
    </div>
  );
}
