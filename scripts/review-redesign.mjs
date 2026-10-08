import { chromium } from "playwright";
import fs from "node:fs";

// Review candidates, never automatically replace accepted regression images.
const output = "docs/audit-evidence/redesign-2026-10-05/candidates";
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
const base = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:3310";
const fixture = {
  productId: "VC-001",
  chainId: 11155111,
  checkedAt: "2026-10-04T12:00:00Z",
  contract: "0x1111111111111111111111111111111111111111",
  name: "Single origin coffee",
  manufacturer: {
    address: "0x2222222222222222222222222222222222222222",
    companyName: "Example test fixture",
    active: true,
    trust: "self_registered",
  },
  commitment: "0x" + "ab".repeat(32),
  uri: "ipfs://" + "a".repeat(46),
  integrity: "match",
  message: "A wallet record does not certify physical authenticity.",
  block: "100",
  registrationBlock: "80",
  transactionHash: null,
};
for (const [project, width, height] of [
  ["desktop", 1440, 900],
  ["mobile", 375, 812],
]) {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
      isMobile: project === "mobile",
      hasTouch: project === "mobile",
    });
    const page = await context.newPage();
    await page.addInitScript(
      (theme) => localStorage.setItem("theme", theme),
      theme,
    );
    await page.route("**/api/health/ready", (route) =>
      route.fulfill({ status: 503, json: { ready: false } }),
    );
    async function settled(path) {
      await page.goto(base + path);
      await page
        .getByRole("link", { name: "VerifyChain home", exact: true })
        .first()
        .waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.getByRole("heading", { level: 1 }).waitFor();
      if (path !== "/")
        await page
          .getByRole("button", { name: "Connect wallet", exact: true })
          .waitFor();
      await page.evaluate(() => scrollTo(0, 0));
    }
    async function capture(name, region = false) {
      const path = `${output}/${theme}-${name}-${project}-darwin.png`;
      if (region)
        await page
          .getByRole("region", { name: "Product passport" })
          .screenshot({ path, animations: "disabled" });
      else
        await page.screenshot({
          path,
          fullPage: name !== "drawer",
          animations: "disabled",
        });
    }
    for (const [name, path] of [
      ["landing", "/"],
      ["overview", "/dashboard"],
      ["verify-empty", "/verify"],
      ["register-details", "/dashboard/register-product"],
    ]) {
      await settled(path);
      await capture(name);
    }
    for (const [label, value] of [
      ["Product ID", "VC-001"],
      ["Product name", "Coffee"],
      ["Category", "Food"],
      ["Serial number", "001"],
      ["Origin", "India"],
    ])
      await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Review commitment" }).click();
    await page
      .getByRole("heading", { name: "Review the exact commitment" })
      .waitFor();
    await page.evaluate(() => scrollTo(0, 0));
    await capture("register-review");
    for (const status of [
      "registered",
      "revoked",
      "not_found",
      "integrity_mismatch",
      "unavailable",
    ]) {
      await page.route("**/api/blockchain/verify", (route) =>
        route.fulfill({
          status: status === "unavailable" ? 503 : 200,
          json: {
            ...fixture,
            status,
            integrity: status === "integrity_mismatch" ? "mismatch" : "match",
            contract: ["not_found", "unavailable"].includes(status)
              ? undefined
              : fixture.contract,
          },
        }),
      );
      await settled("/verify?id=VC-001");
      await page.getByTestId("passport-id").waitFor();
      if (status === "registered")
        await page
          .getByText("Inspect blockchain evidence", { exact: false })
          .click();
      await page.evaluate(() => scrollTo(0, 0));
      await capture(`passport-${status.replaceAll("_", "-")}-panel`, true);
      await page.unroute("**/api/blockchain/verify");
    }
    if (project === "mobile") {
      await settled("/dashboard");
      await page.getByRole("button", { name: "Open navigation" }).click();
      await capture("drawer");
    }
    await context.close();
  }
}
await browser.close();
console.log(
  "Captured 42 review candidates. Accepted baselines were untouched.",
);
