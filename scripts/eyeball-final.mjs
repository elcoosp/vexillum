// Eyeball pass: boot the vite dev server, screenshot the reworked pages.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const SHOTS = "/home/z/my-project/shots";
mkdirSync(SHOTS, { recursive: true });

const server = spawn("npx", ["vite", "--port", "5199", "--strictPort"], {
  cwd: "/home/z/my-project/vexillum/apps/web",
  stdio: "pipe",
});
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error("vite boot timeout")), 30000);
  server.stdout.on("data", (d) => {
    if (String(d).includes("Local:")) { clearTimeout(t); resolve(null); }
  });
  server.stderr.on("data", (d) => process.stderr.write(d));
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

const routes = [
  ["/", "landing"],
  ["/docs", "docs"],
  ["/login", "login"],
  ["/dashboard", "dashboard-signedout"],
  ["/explore", "explore"],
];
for (const [route, name] of routes) {
  await page.goto(`http://localhost:5199${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/final-${name}.png`, fullPage: name === "docs" ? false : true });
  console.log(`shot ${name}`);
}

console.log("console/page errors:", errors.length ? errors : "none");
await browser.close();
server.kill();
process.exit(0);
