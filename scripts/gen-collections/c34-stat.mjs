import { ICONS, T } from "./shared.mjs";

const B100 = T.b100, S_WHITE = T.sWhite, S100 = T.s100, S200 = T.s200;
const box = (extra) => `"boxSizing": "border-box", "margin": "0", "textDecoration": "none", "whiteSpace": "nowrap", "maxWidth": "100%", ${extra ?? ""}`;
const MONO = "'JetBrains Mono', ui-monospace, monospace";

export const STAT = [
  {
    id: "c34-01", title: "KPI delta", slug: "stat", collectionTitle: "Stat",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: true,
    icon: "star", defaultIcon: ICONS.star,
    defaultLabel: "stars", defaultValue: "48.2k", defaultExtra: "+12.4%",
    jsx: `    <div className="badge c34-01 kpi inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "8px", "padding": "5px 10px 5px 8px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "8px", "boxShadow": "0 1px 2px rgba(15,23,42,0.05)"`)} }}>
      <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "${T.a}", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="col" style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
        <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "13.5px", "fontWeight": "800", "lineHeight": "1", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
      <span className="extra delta" style={{ "background": "${T.ok}", "color": "${T.sWhite}", "borderRadius": "999px", "padding": "3px 7px", "fontSize": "9.5px", "fontWeight": "700", "flex": "none" }}>
        {extra}
      </span>
    </div>`,
  },
  {
    id: "c34-02", title: "Trend pill", slug: "stat", collectionTitle: "Stat",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: true,
    icon: "bolt", defaultIcon: ICONS.bolt,
    defaultLabel: "deploys", defaultValue: "1,208", defaultExtra: "+38",
    jsx: `    <div className="badge c34-02 trend-pill inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "border": "1px solid ${B100}", "borderRadius": "999px", "overflow": "hidden"`)} }}>
      <span className="brand icon flex items-center gap-[5px]" style={{ "display": "flex", "alignItems": "center", "gap": "5px", "padding": "0 10px", "background": "${T.a}", "color": "${T.aOn}" }}>
        {icon ?? <IconSlot />}
        <span className="label" style={{ "fontSize": "10.5px", "fontWeight": "700" }}>
          {label}
        </span>
      </span>
      <span className="value flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "0 11px", "background": "${T.s50}" }}>
        <span style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
        <span className="extra" style={{ "background": "${T.ok}", "color": "${T.sWhite}", "borderRadius": "999px", "padding": "2px 6px", "fontSize": "9px", "fontWeight": "700" }}>
          {extra}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c34-03", title: "Odometer", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "requests", defaultValue: "894M", defaultExtra: null,
    jsx: `    <div className="badge c34-03 odometer inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "gap": "3px", "padding": "6px 12px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${T.dBg}", "border": "1px solid ${T.dBorder}", "borderRadius": "8px"`)} }}>
      <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.10em", "textTransform": "uppercase", "color": "${T.dTextMut}" }}>
        {label}
      </span>
      <span className="value" style={{ "fontSize": "16px", "fontWeight": "800", "lineHeight": "1", "fontFamily": "${MONO}", "letterSpacing": "-0.02em", "color": "${T.sWhite}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c34-04", title: "Rank medal", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "leaderboard", defaultValue: "1st", defaultExtra: null,
    jsx: `    <div className="badge c34-04 rank inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "8px", "padding": "4px 12px 4px 4px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "8px"`)} }}>
      <span className="medal flex items-center justify-center" style={{ "display": "flex", "alignItems": "center", "justifyContent": "center", "width": "24px", "height": "24px", "borderRadius": "50%", "background": "${T.warn}", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "10px", "fontWeight": "800", "flex": "none" }}>
        #1
      </span>
      <span className="col" style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
        <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "13px", "fontWeight": "800", "lineHeight": "1", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c34-05", title: "Rate meter", slug: "stat", collectionTitle: "Stat",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "chart", defaultIcon: ICONS.chart,
    defaultLabel: "throughput", defaultValue: "2.4k", defaultExtra: null,
    jsx: `    <div className="badge c34-05 rate inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px", "overflow": "hidden"`)} }}>
      <span className="label flex items-center gap-[6px]" style={{ "display": "flex", "alignItems": "center", "gap": "6px", "padding": "0 10px", "background": "${S100}", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "fontSize": "11px", "fontWeight": "600" }}>
        <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "${T.aDeep}", "flex": "none" }}>
          {icon ?? <IconSlot />}
        </span>
        <span>
          {label}
        </span>
      </span>
      <span className="value flex items-center gap-[3px]" style={{ "display": "flex", "alignItems": "center", "gap": "3px", "padding": "0 10px", "fontSize": "13px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
        <span className="unit" style={{ "fontSize": "9.5px", "fontWeight": "600", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>/s</span>
      </span>
    </div>`,
  },
  {
    id: "c34-06", title: "Mini bars", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "commits", defaultValue: "3,412", defaultExtra: null,
    jsx: `    <div className="badge c34-06 mini-bars inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "gap": "4px", "padding": "6px 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "8px"`)} }}>
      <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {label}
      </span>
      <span className="row flex items-end gap-[7px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "7px" }}>
        <span className="value" style={{ "fontSize": "14px", "fontWeight": "800", "lineHeight": "1", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
        <span className="bars flex items-end gap-[2px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "2px" }}>
          <span style={{ "display": "block", "width": "3px", "height": "6px", "borderRadius": "1px", "background": "${T.a}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "10px", "borderRadius": "1px", "background": "${T.a}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "14px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "8px", "borderRadius": "1px", "background": "${T.a}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "12px", "borderRadius": "1px", "background": "${T.a}" }}></span>
        </span>
      </span>
    </div>`,
  },
  {
    id: "c34-07", title: "Progress stat", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "sprint", defaultValue: "72%", defaultExtra: null,
    jsx: `    <div className="badge c34-07 progress inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "gap": "5px", "padding": "6px 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "8px", "minWidth": "148px"`)} }}>
      <span className="row flex items-center justify-between gap-[8px]" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px" }}>
        <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "13px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
      <span className="track" style={{ "position": "relative", "display": "block", "alignSelf": "stretch", "height": "4px", "borderRadius": "2px", "background": "${S200}" }}>
        <span className="fill" style={{ "position": "absolute", "left": "0", "top": "0", "height": "4px", "width": "58px", "borderRadius": "2px", "background": "${T.a}" }}></span>
      </span>
    </div>`,
  },
  {
    id: "c34-08", title: "Delta up", slug: "stat", collectionTitle: "Stat",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "arrowUp", defaultIcon: ICONS.arrowUp,
    defaultLabel: "growth", defaultValue: "+18.2%", defaultExtra: null,
    jsx: `    <div className="badge c34-08 delta-up inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0 12px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${T.ok}", "borderRadius": "999px"`)} }}>
      <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "${T.sWhite}", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "fontSize": "11px", "fontWeight": "700", "color": "${T.sWhite}" }}>
        {label}
      </span>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.sWhite}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c34-09", title: "Delta down", slug: "stat", collectionTitle: "Stat",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "arrowDown", defaultIcon: ICONS.arrowDown,
    defaultLabel: "regressions", defaultValue: "-12", defaultExtra: null,
    jsx: `    <div className="badge c34-09 delta-down inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0 12px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${T.err}", "borderRadius": "999px"`)} }}>
      <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "${T.sWhite}", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "fontSize": "11px", "fontWeight": "700", "color": "${T.sWhite}" }}>
        {label}
      </span>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.sWhite}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
  {
    id: "c34-10", title: "Stat chip", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "downloads", defaultValue: "12.9M", defaultExtra: null,
    jsx: `    <div className="badge c34-10 chip inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "22px", "padding": "0 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S100}", "borderRadius": "6px"`)} }}>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
      <span className="dot" style={{ "width": "3px", "height": "3px", "borderRadius": "50%", "background": "${T.a}", "flex": "none" }}></span>
      <span className="label" style={{ "fontSize": "10px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
    </div>`,
  },
  {
    id: "c34-11", title: "Bracket stat", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "latency", defaultValue: "84ms", defaultExtra: null,
    jsx: `    <div className="badge c34-11 bracket inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "5px", "padding": "4px 9px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "4px"`)} }}>
      <span className="label" style={{ "fontSize": "10px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="bracket-open" style={{ "fontFamily": "${MONO}", "fontSize": "12px", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>[</span>
      <span className="value" style={{ "fontFamily": "${MONO}", "fontSize": "12.5px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
      <span className="bracket-close" style={{ "fontFamily": "${MONO}", "fontSize": "12px", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>]</span>
    </div>`,
  },
  {
    id: "c34-12", title: "Percentile chip", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "response", defaultValue: "212ms", defaultExtra: null,
    jsx: `    <div className="badge c34-12 percentile inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "8px", "padding": "4px 10px 4px 4px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px"`)} }}>
      <span className="pchip" style={{ "background": "${T.aDeep}", "color": "${T.aOn}", "borderRadius": "4px", "padding": "3px 5px", "fontSize": "9px", "fontWeight": "800", "letterSpacing": "0.04em", "flex": "none" }}>
        P95
      </span>
      <span className="col" style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
        <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
          {label}
        </span>
        <span className="value" style={{ "fontSize": "13px", "fontWeight": "800", "lineHeight": "1", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
      </span>
    </div>`,
  },
  {
    id: "c34-13", title: "Compare split", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: true,
    icon: false, defaultIcon: null,
    defaultLabel: "revenue", defaultValue: "$9.4k", defaultExtra: "$8.1k",
    jsx: `    <div className="badge c34-13 compare inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-stretch overflow-hidden whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px", "overflow": "hidden"`)} }}>
      <span className="label flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "0 10px", "background": "${S100}", "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="value flex items-center" style={{ "display": "flex", "alignItems": "center", "padding": "0 10px", "borderLeft": "1px solid ${B100}", "fontSize": "13px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
      <span className="extra flex items-center gap-[3px]" style={{ "display": "flex", "alignItems": "center", "gap": "3px", "padding": "0 10px", "borderLeft": "1px solid ${B100}", "fontSize": "10px", "fontWeight": "500", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        <span>
          was
        </span>
        {extra}
      </span>
    </div>`,
  },
  {
    id: "c34-14", title: "Spark bars", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "rps", defaultValue: "1,842", defaultExtra: null,
    jsx: `    <div className="badge c34-14 spark inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "flexDirection": "column", "gap": "4px", "padding": "6px 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${T.dBg}", "border": "1px solid ${T.dBorder}", "borderRadius": "8px"`)} }}>
      <span className="label" style={{ "fontSize": "8.5px", "fontWeight": "700", "letterSpacing": "0.10em", "textTransform": "uppercase", "color": "${T.dTextMut}" }}>
        {label}
      </span>
      <span className="row flex items-end gap-[8px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "8px" }}>
        <span className="value" style={{ "fontSize": "14px", "fontWeight": "800", "lineHeight": "1", "fontFamily": "${MONO}", "color": "${T.sWhite}", "fontVariantNumeric": "tabular-nums" }}>
          {value}
        </span>
        <span className="bars flex items-end gap-[2px]" style={{ "display": "flex", "alignItems": "flex-end", "gap": "2px" }}>
          <span style={{ "display": "block", "width": "3px", "height": "5px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "9px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "13px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "7px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "15px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "11px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
          <span style={{ "display": "block", "width": "3px", "height": "8px", "borderRadius": "1px", "background": "${T.aBright}" }}></span>
        </span>
      </span>
    </div>`,
  },
  {
    id: "c34-15", title: "Unit capsule", slug: "stat", collectionTitle: "Stat",
    hasIcon: true, hasLabel: true, hasValue: true, hasExtra: false,
    icon: "check", defaultIcon: ICONS.check,
    defaultLabel: "build", defaultValue: "842", defaultExtra: null,
    jsx: `    <div className="badge c34-15 unit-capsule inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0 4px 0 10px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "999px"`)} }}>
      <span className="icon" style={{ "display": "flex", "alignItems": "center", "color": "${T.a}", "flex": "none" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
      <span className="unit" style={{ "background": "${S100}", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "borderRadius": "999px", "padding": "3px 6px", "fontSize": "8.5px", "fontWeight": "700", "flex": "none" }}>
        ms
      </span>
    </div>`,
  },
  {
    id: "c34-16", title: "Receipt total", slug: "stat", collectionTitle: "Stat",
    hasIcon: false, hasLabel: true, hasValue: true, hasExtra: false,
    icon: false, defaultIcon: null,
    defaultLabel: "total requests", defaultValue: "894,211", defaultExtra: null,
    jsx: `    <div className="badge c34-16 receipt inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ ${box(`"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "26px", "padding": "0 12px", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "background": "${S_WHITE}", "border": "1px solid ${B100}", "borderRadius": "6px"`)} }}>
      <span className="label" style={{ "fontSize": "11px", "fontWeight": "600", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))" }}>
        {label}
      </span>
      <span className="leader" style={{ "flex": "1 1 auto", "minWidth": "14px", "height": "1px", "alignSelf": "center", "background": "repeating-linear-gradient(90deg, ${B100} 0 2px, transparent 2px 5px)" }}></span>
      <span className="value" style={{ "fontSize": "12px", "fontWeight": "800", "color": "${T.vTHeading}", "fontVariantNumeric": "tabular-nums" }}>
        {value}
      </span>
    </div>`,
  },
];
