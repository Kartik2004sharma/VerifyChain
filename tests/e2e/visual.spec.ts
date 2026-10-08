import { test, expect } from "@playwright/test";
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "Visual baselines use pinned Chromium; Safari behavior is tested separately.",
);
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
for (const theme of ["light", "dark"])
  test(`reviewed critical screens ${theme}`, async ({ page }, info) => {
    test.skip(
      !["desktop", "mobile"].includes(info.project.name),
      "Baseline viewport coverage is desktop and mobile; behavior covers all sizes.",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (theme) => localStorage.setItem("theme", theme),
      theme,
    );
    await page.route("**/api/health/ready", (route) =>
      route.fulfill({ status: 503, json: { ready: false } }),
    );
    for (const [name, path] of [
      ["landing", "/"],
      ["overview", "/dashboard"],
      ["verify-empty", "/verify"],
      ["register-details", "/dashboard/register-product"],
    ]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (path !== "/")
        await expect(
          page.getByRole("button", { name: "Connect wallet", exact: true }),
        ).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page).toHaveScreenshot(`${theme}-${name}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.005,
      });
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
    await expect(
      page.getByRole("heading", { name: "Review the exact commitment" }),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(`${theme}-register-review.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.005,
    });
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
      await page.goto("/verify?id=VC-001");
      await expect(page.getByTestId("passport-id")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Connect wallet", exact: true }),
      ).toBeVisible();
      if (status === "registered")
        await page
          .getByText("Inspect blockchain evidence", { exact: false })
          .click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(
        page.getByRole("region", { name: "Product passport" }),
      ).toHaveScreenshot(`${theme}-passport-${status}-panel.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.005,
      });
      await page.unroute("**/api/blockchain/verify");
    }
    if (info.project.name === "mobile") {
      await page.goto("/dashboard");
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page).toHaveScreenshot(`${theme}-drawer.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.005,
      });
    }
  });
