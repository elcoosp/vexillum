// c12-04 · Marquee — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1204({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c12-04 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "overflow": "hidden", "position": "relative", "fontFamily": "'JetBrains Mono', monospace" }}>
      <div className="marquee inline-flex gap-[24px] whitespace-nowrap text-[11px]" tw="inline-flex gap-[24px] whitespace-nowrap text-[11px]" style={{ "display": "inline-flex", "gap": "24px", "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "fontSize": "11px", "whiteSpace": "nowrap", "animation": "vx-marquee 8s linear infinite" }} data-anim="vx-marquee">
        <span>
          {label}

        </span>
        <span>
          {value}

        </span>
        <span>
          {extra}

        </span>
        <span>
          {"·"}

        </span>
        <span>
          {"npm i vexillum"}

        </span>
        <span>
          {"·"}

        </span>

      </div>

    </div>
  );
}
