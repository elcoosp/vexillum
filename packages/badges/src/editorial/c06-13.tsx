// c06-13 · Footnote — Editorial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0613({ label, value }: BadgeProps) {
  return (
    <div className="badge c06-13 inline-flex flex-col items-start gap-[2px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start gap-[2px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "2px", "padding": "8px 0", "maxWidth": "326px" }}>
      <span className="value text-[14px] font-bold" tw="text-[14px] font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "14px", "fontWeight": "700" }}>
        {label}

      </span>
      <span className="footnote italic text-[10px]" tw="italic text-[10px]" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "fontSize": "10px", "fontStyle": "italic", "whiteSpace": "normal" }}>
        {value}

      </span>

    </div>
  );
}
