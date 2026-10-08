import { spawn } from "node:child_process";
const rpc = "http://127.0.0.1:8547";
const chain = spawn(
  process.execPath,
  [
    "node_modules/hardhat/internal/cli/cli.js",
    "node",
    "--hostname",
    "127.0.0.1",
    "--port",
    "8547",
  ],
  {
    env: { ...process.env, LOCAL_TEST_CHAIN: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let chainErrors = "";
chain.stderr.on("data", (v) => {
  chainErrors += String(v);
});
chain.stdout.on("data", () => {});
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (chain.exitCode !== null) throw new Error("Local test chain exited");
    try {
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_chainId",
          params: [],
        }),
      });
      if ((await r.json()).result === "0xaa36a7") {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) throw new Error("Local test chain did not start");
  const test = spawn(
    process.execPath,
    [
      "node_modules/vitest/vitest.mjs",
      "run",
      "--config",
      "vitest.integration.config.ts",
    ],
    { env: { ...process.env, LOCAL_INTEGRATION_RPC: rpc }, stdio: "inherit" },
  );
  process.exitCode = await new Promise((r) => test.on("exit", r));
} catch (e) {
  console.error(e.message);
  if (chainErrors) console.error(chainErrors);
  process.exitCode = 1;
} finally {
  chain.kill("SIGTERM");
}
