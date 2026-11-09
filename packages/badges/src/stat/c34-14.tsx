// c34-14 · Spark bars — Stat
// Authored for the stat collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C3414({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c34-14 spark inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", "display": "inline-flex", "flexDirection": "column", "gap": "4px", "padding": "6px 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "var(--vx-d-bg, oklch(0.2492 0.0546 265.16))", "border": "1px solid var(--vx-d-border, oklch(0.4355 0.0700 259.75))", "borderRadius": "8px" }}>
      <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.10em", "textTransform": "uppercase", "color": "var(--vx-d-text-mut, oklch(0.6955 0.0529 261.02))" }}>
        {label}
      </span>
      <span className="row flex items-end gap-[8px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "8px" }}>
        <span className="value" style={{ "fontSize": "14px", "fontWeight": "800", "lineHeight": "1", "fontFamily": "'JetBrains Mono', ui-monospace, monospace", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
        <span className="bars flex items-end gap-[2px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "2px" }}>
          <span style={{ "display": "block", "width": "3px", "height": "5px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "9px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "13px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "7px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "15px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "11px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "8px", "borderRadius": "1px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}></span>
        </span>
      </span>
    </div>
  );
}
