// c33-02 · Offset duo — Stacked
// Authored for the stacked collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3302({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c33-02 offset-duo inline-flex items-stretch whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0" }}>
      <span className="lift flex" style={{ "display": "flex", "paddingBottom": "7px" }}>
        <span className="label flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 12px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "borderRadius": "6px", "fontSize": "11.5px", "fontWeight": "700" }}>
          {label}
        </span>
      </span>
      <span className="drop flex" style={{ "display": "flex", "paddingTop": "7px", "marginLeft": "4px" }}>
        <span className="value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 12px", "background": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-v-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "fontSize": "12px", "fontWeight": "800", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))" }}>
          {value}
        </span>
      </span>
    </div>
  );
}
