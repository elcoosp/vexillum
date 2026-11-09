// c04-11 · Phosphor CRT — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0411({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-11 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-a-deep, oklch(0.5219 0.1118 162.48))", "border": "1px solid var(--vx-a, oklch(0.6959 0.1491 162.48))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "boxShadow": "0 0 12px var(--vx-m-a-30-t, oklch(0.6959 0.1491 162.48 / 0.30)), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6959 0.1491 162.48))", "display": "inline-flex", "alignItems": "center", "height": "100%", "textShadow": "0 0 6px var(--vx-m-a-60-t, oklch(0.6959 0.1491 162.48 / 0.60))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-a, oklch(0.6959 0.1491 162.48))", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-a-muted, oklch(0.4175 0.0895 162.48))" }}>
        {"·"}

      </span>
      <span className="value text-[11px] font-bold" tw="text-[11px] font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontSize": "11px", "fontWeight": "700", "textShadow": "0 0 8px rgba(255,255,255,0.4)" }}>
        {value}

      </span>

    </div>
  );
}
