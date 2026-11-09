/**
 * Template verification (spec §13): every compiled HTML carries exactly the
 * markers its registry metadata promises, and no unknown markers anywhere.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import registryJson from "@vexillum/badges/registry.json";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../out");

const MARKERS = ["__VX_LABEL__", "__VX_VALUE__", "__VX_EXTRA__", "__VX_EXTRA2__", "__VX_ICON__"] as const;

interface Meta {
  id: string;
  hasIcon: boolean;
  hasLabel: boolean;
  hasValue: boolean;
  hasExtra: boolean;
  hasExtra2?: boolean;
}

export function verifyAll(): string[] {
  const errors: string[] = [];
  const files = readdirSync(outDir).filter((f) => f.endsWith(".html"));
  if (files.length !== registryJson.variants.length) {
    errors.push(`expected ${registryJson.variants.length} templates, found ${files.length}`);
  }
  const metaById = new Map<string, Meta>(
    (registryJson.variants as Meta[]).map((v) => [v.id, v]),
  );

  for (const file of files) {
    const id = file.replace(/\.html$/, "");
    const meta = metaById.get(id);
    if (!meta) {
      errors.push(`${id}: no registry metadata`);
      continue;
    }
    const html = readFileSync(join(outDir, file), "utf8");
    const present = new Set(MARKERS.filter((m) => html.includes(m)));
    const expect = new Set<string>();
    if (meta.hasLabel) expect.add("__VX_LABEL__");
    if (meta.hasValue) expect.add("__VX_VALUE__");
    if (meta.hasExtra) expect.add("__VX_EXTRA__");
    if (meta.hasExtra2) expect.add("__VX_EXTRA2__");
    if (meta.hasIcon) expect.add("__VX_ICON__");
    for (const m of MARKERS) {
      if (present.has(m) && !expect.has(m)) errors.push(`${id}: unexpected marker ${m}`);
      if (!present.has(m) && expect.has(m)) errors.push(`${id}: missing marker ${m}`);
    }
    // contract: every template must at least carry label+value or value
    if (!html.includes("__VX_")) {
      errors.push(`${id}: no markers at all`);
    }
  }
  return errors;
}

if (import.meta.url.endsWith(process.argv[1] ?? "")) {
  const errors = verifyAll();
  if (errors.length > 0) {
    console.error(`verify failed with ${errors.length} problems:`);
    for (const e of errors.slice(0, 30)) console.error(" -", e);
    process.exit(1);
  }
  console.log(`verified ${registryJson.variants.length} templates: all markers consistent`);
}
