// c19-13 · mid head seam — Capsule
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1913({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c19-13 hs t-caps inline-flex items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "borderRadius": "999px", "overflow": "hidden" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 13px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "background": "var(--vx-m-a-38-w, oklch(0.8568 0.0739 259.82))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 13px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-on, #ffffff)", "fontVariantNumeric": "tabular-nums", "background": "var(--vx-v-a, oklch(0.5400 0.1600 252.00))", "boxShadow": "inset 1px 0 0 var(--vx-v-a-on, #ffffff)", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}
