import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderAt } from "./harness";

/**
 * The docs page is derived from the real API contract — verify the load-bearing
 * facts survive edits: key formats, endpoint shapes, RFC 7807, caching, tiers.
 */

async function renderDocs() {
  return await renderAt("/docs");
}

afterEach(cleanup);

describe("docs content", () => {
  it("documents keyless README rendering, the Bearer/`?key=` order and origin pinning", async () => {
    await renderDocs();
    const page = document.body.textContent!;
    expect(page).toContain("never requires a key");
    expect(page).toContain("vx_live_");
    expect(page).toContain("Authorization: Bearer");
    expect(page).toContain("?key=");
    // the origin-pin security model: foreign hosts are rejected with 403
    expect(page).toContain("origin-pinned");
    expect(page).toContain("403");
  });

  it("documents static + dynamic badge endpoint shapes from routes.rs", async () => {
    await renderDocs();
    const page = document.body.textContent!;
    expect(page).toContain("/badge/foundational/c01-01/build/passing");
    expect(page).toContain("/badge/github/stars/");
    expect(page).toContain("/badge/npm/v/");
    expect(page).toContain("/badge/crates/v/");
    expect(page).toContain("/badge/docker/pulls/");
    expect(page).toContain("/badge/dynamic/json");
    expect(page).toContain("/badge/endpoint");
  });

  it("documents formats & scale with tier gating", async () => {
    await renderDocs();
    const page = document.body.textContent!;
    expect(page).toContain("scale=2");
    expect(page).toContain("402");
    expect(page).toContain("apng");
  });

  it("documents caching with ETag / If-None-Match and tier TTL floors", async () => {
    await renderDocs();
    const page = document.body.textContent!;
    expect(page).toContain("ETag");
    expect(page).toContain("If-None-Match");
    expect(page).toContain("304 Not Modified");
    expect(page).toContain("Free 3600s · Pro 60s");
    expect(page).not.toContain("Team 1s");
  });

  it("documents rate limits per tier (Free/Pro — two plans, no enterprise theater)", async () => {
    await renderDocs();
    const page = document.body.textContent!;
    expect(page).toContain("60 rpm");
    expect(page).toContain("600 rpm");
    expect(page).not.toContain("3,000 rpm");
    expect(page).not.toContain("500,000");
  });

  it("documents RFC 7807 errors with a stable type URI example", async () => {
    await renderDocs();
    const page = document.body.textContent!;
    expect(page).toContain("application/problem+json");
    expect(page).toContain("payment-required");
    expect(page).toContain("rate-limited");
  });

  it("documents the icon flow (curated + upload:hash) and the edge worker", async () => {
    await renderDocs();
    const page = document.body.textContent!;
    expect(page).toContain("upload:");
    expect(page).toContain("Cloudflare Worker");
  });

  it("lists all sidebar sections with anchor navigation", async () => {
    await renderDocs();
    for (const id of [
      "authentication",
      "badge-endpoints",
      "formats",
      "theming",
      "icons",
      "caching",
      "rate-limits",
      "errors",
      "api",
      "edge",
    ]) {
      expect(document.getElementById(id), id).toBeTruthy();
    }
  });
});
