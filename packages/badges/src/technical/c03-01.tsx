// c03-01 · Blueprint — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0301({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-01 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-a-muted, oklch(0.9623 0.0188 259.81))", "backgroundImage": "linear-gradient(var(--vx-a-soft, oklch(0.9058 0.0470 259.81)) 1px, transparent 1px), linear-gradient(90deg, var(--vx-a-soft, oklch(0.9058 0.0470 259.81)) 1px, transparent 1px)", "backgroundSize": "8px 8px", "border": "2px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "0 2px 4px var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15))" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "6px", "height": "6px", "border": "2px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "50%", "top": "-4px", "left": "-4px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px] font-mono" tw="text-[11px] font-mono" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-a-soft, oklch(0.9058 0.0470 259.81))" }}>
        {"·"}

      </span>
      <span className="value text-[11px] font-bold font-mono" tw="text-[11px] font-bold font-mono" style={{ "color": "var(--vx-v-a-ink, oklch(0.3427 0.1034 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "700" }}>
        {value}

      </span>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "width": "6px", "height": "6px", "border": "2px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "50%", "bottom": "-4px", "right": "-4px", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

    </div>
  );
}
