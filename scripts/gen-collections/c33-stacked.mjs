import { ICONS, T } from "./shared.mjs";

const B100 = T.b100, S_WHITE = T.sWhite, S100 = T.s100;
const box = (extra) => `"boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", ${extra ?? ""}`;

export const STACKED = [
  {
    id: "c33-01", title: "Paper stack", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "layers", defaultIcon: ICONS.layers,
    defaultLabel: "build", defaultValue: "passing", defaultExtra: null,
    jsx: `    <div className="badge c33-01 stacked relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"position": "relative", "display": "inline-flex", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0 8px 8px 0"`)} }}>
      <span className="ghost ghost-2" style={{ "position": "absolute", "top": "8px", "left": "8px", "right": "0", "bottom": "0", "background": "var(--vx-a-muted, oklch(0.9600 0.0180 252.00))", "border": "1px solid ${B100}", "borderRadius": "6px" }}></span>
      <span className="ghost ghost-1" style={{ "position": "absolute", "top": "4px", "left": "4px", "right": "0", "bottom": "0", "background": "${S100}", "border": "1px solid ${B100}", "borderRadius": "6px" }}></span>
      <span className="face flex items-center" style={{ "position": "relative", "display": "flex", "alignItems": "center", "height": "26px", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px", "boxShadow": "0 1px 2px rgba(15,23,42,0.06)" }}>
        <span className="label icon flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "height": "100%", "padding": "0 9px 0 10px", "borderRight": "1px solid ${B100}", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "fontWeight": "600" }}>
          {icon ?? <IconSlot />}
          <span>
            {label}
          </span>
        </span>
        <span className="value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "100%", "padding": "0 12px", "fontWeight": "800", "color": "${T.vTHeading}" }}>
          <span>
            {value}
          </span>
        </span>
      </span>
    </div>`,
  },
  {
    id: "c33-02", title: "Offset duo", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "deploy", defaultValue: "main", defaultExtra: null,
    jsx: `    <div className="badge c33-02 offset-duo inline-flex items-stretch whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0"`)} }}>
      <span className="lift flex" style={{ "display": "flex", "paddingBottom": "7px" }}>
        <span className="label flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 12px", "background": "${T.aDeep}", "color": "${T.aOn}", "borderRadius": "6px", "fontSize": "11.5px", "fontWeight": "700" }}>
          {label}
        </span>
      </span>
      <span className="drop flex" style={{ "display": "flex", "paddingTop": "7px", "marginLeft": "4px" }}>
        <span className="value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 12px", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px", "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}" }}>
          {value}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c33-03", title: "Soft stack", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "coverage", defaultValue: "92%", defaultExtra: null,
    jsx: `    <div className="badge c33-03 soft-stack inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "height": "28px", "padding": "0 12px", "gap": "8px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "8px", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 1px rgba(15,23,42,0.04), 0 2px 4px rgba(15,23,42,0.06), 0 4px 9px rgba(15,23,42,0.09)"`)} }}>
      <span className="label" style={{ "fontSize": "11.5px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="dot" style={{ "width": "3px", "height": "3px", "borderRadius": "50%", "background": "${T.a}", "flex": "none" }}></span>
      <span className="value" style={{ "fontSize": "12.5px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c33-04", title: "Z-fold", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: true,
    icon: false, defaultIcon: null,
    defaultLabel: "matrix", defaultValue: "green", defaultExtra: "18 jobs",
    jsx: `    <div className="badge c33-04 z-fold inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S100}", "border": "1px solid ${B100}", "borderRadius": "6px", "overflow": "hidden"`)} }}>
      <span className="label flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "0 10px", "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="crease value flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "0 12px", "background": "${S_WHITE}", "borderLeft": "1px solid ${B100}", "borderRight": "1px solid ${B100}", "boxShadow": "inset 0 1px 2px rgba(15,23,42,0.07)", "fontSize": "12.5px", "fontWeight": "800", "color": "${T.vTHeading}" }}>
        {value}
      </span>
      <span className="extra flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "0 10px", "fontSize": "10.5px", "fontWeight": "500", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {extra}
      </span>
    </div>`,
  },
  {
    id: "c33-05", title: "Card on card", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "bolt", defaultIcon: ICONS.bolt,
    defaultLabel: "stars", defaultValue: "48.2k", defaultExtra: null,
    jsx: `    <div className="badge c33-05 card-on-card relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"position": "relative", "display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "12px 0 0 0"`)} }}>
      <span className="body value" style={{ "display": "block", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px", "padding": "13px 14px 6px", "fontSize": "15px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums", "boxShadow": "0 1px 3px rgba(15,23,42,0.08)" }}>
        {value}
      </span>
      <span className="head icon flex items-center gap-[5px]" style={{ "position": "absolute", "top": "0", "left": "8px", "display": "flex", "alignItems": "center", "gap": "5px", "background": "${T.a}", "color": "${T.aOn}", "borderRadius": "5px", "padding": "3px 8px", "fontSize": "8.5px", "fontWeight": "800", "letterSpacing": "0.08em", "textTransform": "uppercase", "boxShadow": "0 1px 2px rgba(15,23,42,0.20)" }}>
        {icon ?? <IconSlot />}
        <span>
          {label}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c33-06", title: "Index tab", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "issues", defaultValue: "7 open", defaultExtra: null,
    jsx: `    <div className="badge c33-06 index-tab inline-flex flex-col items-start whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0"`)} }}>
      <span className="tab label" style={{ "display": "block", "padding": "4px 12px 5px", "background": "${T.aMuted}", "border": "1px solid ${B100}", "borderBottom": "0", "borderRadius": "6px 6px 0 0", "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.10em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="drawer value flex items-center" style={{ "display": "flex", "alignItems": "center", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "0 6px 6px 6px", "padding": "6px 14px", "fontSize": "12.5px", "fontWeight": "800", "color": "${T.vTHeading}", "boxShadow": "0 1px 2px rgba(15,23,42,0.05)" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c33-07", title: "Pill pile", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "version", defaultValue: "v2.8.1", defaultExtra: null,
    jsx: `    <div className="badge c33-07 pill-pile relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"position": "relative", "display": "inline-flex", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0 0 8px 0"`)} }}>
      <span className="pile pile-2" style={{ "position": "absolute", "top": "8px", "left": "4px", "right": "4px", "bottom": "0", "background": "${T.aMuted}", "border": "1px solid ${B100}", "borderRadius": "999px" }}></span>
      <span className="pile pile-1" style={{ "position": "absolute", "top": "4px", "left": "2px", "right": "2px", "bottom": "0", "background": "${S100}", "border": "1px solid ${B100}", "borderRadius": "999px" }}></span>
      <span className="pill flex items-center" style={{ "position": "relative", "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 14px", "gap": "8px", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "999px", "boxShadow": "0 1px 2px rgba(15,23,42,0.05)" }}>
        <span className="label" style={{ "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
          {label}
        </span>
        <span className="sep" style={{ "width": "1px", "height": "12px", "background": "${B100}", "flex": "none" }}></span>
        <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c33-08", title: "Layer bars", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "chart", defaultIcon: ICONS.chart,
    defaultLabel: "tests", defaultValue: "1,024", defaultExtra: null,
    jsx: `    <div className="badge c33-08 layer-bars inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "border": "1px solid ${B100}", "borderRadius": "6px", "overflow": "hidden"`)} }}>
      <span className="bar-top icon flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "4px 10px", "background": "${T.aDeep}", "color": "${T.aOn}" }}>
        {icon ?? <IconSlot />}
        <span className="label" style={{ "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.10em", "textTransform": "uppercase" }}>
          {label}
        </span>
      </span>
      <span className="value flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "5px 10px", "background": "${S_WHITE}", "fontSize": "12.5px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c33-09", title: "Carbon copy", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "fork", defaultValue: "synced", defaultExtra: null,
    jsx: `    <div className="badge c33-09 carbon-copy relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"position": "relative", "display": "inline-flex", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "5px 5px 0 0"`)} }}>
      <span className="copy" style={{ "position": "absolute", "top": "0", "left": "5px", "right": "0", "bottom": "0", "background": "${S100}", "border": "1px solid ${B100}", "borderRadius": "6px" }}></span>
      <span className="face flex items-center" style={{ "position": "relative", "display": "flex", "alignItems": "center", "height": "24px", "padding": "0 10px", "gap": "8px", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px" }}>
        <span className="label" style={{ "fontSize": "10.5px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c33-10", title: "Staircase", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "ci", defaultValue: "passing", defaultExtra: null,
    jsx: `    <div className="badge c33-10 staircase inline-flex items-start whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-start whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0"`)} }}>
      <span className="step step-label flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "24px", "padding": "0 10px", "background": "${S100}", "border": "1px solid ${B100}", "borderRadius": "6px", "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="step step-value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "24px", "marginTop": "9px", "marginLeft": "5px", "padding": "0 12px", "background": "${T.aDeep}", "color": "${T.aOn}", "borderRadius": "6px", "fontSize": "12px", "fontWeight": "800", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c33-11", title: "Stack list", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "user", defaultIcon: ICONS.user,
    defaultLabel: "team", defaultValue: "12 online", defaultExtra: null,
    jsx: `    <div className="badge c33-11 stack-list inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px", "overflow": "hidden"`)} }}>
      <span className="row icon flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "3px 9px", "background": "${S100}", "borderLeft": "3px solid ${T.a}" }}>
        {icon ?? <IconSlot />}
        <span className="label" style={{ "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.07em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
          {label}
        </span>
      </span>
      <span className="value" style={{ "display": "block", "padding": "4px 9px", "borderTop": "1px solid ${B100}", "borderLeft": "3px solid ${T.aDeep}", "fontSize": "12.5px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c33-12", title: "Totem", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "star", defaultIcon: ICONS.star,
    defaultLabel: "sponsor", defaultValue: "1.2k", defaultExtra: null,
    jsx: `    <div className="badge c33-12 totem inline-flex flex-col items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "8px", "overflow": "hidden"`)} }}>
      <span className="orb icon flex items-center justify-center" style={{ "display": "flex", "alignItems": "center", "justifyContent": "center", "width": "20px", "height": "20px", "borderRadius": "50%", "background": "${T.a}", "color": "${T.aOn}", "marginTop": "7px", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "marginTop": "3px", "fontSize": "8px", "fontWeight": "800", "letterSpacing": "0.12em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {label}
      </span>
      <span className="value" style={{ "alignSelf": "stretch", "textAlign": "center", "marginTop": "4px", "padding": "4px 12px 6px", "borderTop": "1px solid ${B100}", "fontSize": "13px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c33-13", title: "Inset panels", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "release", defaultValue: "v3.0", defaultExtra: null,
    jsx: `    <div className="badge c33-13 inset-panels inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S100}", "borderRadius": "8px", "padding": "4px"`)} }}>
      <span className="panel label flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "3px 8px", "background": "${T.aDeep}", "color": "${T.aOn}", "borderRadius": "3px" }}>
        <span style={{ "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.10em", "textTransform": "uppercase" }}>
          {label}
        </span>
      </span>
      <span className="panel value flex items-center" style={{ "display": "flex", "alignItems": "center", "margin": "3px 5px 0 5px", "padding": "3px 8px", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "3px", "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c33-14", title: "Overlap tabs", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "branch", defaultValue: "main", defaultExtra: null,
    jsx: `    <div className="badge c33-14 overlap-tabs relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"position": "relative", "display": "inline-flex", "flexDirection": "column", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "9px 0 0 0"`)} }}>
      <span className="tab-value value flex items-center" style={{ "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 12px", "background": "${T.aDeep}", "color": "${T.aOn}", "borderRadius": "6px", "fontSize": "11.5px", "fontWeight": "800" }}>
        {value}
      </span>
      <span className="tab-label label flex items-center" style={{ "position": "absolute", "top": "0", "left": "6px", "display": "flex", "alignItems": "center", "height": "18px", "padding": "0 8px", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "5px", "fontSize": "8.5px", "fontWeight": "800", "letterSpacing": "0.07em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "boxShadow": "0 1px 2px rgba(15,23,42,0.08)" }}>
        {label}
      </span>
    </div>`,
  },
  {
    id: "c33-15", title: "Plate", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "latency", defaultValue: "84ms", defaultExtra: null,
    jsx: `    <div className="badge c33-15 plate relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" tw="relative inline-flex whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"position": "relative", "display": "inline-flex", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0 0 5px 0"`)} }}>
      <span className="rim" style={{ "position": "absolute", "left": "3px", "right": "3px", "bottom": "0", "height": "8px", "background": "${T.aDeep}", "borderRadius": "0 0 6px 6px" }}></span>
      <span className="face flex items-center" style={{ "position": "relative", "display": "flex", "alignItems": "center", "height": "26px", "padding": "0 12px", "gap": "8px", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 2px rgba(15,23,42,0.06)" }}>
        <span className="label" style={{ "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c33-16", title: "Beads", slug: "stacked", collectionTitle: "Stacked",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "status", defaultValue: "stable", defaultExtra: null,
    jsx: `    <div className="badge c33-16 beads inline-flex flex-col items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "padding": "0"`)} }}>
      <span className="bead label flex items-center gap-[5px]" style={{ "display": "flex", "alignItems": "center", "gap": "5px", "padding": "3px 10px", "background": "${S100}", "border": "1px solid ${B100}", "borderRadius": "999px", "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="link" style={{ "width": "2px", "height": "5px", "background": "var(--vx-b-300, oklch(0.6820 0.0783 260.80))", "flex": "none" }}></span>
      <span className="bead value flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "4px 12px", "background": "${T.aDeep}", "color": "${T.aOn}", "borderRadius": "999px", "fontSize": "12px", "fontWeight": "800", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
];
