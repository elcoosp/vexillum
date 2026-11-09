// c03-13 · Hex readout — Technical
// Re-seeded 2026-10: the readout previously painted its screen with the fixed
// neutral heading ink (--vx-t-heading), so no seed ever reached it. The screen
// is now the seed's deep accent, label rides the light surface ramp, and the
// hex digits glow in the accent's bright stop — the whole badge re-themes
// with the seed like the rest of the collection.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0313({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-13 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontFamily": "'JetBrains Mono', monospace", "letterSpacing": "0.05em", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.18)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%", "textShadow": "0 0 6px var(--vx-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[10px]" tw="text-[10px]" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "fontSize": "10px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80))" }}>
        {"·"}

      </span>
      <span className="value text-[10px] font-bold" tw="text-[10px] font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700", "fontSize": "10px", "textShadow": "0 0 8px var(--vx-v-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80))" }}>
        {value}

      </span>

    </div>
  );
}
