import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [
      ["**/*.ui.test.tsx", "jsdom"],
      ["**/*.integration.test.tsx", "jsdom"],
    ],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["e2e/**"],
    setupFiles: ["src/test/setup.ts"],
    clearMocks: true,
  },
});
