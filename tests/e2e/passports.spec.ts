import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
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
async function service(page: Page) {
  await page.route("**/api/health/ready", (route) =>
    route.fulfill({ status: 503, json: { ready: false } }),
  );
}
const routes = [
  "/",
  "/dashboard",
  "/verify",
  "/dashboard/register-product",
  "/dashboard/register-manufacturer",
  "/dashboard/supply-chain",
  "/dashboard/verification-history",
  "/dashboard/analytics",
  "/dashboard/verification-analytics",
  "/dashboard/settings",
];
test("appearance control works on the new home and persists into the workspace", async ({
  page,
}) => {
  await service(page);
  await page.addInitScript(() => {
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "light");
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark appearance" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/dashboard/register-product");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Switch to light appearance" })
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
for (const route of routes)
  test(`route, responsive and accessible ${route}`, async ({ page }) => {
    await service(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const expected =
        msg.location().url.endsWith("/api/health/ready") &&
        msg.text().includes("status of 503");
      if (!expected) errors.push(msg.text());
    });
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
for (const [status, label, integrity] of [
  ["registered", "Registered on Sepolia", "match"],
  ["revoked", "Registration revoked", "match"],
  ["not_found", "Record not found", undefined],
  ["integrity_mismatch", "Metadata mismatch", "mismatch"],
  ["unavailable", "Verification unavailable", undefined],
] as const)
  test(`public result ${status}`, async ({ page }) => {
    await service(page);
    await page.route("**/api/blockchain/verify", (route) =>
      route.fulfill({
        status: status === "unavailable" ? 503 : 200,
        json: {
          ...fixture,
          status,
          integrity,
          contract:
            status === "not_found" || status === "unavailable"
              ? undefined
              : fixture.contract,
        },
      }),
    );
    await page.goto("/verify?id=VC-001");
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("passport-id")).toHaveText("VC-001");
    await expect(
      page.getByText("Connect wallet", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toEqual([]);
  });
test("manual lookup retains ID and outage allows retry", async ({ page }) => {
  await service(page);
  let calls = 0;
  await page.route("**/api/blockchain/verify", (route) => {
    calls++;
    return route.fulfill({
      status: 503,
      json: { error: "Rate limit exceeded" },
    });
  });
  await page.goto("/verify");
  await page.getByLabel("Product ID", { exact: true }).fill("VC-001");
  await page
    .getByRole("button", { name: "Verify product", exact: true })
    .click();
  await expect(
    page.getByText("Rate limit exceeded", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Product ID", { exact: true })).toHaveValue(
    "VC-001",
  );
  await page
    .getByRole("button", { name: "Verify product", exact: true })
    .click();
  await expect.poll(() => calls).toBe(2);
});
test("registration reviews canonical metadata without pretending a write happened", async ({
  page,
}) => {
  await service(page);
  await page.goto("/dashboard/register-product");
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
  await expect(
    page.getByRole("button", { name: "Upload & register" }),
  ).toBeDisabled();
  await expect(page.getByText("Not uploaded yet")).toBeVisible();
  await page.getByRole("button", { name: "Edit details" }).click();
  await expect(page.getByLabel("Product ID", { exact: true })).toHaveValue(
    "VC-001",
  );
});
test("mobile drawer keyboard focus and all routes", async ({ page }) => {
  await service(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Settings", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Make the evidence comfortable." }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("combobox", { name: "Appearance", exact: true })
    .selectOption("dark");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Appearance", exact: true }),
  ).toHaveValue("dark");
  await page.getByLabel("Compact record spacing").check();
  await page.reload();
  await expect(page.getByLabel("Compact record spacing")).toBeChecked();
});
test("history controls filter actual fixture data and reconcile counts", async ({
  page,
}) => {
  await service(page);
  await page.route("**/api/history?*", (route) =>
    route.fulfill({
      json: [
        {
          verifier: "0x1111",
          timestamp: "1791110000",
          result: true,
          confidenceScore: 81,
          location: "",
          proofHash: fixture.commitment,
          blockNumber: "100",
        },
        {
          verifier: "0x2222",
          timestamp: "1791110100",
          result: false,
          confidenceScore: 22,
          location: "",
          proofHash: fixture.commitment,
          blockNumber: "101",
        },
      ],
    }),
  );
  await page.goto("/dashboard/verification-history");
  await page.getByLabel("Product ID").fill("VC-001");
  await page.getByRole("button", { name: "Load observations" }).click();
  await expect(
    page.getByRole("cell", { name: "Positive", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Negative", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Submitted result").selectOption("negative");
  await expect(
    page.getByRole("cell", { name: "Positive", exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Negative", exact: true }),
  ).toBeVisible();
});
test("reduced motion and 320px fallback", async ({ page }) => {
  await service(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/verify");
  await expect(
    page.getByRole("button", { name: "Verify product", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("landing CTA carries Unicode ID into public lookup", async ({ page }) => {
  await service(page);
  await page.route("**/api/blockchain/verify", (route) =>
    route.fulfill({
      json: { ...fixture, status: "registered", productId: "界/01" },
    }),
  );
  await page.goto("/");
  await page.getByLabel("Find a product passport").fill("界/01");
  await page.getByRole("button", { name: "Verify product ID" }).click();
  await expect(page.getByTestId("passport-id")).toHaveText("界/01");
});

test("one injected wallet state handles wrong-chain rejection, switch and disconnect", async ({
  page,
}) => {
  await service(page);
  await page.addInitScript(() => {
    let chain = "0x1";
    let connected = false;
    let rejectSwitch = true;
    const listeners = new Map<string, Array<(value: unknown) => void>>();
    const account = "0x2222222222222222222222222222222222222222";
    Object.defineProperty(window, "ethereum", {
      value: {
        isMetaMask: true,
        on: (name: string, callback: (value: unknown) => void) =>
          listeners.set(name, [...(listeners.get(name) ?? []), callback]),
        removeListener: (name: string, callback: (value: unknown) => void) =>
          listeners.set(
            name,
            (listeners.get(name) ?? []).filter((c) => c !== callback),
          ),
        request: async ({ method }: { method: string }) => {
          if (method === "eth_requestAccounts") {
            connected = true;
            return [account];
          }
          if (method === "eth_accounts") return connected ? [account] : [];
          if (method === "eth_chainId") return chain;
          if (method === "wallet_switchEthereumChain") {
            if (rejectSwitch) {
              rejectSwitch = false;
              throw { code: 4001, message: "User rejected network switch" };
            }
            chain = "0xaa36a7";
            for (const cb of listeners.get("chainChanged") ?? []) cb(chain);
            return null;
          }
          if (method === "wallet_getPermissions") return [];
          if (method === "wallet_requestPermissions")
            return [{ parentCapability: "eth_accounts" }];
          if (method === "wallet_revokePermissions") {
            connected = false;
            return null;
          }
          throw new Error(`Unexpected wallet request ${method}`);
        },
      },
    });
  });
  await page.goto("/dashboard/register-product");
  await page.getByLabel("Product ID", { exact: true }).fill("KEEP-ME");
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Switch to Sepolia" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to Sepolia" }).click();
  await expect(
    page.getByRole("button", { name: "Switch to Sepolia" }),
  ).toBeVisible();
  await expect(page.getByLabel("Product ID", { exact: true })).toHaveValue(
    "KEEP-ME",
  );
  await page.getByRole("button", { name: "Switch to Sepolia" }).click();
  await expect(page.getByRole("button", { name: /Disconnect/ })).toBeVisible();
  if (await page.getByRole("button", { name: "Open navigation" }).isVisible()) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: "Verify a product", exact: true })
    .click();
  await expect(page).toHaveURL(/\/verify$/);
  await expect(page.getByRole("button", { name: /Disconnect/ })).toBeVisible();
  await page.getByRole("button", { name: /Disconnect/ }).click();
  await expect(
    page.getByRole("button", { name: "Connect wallet", exact: true }),
  ).toBeVisible();
});

test("camera denial leaves manual entry usable", async ({ page }) => {
  await service(page);
  // Denial is explicit: WebKit can otherwise wait indefinitely for a prompt.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        enumerateDevices: async () => [],
        getUserMedia: async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        },
      },
      configurable: true,
    });
  });
  await page.goto("/verify");
  expect(
    await page.evaluate(() => navigator.mediaDevices.getUserMedia.toString()),
  ).toContain("Permission denied");
  await page.getByRole("button", { name: "Scan QR with camera" }).click();
  await expect(
    page.getByRole("button", { name: "Close camera" }),
  ).toBeVisible();
  await expect(
    page.getByText("Camera unavailable or permission denied.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close camera" }).click();
  await expect(page.getByLabel("Product ID", { exact: true })).toBeVisible();
});

test("dark theme result and keyboard evidence inspection", async ({ page }) => {
  await service(page);
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.route("**/api/blockchain/verify", (route) =>
    route.fulfill({ json: { ...fixture, status: "registered" } }),
  );
  await page.goto("/verify?id=VC-001");
  await expect(
    page.getByText("Registered on Sepolia", { exact: true }).first(),
  ).toBeVisible();
  await page.getByText("Inspect blockchain evidence", { exact: false }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Registration block", { exact: true }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe(
    "BODY",
  );
});

test("skip link is usable by keyboard and API not-found shows no registrant", async ({
  page,
  browserName,
}) => {
  await service(page);
  await page.route("**/api/blockchain/verify", (route) =>
    route.fulfill({
      json: {
        status: "not_found",
        productId: "UNKNOWN",
        chainId: 11155111,
        contract: fixture.contract,
        block: "100",
        checkedAt: fixture.checkedAt,
        message: "No registration exists for this ID.",
      },
    }),
  );
  await page.goto("/verify?id=UNKNOWN");
  await expect(page.getByTestId("passport-id")).toHaveText("UNKNOWN");
  await expect(page.getByText("REGISTRANT", { exact: true })).not.toBeVisible();
  // Safari's default macOS navigation uses Option–Tab to include links.
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => location.hash)).toBe("#content");
});
