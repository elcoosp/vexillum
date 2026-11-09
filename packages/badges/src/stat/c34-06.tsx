// c34-06 · Mini bars — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3406({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-06 mini-bars inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "gap": "4px", "padding": "6px 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px" }}>
      <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {label}
      </span>
      <span className="row flex items-end gap-[7px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "7px" }}>
        <span className="value" style={{ "fontSize": "14px", "fontWeight": "800", "lineHeight": "1", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
        <span className="bars flex items-end gap-[2px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "2px" }}>
          <span style={{ "display": "block", "width": "3px", "height": "6px", "borderRadius": "1px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "10px", "borderRadius": "1px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "14px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "8px", "borderRadius": "1px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "12px", "borderRadius": "1px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}></span>
        </span>
      </span>
    </div>
  );
}
