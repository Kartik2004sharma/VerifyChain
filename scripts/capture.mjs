import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("docs/audit-evidence/visuals", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
for (const [name, url] of [
  ["landing", "/"],
  ["verify", "/verify"],
  ["register", "/dashboard/register-product"],
  ["overview", "/dashboard"],
]) {
  await page.goto(`http://127.0.0.1:3100${url}`);
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.screenshot({
    path: `docs/audit-evidence/visuals/${name}-desktop.png`,
    fullPage: true,
  });
}
await page.setViewportSize({ width: 375, height: 812 });
await page.goto("http://127.0.0.1:3100/");
await page.screenshot({
  path: "docs/audit-evidence/visuals/landing-mobile.png",
  fullPage: true,
});
await page.goto("http://127.0.0.1:3100/verify");
await page.screenshot({
  path: "docs/audit-evidence/visuals/verify-mobile.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Open navigation" }).click();
await page.screenshot({
  path: "docs/audit-evidence/visuals/drawer-mobile.png",
});
await browser.close();
