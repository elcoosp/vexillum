// c03-05 · Ruler edge — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0305({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-05 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-m-a-12-s-white, oklch(0.9482 0.0259 259.81))", "border": "1px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "0", "right": "0", "bottom": "0", "height": "8px", "background": "repeating-linear-gradient(to right, var(--vx-a-deep, oklch(0.5109 0.1542 259.81)) 0px, var(--vx-a-deep, oklch(0.5109 0.1542 259.81)) 1px, transparent 1px, transparent 10px)", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px] font-mono" tw="text-[11px] font-mono" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))" }}>
        {"·"}

      </span>
      <span className="value text-[11px] font-bold font-mono" tw="text-[11px] font-bold font-mono" style={{ "color": "var(--vx-v-a-ink, oklch(0.3427 0.1034 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}
