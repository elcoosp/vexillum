// c23-16 · + label pip — Facet
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C2316({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c23-16 c-adj t-fac inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[3px] leading-none" tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold rounded-[3px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "1.5px", "position": "relative", "height": "30px", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "maxWidth": "100%", "background": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "borderRadius": "3px", "clipPath": "polygon(10px 0,100% 0,100% 100%,0 100%,0 10px)" }}>
      <span className="in flex items-center whitespace-nowrap rounded-[2px]" tw="flex items-center whitespace-nowrap rounded-[2px]" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "display": "flex", "alignItems": "center", "height": "100%", "background": "var(--vx-a-on, #ffffff)", "borderRadius": "2px", "clipPath": "polygon(9px 0,100% 0,100% 100%,0 100%,0 9px)", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "whiteSpace": "nowrap" }}>
        <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 5px 0 14px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-m-a-30-6b7280, oklch(0.5825 0.0707 258.55))", "whiteSpace": "nowrap" }}>
          <span className="pip whitespace-nowrap font-medium" tw="whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "width": "6px", "height": "6px", "borderRadius": "50%", "background": "var(--vx-a, oklch(0.5400 0.1600 252.00))", "flex": "none", "fontWeight": "500", "color": "var(--vx-m-a-30-6b7280, oklch(0.5825 0.0707 258.55))", "whiteSpace": "nowrap" }}></span>
          {icon ?? <IconSlot />}
          {label}

        </span>
        <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 14px 0 5px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "whiteSpace": "nowrap" }}>
          {value}

        </span>

      </span>

    </div>
  );
}
