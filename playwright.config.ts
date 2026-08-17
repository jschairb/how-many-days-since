import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// The port is derived from this checkout's path, so two checkouts or
// worktrees of the repo never share one. Reusing a server stays safe:
// whatever answers on this port is running this checkout's code.
const checkout = fileURLToPath(new URL('.', import.meta.url));
const port = 4400 + (parseInt(createHash('sha256').update(checkout).digest('hex').slice(0, 8), 16) % 1000);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
