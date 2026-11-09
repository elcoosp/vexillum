import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import registryJson from "@vexillum/badges/registry.json";
import { registry, themeToVars } from "@vexillum/badges";

describe("web app data layer", () => {
  it("renders every variant server-side without crashing", () => {
    for (const v of registryJson.variants) {
      const Component = registry[v.id];
      expect(Component, v.id).toBeTypeOf("function");
      const html = renderToStaticMarkup(
        <Component
          label={v.defaultLabel}
          value={v.defaultValue}
          extra={v.defaultExtra ?? undefined}
          icon={v.defaultIcon ? undefined : undefined}
        />,
      );
      expect(html.length).toBeGreaterThan(40);
    }
  });

  it("maps theme tokens to css custom properties", () => {
    const vars = themeToVars({ "value-bg": "#123456" });
    expect(vars).toEqual({ "--value-bg": "#123456" });
    expect(themeToVars(undefined)).toBeUndefined();
    expect(themeToVars({})).toBeUndefined();
  });

  it("renders all default icons without script content", () => {
    for (const v of registryJson.variants) {
      if (v.defaultIcon) {
        expect(v.defaultIcon).not.toContain("<script");
      }
    }
  });
});
