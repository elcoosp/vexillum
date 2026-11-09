import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderAt } from "./harness";

/** Renders every route through the real TanStack route tree. */
afterEach(cleanup);

describe("router renders all pages", () => {
  it("landing: hero, pricing tiers and comparison table", async () => {
    await renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: /badges that survive/i })).toBeTruthy();
    expect(screen.getByText(/Free for your README\. \$8 when you need more\./i)).toBeTruthy();
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.queryByText(/team/i)).toBeNull();
    expect(screen.getByRole("table", { name: /vexillum vs shields\.io/i })).toBeTruthy();
    expect(screen.getByRole("table", { name: /vexillum vs shields\.io/i }).textContent).toContain("RFC 7807");
  });

  it("explore: gallery with search, collections, theme picker and detail panel", async () => {
    await renderAt("/explore");
    expect(screen.getByRole("heading", { name: /explore the registry/i })).toBeTruthy();
    expect(screen.getByLabelText("Search variants")).toBeTruthy();
    expect(screen.getByRole("group", { name: "Theme" })).toBeTruthy();
    expect(screen.getByText("Preview")).toBeTruthy();
    // the gallery is VIRTUALIZED (TanStack Virtual): the DOM holds only the
    // rows near the viewport, but several virtual rows of framed cards must
    // exist and the status line must account for the full registry
    expect(screen.getByText(/544 of 544 variants/)).toBeTruthy();
    expect(document.querySelectorAll("[data-vx-frame]").length).toBeGreaterThan(8);
  });

  it("explore: the Fourth-segment filter isolates the quad badge", async () => {
    await renderAt("/explore");
    const chip = screen.getByRole("button", { name: "Fourth segment" });
    expect(chip.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(chip);
    await waitFor(() => expect(screen.getByText(/1 of 544 variants/)).toBeTruthy());
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    // clearing restores the full registry
    fireEvent.click(screen.getByRole("button", { name: /Clear \(1\)/ }));
    await waitFor(() => expect(screen.getByText(/544 of 544 variants/)).toBeTruthy());
  });

  it("playground: editor, preview and output tabs", async () => {
    await renderAt("/playground");
    expect(screen.getByRole("heading", { name: /playground/i })).toBeTruthy();
    expect(screen.getByLabelText(/variant/i)).toBeTruthy();
    expect(screen.getByRole("tablist", { name: "Output format" })).toBeTruthy();
  });

  it("docs: sidebar navigation with ten sections", async () => {
    await renderAt("/docs");
    expect(screen.getByRole("heading", { name: /api documentation/i })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /authentication/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Errors (RFC 7807)" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Edge worker" })).toBeTruthy();
  });

  it("dashboard: login wall for signed-out visitors (real API, no demo)", async () => {
    await renderAt("/dashboard");
    await waitFor(() => screen.getByRole("heading", { name: /your dashboard lives here/i }));
    expect(screen.getByRole("button", { name: /continue with github/i })).toBeTruthy();
    // the demo banner is gone — everything is live data now
    expect(screen.queryByTestId("demo-banner")).toBeNull();
  });

  it("billing is PUBLIC — plan grid renders for signed-out visitors, no login wall", async () => {
    // upgrade nudges (locked playground formats, icon uploads) link here even
    // when the visitor has no session — the old dashboard-embedded tab sent
    // them into the login wall instead
    await renderAt("/billing");
    expect(screen.getByRole("heading", { name: /billing/i })).toBeTruthy();
    // the session probe resolves async — the sign-in panel replaces the skeleton
    await screen.findByText(/Your usage, invoices and subscription/i);
    expect(screen.getByTestId("upgrade-to-pro")).toBeTruthy();
    expect(screen.queryByText(/your dashboard lives here/i)).toBeNull();
    // the signed-in-only bits stay out of the anonymous render: no plan pill,
    // no usage meter, no invoice ledger
    expect(screen.queryByTestId("billing-plan-pill")).toBeNull();
    expect(document.querySelector("table")).toBeNull();
  });

  it("login: GitHub OAuth button + no password form", async () => {
    // the harness stub answers the HEAD probe with 302 = OAuth configured
    await renderAt("/login");
    const button = await screen.findByTestId("github-login");
    expect(button.hasAttribute("disabled")).toBe(false);
    // no email/password form anymore — GitHub is the only door
    expect(screen.queryByLabelText("Email")).toBeNull();
    expect(screen.queryByLabelText("Password")).toBeNull();
    expect(screen.queryByTestId("oauth-unconfigured")).toBeNull();
  });

  it("signup redirects to the login page (GitHub made accounts implicit)", async () => {
    await renderAt("/signup");
    await waitFor(() => screen.getByTestId("github-login"));
    expect(screen.getByRole("heading", { name: /sign in to vexillum/i })).toBeTruthy();
  });

  it("unknown routes get a helpful 404", async () => {
    await renderAt("/nope");
    expect(screen.getByRole("heading", { name: /404 — off the registry/i })).toBeTruthy();
  });

  it("persistent chrome: nav landmarks and footer on every page", async () => {
    await renderAt("/docs");
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Log in" })).toBeTruthy();
    // the demo tier switcher was removed from the nav — no selects remain in the header
    expect(document.querySelectorAll("header select")).toHaveLength(0);
  });
});
