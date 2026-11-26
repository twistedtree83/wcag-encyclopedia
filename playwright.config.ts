import { defineConfig } from '@playwright/test';

// E2E_PORT lets several checkouts (worktrees) run the scan at once without
// one run silently reusing another checkout's preview server.
const port = Number(process.env.E2E_PORT ?? 4173);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // E2E_WORKERS: Playwright workers. 6 suits one suite on a 10-core machine; set 2 when several
  // checkouts run the suite at once, or tests fail on the 30s timeout.
  workers: Number(process.env.E2E_WORKERS ?? 6),
  // One local retry absorbs load flakes; scripts/flaky.mjs lists them so they stay visible.
  retries: process.env.CI ? 0 : 1,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: { baseURL: url },
  webServer: {
    command: `npx vite preview --port ${port} --strictPort`,
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
