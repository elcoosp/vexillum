// c09-09 · Cyan info — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0909({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-09 inline-flex flex-row-reverse items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full font-mono leading-none" tw="inline-flex flex-row-reverse items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "border": "1px solid var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "borderRadius": "999px", "padding": "0 8px 0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "flexDirection": "row-reverse" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%", "order": "10" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "fontSize": "11px", "order": "1" }}>
        {label}

      </span>
      <div className="sep" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "order": "2" }}>
        {"·"}

      </div>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))", "fontSize": "11px", "order": "3" }}>
        {value}

      </span>

    </div>
  );
}
