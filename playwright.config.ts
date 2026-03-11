import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

// Load e2e-specific env vars (falls back to .env.e2e if .env.e2e.local missing)
dotenv.config({ path: ".env.e2e.local" });
dotenv.config({ path: ".env.e2e" });

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
