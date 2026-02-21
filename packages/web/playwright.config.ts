import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:1444' },
  webServer: { command: 'pnpm dev', port: 1444, reuseExistingServer: true },
});
