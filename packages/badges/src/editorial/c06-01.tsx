// c06-01 · Minimal line — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0601({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c06-01 inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "4px", "padding": "4px 0", "maxWidth": "326px" }}>
      <div className="top inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "display": "inline-flex", "alignItems": "center", "gap": "6px" }}>
        {icon ?? <IconSlot />}
        <span className="label text-[11px] font-medium" tw="text-[11px] font-medium" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "fontSize": "11px", "fontWeight": "500" }}>
          {label}

        </span>

      </div>
      <div className="value text-[14px] font-bold" tw="text-[14px] font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "14px", "fontWeight": "700", "letterSpacing": "-0.01em", "whiteSpace": "normal" }}>
        {value}

      </div>
      <div className="line rounded-[1px]" tw="rounded-[1px]" style={{ "width": "100%", "height": "2px", "background": "linear-gradient(90deg, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 0%, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 30%, var(--vx-b-100, oklch(0.8819 0.0331 263.82)) 30%, var(--vx-b-100, oklch(0.8819 0.0331 263.82)) 100%)", "borderRadius": "1px" }}></div>

    </div>
  );
}
