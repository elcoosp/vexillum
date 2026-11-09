import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // the wasm module needs to be treated as an asset
  optimizeDeps: { exclude: ["@takumi-rs/wasm"] },
});
