import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { playwright } from "@vitest/browser-playwright";

/**
 * ONE test config for the whole app — every unit and e2e test runs in a REAL
 * browser (Playwright-driven Chromium) via Vitest browser mode. This repo
 * ships zero jsdom: DOM behavior, layout, ResizeObserver, fetch, CSS — all
 * exercised against the same engine users get (see
 * https://vitest.dev/guide/comparisons.html for why browser mode beats
 * simulating a browser).
 *
 * The dev-time same-origin API proxy (/v1, /badge, /health) stays for `vite
 * dev`: the OAuth session cookie (HttpOnly, SameSite=Lax) works without any
 * CORS dance in development.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: {
    proxy: {
      "/v1": { target: "http://localhost:8080", changeOrigin: true },
      "/badge": { target: "http://localhost:8080", changeOrigin: true },
      "/health": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  test: {
    globals: true,
    include: ["src/test/**/*.test.{ts,tsx}", "src/e2e/**/*.test.tsx"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: "chromium" }],
    },
  },
});
