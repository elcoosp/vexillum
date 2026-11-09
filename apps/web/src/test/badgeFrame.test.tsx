import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, cleanup } from "@testing-library/react";
import { BadgeFrame, BADGE_PAD_PX } from "@/components/BadgeFrame";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * The frame contract after the zoom-fit rework: every badge renders inside
 * the same transparent pad the API bytes carry (BADGE_PAD_PX === the
 * server's DEFAULT_PAD_PX); oversized badges zoom-fit their card instead of
 * scrolling (no scrollbars, animations keep running); badges that already
 * fit render at exact 1:1, pixel-faithful to the API bytes.
 */
class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
    MockResizeObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  trigger() {
    this.cb([], this as unknown as ResizeObserver);
  }
}

beforeEach(() => {
  MockResizeObserver.instances = [];
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = MockResizeObserver;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  cleanup();
});

describe("BadgeFrame", () => {
  it("pads every side with the API presentation pad (18px)", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    const { container } = render(
      <BadgeFrame>
        <div>build passing</div>
      </BadgeFrame>,
    );
    const frame = container.querySelector('[data-vx-frame="fit"]') as HTMLElement;
    expect(frame).toBeTruthy();
    expect(frame.style.padding).toBe(`${BADGE_PAD_PX}px`);
    expect(BADGE_PAD_PX).toBe(18); // mirrors the server's DEFAULT_PAD_PX
  });

  it("zooms an oversized badge down to fit its card (no scrollbar)", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(336); // avail = 336 - 36 = 300
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(750);
    const { container } = render(
      <BadgeFrame>
        <div>marquee</div>
      </BadgeFrame>,
    );
    const frame = container.querySelector('[data-vx-frame="fit"]') as HTMLElement;
    const inner = container.querySelector("[data-vx-fit]") as HTMLElement;
    // scrolling is gone; the frame clips only at the same edge the server
    // bitmap clips at (the outside of the pad)
    expect(frame.className).toContain("overflow-hidden");
    expect(frame.className).not.toContain("overflow-x-auto");
    expect(inner.style.zoom).toBe("0.4"); // 300 / 750
  });

  it("keeps fitting badges at exact 1:1 (no zoom distortion)", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    const { container } = render(
      <BadgeFrame>
        <div>build</div>
      </BadgeFrame>,
    );
    const inner = container.querySelector("[data-vx-fit]") as HTMLElement;
    expect(inner.style.zoom).toBe("1");
  });

  it("re-fits when the ResizeObserver fires (window resize / label edits)", () => {
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    const offsetWidth = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    const { container } = render(
      <BadgeFrame>
        <div>build</div>
      </BadgeFrame>,
    );
    const inner = container.querySelector("[data-vx-fit]") as HTMLElement;
    expect(inner.style.zoom).toBe("1");
    // the card narrows and the badge grows
    clientWidth.mockReturnValue(236); // avail = 200
    offsetWidth.mockReturnValue(800);
    act(() => {
      MockResizeObserver.instances[0].trigger();
    });
    expect(inner.style.zoom).toBe("0.25"); // 200 / 800
  });

  it("overhanging decorations stay inside the pad room (seal hangs left)", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    const { container } = render(
      <BadgeFrame>
        <div style={{ position: "relative" }}>
          badge
          <span data-seal style={{ position: "absolute", left: -14 }} />
        </div>
      </BadgeFrame>,
    );
    const frame = container.querySelector('[data-vx-frame="fit"]') as HTMLElement;
    expect(frame).toBeTruthy();
    // no height reservation, no scale host — the pad is the room
    expect(frame.style.height).toBe("");
  });

  it("passes frame style through (the dark-mode preview surface)", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    const { container } = render(
      <BadgeFrame style={{ background: "oklch(0.2 0.01 260)" }}>
        <div>badge</div>
      </BadgeFrame>,
    );
    const frame = container.querySelector('[data-vx-frame="fit"]') as HTMLElement;
    expect(frame.style.background).toContain("oklch");
    // padding survives the style merge
    expect(frame.style.padding).toBe(`${BADGE_PAD_PX}px`);
  });

  it("keeps working in SSR markup (no measurement, no crash)", () => {
    const html = renderToStaticMarkup(
      <BadgeFrame>
        <div>badge</div>
      </BadgeFrame>,
    );
    expect(html).toContain("data-vx-frame");
    expect(html).toContain("badge");
    // the old scrolling frame is gone from the markup contract too
    expect(html).not.toContain("overflow-x-auto");
  });
});
