import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.{js,jsx}", "src/**/*.spec.{js,jsx}"],
    exclude: ["e2e/**/*", "node_modules/**/*"],
  },
});
