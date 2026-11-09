// c07-14 · Half fill — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
// The filled block is a real flex child (not a 50% overlay): it hugs the
// icon+label content, so the label can never spill onto the light half and
// turn white-on-white for longer labels.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0714({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-14 inline-flex items-stretch whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-stretch whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "boxSizing": "border-box", "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "overflow": "hidden" }}>
      <div className="left inline-flex items-center font-bold" tw="inline-flex items-center font-bold" style={{ "boxSizing": "border-box", "display": "inline-flex", "alignItems": "center", "height": "100%", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "borderRight": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "padding": "0 10px", "gap": "6px", "minWidth": "0", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
        {icon ?? <IconSlot />}
        <span className="label font-bold" tw="font-bold" style={{ "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em" }}>
          {label}
        </span>
      </div>
      <div className="right inline-flex items-center" tw="inline-flex items-center" style={{ "boxSizing": "border-box", "display": "inline-flex", "alignItems": "center", "height": "100%", "padding": "0 10px", "gap": "6px", "minWidth": "0" }}>
        <span className="sep" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>·</span>
        <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800" }}>
          {value}
        </span>
      </div>
    </div>
  );
}
