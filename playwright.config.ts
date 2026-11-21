import { defineConfig } from '@playwright/test';

// E2E_PORT lets several checkouts (worktrees) run the scan at once without
// one run silently reusing another checkout's preview server.
const port = Number(process.env.E2E_PORT ?? 4173);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: url },
  webServer: {
    command: `npx vite preview --port ${port} --strictPort`,
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
