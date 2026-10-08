import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      "server-only": path.resolve(
        import.meta.dirname,
        "tests/unit/server-only.ts",
      ),
    },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 60000,
    environment: "node",
  },
});
