import {describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor, within } from "@testing-library/react";
import { renderAt } from "./harness";
import { BadgeCloudClient } from "@vexillum/sdk";
import { badgeFontFamily, badgeUrl as webBadgeUrl } from "@/lib/api";

/**
 * The playground's URL grammar (through the real @vexillum/sdk client) and the
 * format gating UX.
 */

afterEach(cleanup);

async function renderPlayground(initial = "/playground") {
  return await renderAt(initial);
}

describe("playground", () => {
  it("builds the canonical badge URL for the selected variant", async () => {
    await renderPlayground();
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/\/badge\/foundational\/c01-01\/build\/passing/);
    expect(pre.textContent).not.toMatch(/[?&]scale=/); // scale=1 omitted
  });

  it("adds theme, scale and format query params when chosen", async () => {
    await renderPlayground();
    fireEvent.click(screen.getByRole("button", { name: "blue" })); // theme chip
    fireEvent.click(screen.getByRole("button", { name: "@2x" }));
    fireEvent.click(screen.getByRole("button", { name: "png" }));
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/\?format=png&scale=2&theme=blue/);
  });

  it("emits markdown / HTML / <img> snippets on the output tabs", async () => {
    await renderPlayground();
    fireEvent.click(screen.getByRole("tab", { name: "Markdown" }));
    let pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/^\[!\[build\]\(/);

    fireEvent.click(screen.getByRole("tab", { name: "HTML" }));
    pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/^<img src=".*" alt="build: passing" height="20">$/);

    fireEvent.click(screen.getByRole("tab", { name: "<img>" }));
    pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/^<img src=".*" height="20">$/);
  });

  it("accepts an initial variant from the query string (explore hand-off)", async () => {
    await renderPlayground("/playground?variant=c09-02&theme=emerald");
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/\/badge\/terminal\/c09-02\//);
  });

  it("gates raster formats honestly on the Free tier", async () => {
    await renderPlayground(); // visitor ⇒ free surface
    expect(screen.queryByTestId("format-notice")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "apng" }));
    expect(screen.getByTestId("format-notice").textContent).toContain("is a Pro format");
    // selection did not change — the URL stays on the last allowed format
    expect((document.querySelector("pre code") as HTMLElement).textContent).not.toMatch(/format=apng/);
  });

  it("matches the SDK's URL grammar exactly for a known input", async () => {
    const client = new BadgeCloudClient("");
    const expected = client.badgeUrl("foundational", "c01-01", "build", "passing", {
      format: "svg",
      theme: "blue",
    });
    expect(expected).toBe("/badge/foundational/c01-01/build/passing?format=svg&theme=blue");
  });

  it("reopens the variant dropdown on click WITHOUT an unfocus/refocus round-trip", async () => {
    await renderPlayground();
    const input = screen.getByRole("combobox", { name: /variant/i }) as HTMLInputElement;

    // pick a variant (keyboard flow: focus opens the list, Enter commits)
    fireEvent.focus(input);
    await waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("true"));
    fireEvent.keyDown(input, { key: "Enter" }); // commit active row
    await waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("false"));

    // the regression: the input is STILL focused after commit — clicking it
    // again must open the list immediately (no blur/refocus dance first)
    fireEvent.mouseDown(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("listbox", { name: "Variants" })).toBeTruthy();
  });
});

describe("playground font control (?font=)", () => {
  it("omits the font param entirely while 'source' (default) is selected", async () => {
    await renderPlayground();
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).not.toMatch(/[?&]font=/);
  });

  it("appends font=<slug> only when a bundled font is chosen, across all output tabs", async () => {
    await renderPlayground();
    fireEvent.change(screen.getByLabelText("Font"), { target: { value: "jetbrains-mono" } });
    let pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/[?&]font=jetbrains-mono$/);

    fireEvent.click(screen.getByRole("tab", { name: "Markdown" }));
    pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/font=jetbrains-mono/);

    fireEvent.click(screen.getByRole("tab", { name: "<img>" }));
    pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/font=jetbrains-mono/);
  });

  it("accepts an initial font from the query string", async () => {
    await renderPlayground("/playground?font=space-mono");
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/[?&]font=space-mono/);
  });

  it("wraps the live preview in the chosen CSS font family (no override for source)", async () => {
    await renderPlayground();
    const frame = document.querySelector("[data-vx-frame='fit']")!;
    const wrapper = frame.parentElement as HTMLElement;
    expect(wrapper.style.fontFamily).toBe("");

    fireEvent.change(screen.getByLabelText("Font"), { target: { value: "instrument-serif" } });
    // jsdom serializes quoted families with double quotes — compare unquoted
    expect(wrapper.style.fontFamily.replace(/['"]/g, "")).toBe("Instrument Serif");

    fireEvent.change(screen.getByLabelText("Font"), { target: { value: "source" } });
    expect(wrapper.style.fontFamily).toBe("");
  });

  it("shows the bundled-fonts + Google Fonts hint under the control", async () => {
    await renderPlayground();
    // catalog chunk resolves in a microtask — the hint then carries the count
    await waitFor(() => {
      expect(screen.getByText(/Server renders with bundled fonts:/).textContent).toBe(
        "Server renders with bundled fonts: Inter · JetBrains Mono · Instrument Serif · Space Mono — plus 1,959 Google Fonts. Type a name to search.",
      );
    });
  });

  it("resolves a Google Fonts slug: URL param, preview family, stylesheet link", async () => {
    await renderPlayground();
    await waitFor(() => expect(screen.getByLabelText("Font")).toBeTruthy());
    fireEvent.change(screen.getByLabelText("Font"), { target: { value: "playfair-display" } });
    const pre = document.querySelector("pre code")!;
    await waitFor(() => expect(pre.textContent).toMatch(/[?&]font=playfair-display$/));
    // the preview loads the real webfont via a stylesheet link
    await waitFor(() => {
      const link = document.querySelector('link[data-vx-font="Playfair Display"]');
      expect(link).toBeTruthy();
      expect(link!.getAttribute("href")).toContain("family=Playfair+Display");
    });
    const frame = document.querySelector("[data-vx-frame='fit']")!;
    const wrapper = frame.parentElement as HTMLElement;
    await waitFor(() => expect(wrapper.style.fontFamily.replace(/['"]/g, "")).toBe("Playfair Display"));
  });

  it("accepts a Google Fonts slug from the query string", async () => {
    await renderPlayground("/playground?font=noto-sans-sc");
    const pre = document.querySelector("pre code")!;
    await waitFor(() => expect(pre.textContent).toMatch(/[?&]font=noto-sans-sc/));
    await waitFor(() => {
      expect(document.querySelector('link[data-vx-font="Noto Sans SC"]')).toBeTruthy();
    });
  });

  it("resets an unknown font slug from the query string to source", async () => {
    await renderPlayground("/playground?font=not-a-real-font");
    const pre = document.querySelector("pre code")!;
    await waitFor(() => expect(pre.textContent).not.toMatch(/[?&]font=/));
  });
});

describe("playground icon picker", () => {
  it("renders a searchable grid of real icons and passes the chosen slug to the URL", async () => {
    await renderPlayground();
    fireEvent.click(screen.getByRole("button", { name: "curated" }));

    const search = screen.getByLabelText(/icon library/i);
    fireEvent.change(search, { target: { value: "docker" } });

    const grid = await screen.findByRole("group", { name: "Icon library" });
    const buttons = grid.querySelectorAll("button");
    expect(buttons.length).toBe(1); // filtered to exactly docker
    expect(grid.querySelectorAll("svg").length).toBe(1); // the ACTUAL icon renders
    expect(buttons[0]!.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(buttons[0]!);
    expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0]!.getAttribute("title")).toBe("Docker (docker)");
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/[?&]icon=docker(&|$)/);
  });

  it("shows an empty state when no icon matches the query", async () => {
    await renderPlayground();
    fireEvent.click(screen.getByRole("button", { name: "curated" }));
    const search = screen.getByLabelText(/icon library/i);
    fireEvent.change(search, { target: { value: "zzzz-nope" } });
    expect(await screen.findByText(/no icons match/i)).toBeTruthy();
  });

  it("marks the default slug as selected when the picker opens", async () => {
    await renderPlayground();
    fireEvent.click(screen.getByRole("button", { name: "curated" }));
    const github = await screen.findByRole("button", { name: "GitHub (github)" });
    expect(github.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("playground state in the app URL (shareable links)", () => {
  it("persists format/scale choices into the shareable playground link", async () => {
    await renderPlayground();
    fireEvent.click(screen.getByRole("button", { name: "@2x" }));
    fireEvent.click(screen.getByRole("button", { name: "png" }));
    const share = screen.getByRole("button", { name: "Copy playground link" });
    const url = share.getAttribute("title")!;
    expect(url).toMatch(/\/playground\?/);
    expect(url).toMatch(/format=png/);
    expect(url).toMatch(/scale=2/);
    // defaults stay out of the link (theme blue, scale 1, svg are omitted)
    expect(url).not.toMatch(/theme=/);
    expect(url).not.toMatch(/[^-]svg/);
  });

  it("omits default slot values from the link but carries custom ones", async () => {
    await renderPlayground();
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "release" } });
    const share = screen.getByRole("button", { name: "Copy playground link" });
    const url = share.getAttribute("title")!;
    expect(url).toMatch(/label=release/);
    expect(url).not.toMatch(/value=/); // "passing" is the default → omitted
  });

  it("restores slots, icon, format and scale from a shared link", async () => {
    await renderPlayground(
      "/playground?variant=c02-08&label=deploy&value=prod&format=png&scale=3&icon=docker&mode=dark",
    );
    // deep-linked slots survive the variant-defaults reset on mount
    expect((screen.getByLabelText("Label") as HTMLInputElement).value).toBe("deploy");
    expect((screen.getByLabelText("Value") as HTMLInputElement).value).toBe("prod");
    expect(screen.getByRole("button", { name: "png" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "@3x" }).getAttribute("aria-pressed")).toBe("true");
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).toMatch(/c02-08\/deploy\/prod\?format=png&scale=3/);
    expect(pre.textContent).toMatch(/mode=dark/);
    await waitFor(() => expect(pre.textContent).toMatch(/[?&]icon=docker/));
  });
});

describe("playground batch mode (multi-selection)", () => {
  it("renders a stack of every picked badge with the shared appearance", async () => {
    await renderPlayground("/playground?variants=c01-01,c09-02&theme=rose");
    const stack = screen.getByTestId("selection-stack");
    expect(stack.textContent).toContain("c01-01");
    expect(stack.textContent).toContain("c09-02");
    // per-badge URLs + the bulk copy affordance exist
    expect(screen.getByRole("button", { name: "Copy c01-01 URL" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy c09-02 URL" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy all URLs" })).toBeTruthy();
    // slot inputs yield to the batch-mode hint (defaults per badge)
    expect(screen.queryByLabelText("Label")).toBeNull();
    // the shareable link carries the selection
    const share = screen.getByRole("button", { name: "Copy playground link" });
    expect(share.getAttribute("title")).toMatch(/variants=c01-01%2Cc09-02/);
    expect(share.getAttribute("title")).toMatch(/theme=rose/);
  });

  it("removes and clears batch entries from the chips", async () => {
    await renderPlayground("/playground?variants=c01-01,c09-02");
    fireEvent.click(screen.getByRole("button", { name: "Remove c09-02 from batch" }));
    expect(screen.getByTestId("selection-stack").textContent).not.toContain("c09-02");
    fireEvent.click(screen.getByRole("button", { name: /Clear batch \(1\)/ }));
    expect(screen.queryByTestId("selection-stack")).toBeNull();
    // single-badge editing returns
    expect(screen.getByLabelText("Label")).toBeTruthy();
  });

  it("adds the focused variant to the batch from the pill", async () => {
    await renderPlayground("/playground?variant=c05-01");
    fireEvent.click(screen.getByTestId("batch-add"));
    const chips = screen.getByRole("list", { name: "Batch selection" });
    expect(chips.textContent).toContain("c05-01");
    // adding twice must not duplicate
    fireEvent.click(screen.getByRole("button", { name: /in batch/i }));
    expect(chips.querySelectorAll("li").length).toBe(1);
  });

  it("adds and removes batch members from the combobox option rows", async () => {
    await renderPlayground("/playground");
    const input = screen.getByRole("combobox", { name: /variant/i }) as HTMLInputElement;
    fireEvent.focus(input);
    await waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("true"));

    // narrow the virtualized list first — the unfiltered dropdown mounts
    // only the first 60 of 544 rows
    fireEvent.change(input, { target: { value: "c09" } });

    // "+" on an option row toggles membership without changing the focus
    fireEvent.click(screen.getByRole("button", { name: "Add c09-01 to batch" }));
    const chips = screen.getByTestId("batch-chips");
    expect(chips.textContent).toContain("c09-01");
    // the row flipped to its checked state (toggle, not one-way add) —
    // scope to the listbox: the chip's own remove button shares the name
    const listbox = screen.getByRole("listbox", { name: "Variants" });
    fireEvent.click(within(listbox).getByRole("button", { name: "Remove c09-01 from batch" }));
    expect(screen.queryByTestId("batch-chips")).toBeNull();
  });

  it("dedupes and drops unknown ids from a shared ?variants= link", async () => {
    await renderPlayground("/playground?variants=c01-01,c01-01,bogus-99");
    const chips = screen.getByTestId("batch-chips");
    expect(chips.querySelectorAll("li").length).toBe(1);
    expect(chips.textContent).toContain("c01-01");
  });

  it("keeps the icon editor reachable in batch mode even when the focused badge has no icon slot", async () => {
    // regression lock: c01-04 is text-only (hasIcon: false) — the old
    // `variant.hasIcon &&` gate hid the ENTIRE icon section, so a batch
    // focused on a text-only badge had no way to change any icon
    await renderPlayground("/playground?variant=c01-04&variants=c01-01,c09-02");
    expect(screen.getByTestId("icon-section")).toBeTruthy();
    expect(screen.getByTestId("icon-batch-hint").textContent).toContain("all 2 selected badges");
  });

  it("applies a picked icon to the whole batch — focused URL, share link and per-row previews", async () => {
    await renderPlayground("/playground?variants=c01-01,c09-02");
    fireEvent.click(screen.getByRole("button", { name: "curated" }));
    const search = screen.getByLabelText(/icon library/i);
    fireEvent.change(search, { target: { value: "docker" } });
    const grid = await screen.findByRole("group", { name: "Icon library" });
    fireEvent.click(grid.querySelectorAll("button")[0]!);

    // the focused badge's canonical URL carries the icon…
    const pre = document.querySelector("pre code")!;
    await waitFor(() => expect(pre.textContent).toMatch(/[?&]icon=docker(&|$)/));
    // …and so does the shareable link that restores the whole workbench
    const share = screen.getByRole("button", { name: "Copy playground link" });
    await waitFor(() => expect(share.getAttribute("title")).toMatch(/icon=docker/));
    expect(share.getAttribute("title")).toMatch(/variants=c01-01%2Cc09-02/);
  });
});

describe("playground quad badges (?extra2=)", () => {
  it("exposes the fourth-segment input on the quad badge and feeds the API URL", async () => {
    await renderPlayground("/playground?variant=c17-08");
    // c17-08 "quad" is the four-segment slab: label · extra · extra2 · value
    expect(screen.getByLabelText("Extra (third segment)")).toBeTruthy();
    expect(screen.getByLabelText("Extra 2 (fourth segment)")).toBeTruthy();
    // slots reset to the variant's design defaults (a|b|c|d), which the URL
    // carries explicitly — including the fourth segment
    const pre = document.querySelector("pre code")!;
    await waitFor(() => expect(pre.textContent).toMatch(/\/badge\/slab\/c17-08\/a\/d/));
    expect(pre.textContent).toMatch(/[?&]extra=b(&|$)/);
    expect(pre.textContent).toMatch(/[?&]extra2=c(&|$)/);
    // typing overrides the fourth segment
    fireEvent.change(screen.getByLabelText("Extra 2 (fourth segment)"), {
      target: { value: "mid" },
    });
    await waitFor(() => expect(pre.textContent).toMatch(/[?&]extra2=mid(&|$)/));
  });

  it("restores extra and extra2 from a deep link without losing them to the defaults reset", async () => {
    await renderPlayground("/playground?variant=c17-08&extra=b-two&extra2=c-two");
    expect((screen.getByLabelText("Extra (third segment)") as HTMLInputElement).value).toBe("b-two");
    expect((screen.getByLabelText("Extra 2 (fourth segment)") as HTMLInputElement).value).toBe("c-two");
    const pre = document.querySelector("pre code")!;
    await waitFor(() => expect(pre.textContent).toMatch(/[?&]extra=b-two&extra2=c-two/));
  });

  it("keeps the shareable link free of default slot values", async () => {
    await renderPlayground("/playground?variant=c17-08");
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Extra 2 (fourth segment)") as HTMLInputElement).value,
      ).toBe("c"),
    );
    const share = screen.getByRole("button", { name: "Copy playground link" });
    const url = share.getAttribute("title")!;
    expect(url).toMatch(/variant=c17-08/);
    // a|b|c|d are the design defaults → omitted from the share link
    expect(url).not.toMatch(/extra2?=/);
    // a custom fourth segment rides the link
    fireEvent.change(screen.getByLabelText("Extra 2 (fourth segment)"), {
      target: { value: "9ms" },
    });
    await waitFor(() => expect(share.getAttribute("title")).toMatch(/extra2=9ms/));
  });

  it("hides the fourth-segment input on non-quad variants (tri-segment stays on extra)", async () => {
    await renderPlayground("/playground?variant=c13-13");
    expect(screen.getByLabelText("Extra (third segment)")).toBeTruthy();
    expect(screen.queryByLabelText("Extra 2 (fourth segment)")).toBeNull();
    const pre = document.querySelector("pre code")!;
    expect(pre.textContent).not.toMatch(/[?&]extra2=/);
  });
});

describe("web api layer badgeUrl (font option)", () => {
  it("keeps the SDK grammar when no font is set and appends font= for bundled fonts", async () => {
    expect(webBadgeUrl("foundational", "c01-01", "build", "passing")).toBe(
      "/badge/foundational/c01-01/build/passing",
    );
    expect(webBadgeUrl("foundational", "c01-01", "build", "passing", { font: "inter" })).toBe(
      "/badge/foundational/c01-01/build/passing?font=inter",
    );
    expect(
      webBadgeUrl("foundational", "c01-01", "build", "passing", { theme: "blue", font: "space-mono" }),
    ).toBe("/badge/foundational/c01-01/build/passing?theme=blue&font=space-mono");
  });

  it("maps font slugs to the CSS families bundled by the renderer", async () => {
    expect(badgeFontFamily("inter")).toBe("Inter");
    expect(badgeFontFamily("jetbrains-mono")).toBe("'JetBrains Mono'");
    expect(badgeFontFamily("instrument-serif")).toBe("'Instrument Serif'");
    expect(badgeFontFamily("space-mono")).toBe("'Space Mono'");
  });
});
