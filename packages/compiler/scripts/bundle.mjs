// Bundles the compiler's TS entrypoints to runnable ESM with esbuild
// (automatic JSX runtime), so the build runs on plain Node.
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "../dist");
mkdirSync(dist, { recursive: true });

const common = {
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  target: "node24",
  sourcemap: "inline",
  external: ["react", "react-dom", "node:*"],
};

await build({ ...common, entryPoints: [join(here, "../src/build.ts")], outfile: join(dist, "build.mjs") });
await build({ ...common, entryPoints: [join(here, "../src/verify.ts")], outfile: join(dist, "verify.mjs") });
console.log("compiler bundled");
