// c12-05 · Typewriter — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1205({ label, value }: BadgeProps) {
  return (
    <div className="badge c12-05 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace" }}>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="typed-stage inline-block overflow-hidden align-middle whitespace-nowrap" tw="inline-block overflow-hidden align-middle whitespace-nowrap" style={{ "display": "inline-block", "overflow": "hidden", "whiteSpace": "nowrap", "verticalAlign": "middle", "width": "86px" }}>
        <span className="typed overflow-hidden whitespace-nowrap text-[11px] font-semibold" tw="overflow-hidden whitespace-nowrap text-[11px] font-semibold" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "600", "fontSize": "11px", "borderRight": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "paddingRight": "2px", "animation": "typing 3s steps(12) infinite, blink 0.8s step-end infinite", "overflow": "hidden", "whiteSpace": "nowrap", "width": "0" }} data-anim="typing">
          {value}

        </span>
      </span>

    </div>
  );
}
