import { describe, expect, it, vi } from "vitest";
import { ApiError, BadgeCloudClient } from "../src";

const manifest = {
  collections: [{ id: "c01", slug: "foundational", title: "Foundational", description: "" }],
  variants: [
    {
      id: "c01-01", collection: "c01", title: "Two-tone split", hasIcon: true,
      hasLabel: true, hasValue: true, hasExtra: false, defaultIcon: null,
      defaultLabel: "build", defaultValue: "passing", defaultExtra: null, animations: [],
    },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("BadgeCloudClient", () => {
  it("builds canonical badge urls", () => {
    const c = new BadgeCloudClient("https://badge.example");
    expect(
      c.badgeUrl("foundational", "c01-01", "build", "passing", { format: "png", scale: 2, theme: "rose" }),
    ).toBe("https://badge.example/badge/foundational/c01-01/build/passing?format=png&scale=2&theme=rose");
    expect(
      c.badgeUrl("foundational", "c01-01", "a b", "c/d"),
    ).toBe("https://badge.example/badge/foundational/c01-01/a%20b/c%2Fd");
  });

  it("omits default scale and empty options", () => {
    const c = new BadgeCloudClient();
    expect(c.badgeUrl("f", "c01-01", "a", "b")).toBe("/badge/f/c01-01/a/b");
  });

  it("fetches the manifest", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(manifest));
    const c = new BadgeCloudClient("", fetchImpl as unknown as typeof fetch);
    const m = await c.variants();
    expect(m.variants[0].id).toBe("c01-01");
  });

  it("surfaces RFC 7807 problems as ApiError", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(
        { type: "https://vexillum.dev/errors/unknown-variant", title: "Unknown variant", status: 404, detail: "nope" },
        404,
      ),
    );
    const c = new BadgeCloudClient("", fetchImpl as unknown as typeof fetch);
    await expect(c.variants()).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      problem: { title: "Unknown variant" },
    });
    await expect(c.variants()).rejects.toBeInstanceOf(ApiError);
  });

  it("creates guardrail themes with auth", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({ colorCorrected: true, colors: { "value-fg": "oklch(0.2 0 264)" } }),
    );
    const c = new BadgeCloudClient("", fetchImpl as unknown as typeof fetch);
    const out = await c.createTheme("#7a7a7a", "vx_test_x");
    expect(out.colorCorrected).toBe(true);
    expect(fetchImpl.mock.calls[0][1]?.method).toBe("POST");
  });
});
