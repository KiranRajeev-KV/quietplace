import { defineConfig } from '@playwright/test';
const target = process.env.TEST_URL;
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: target ?? 'http://localhost:4173',
    headless: true,
    extraHTTPHeaders: process.env.SITES_TEST_AUTH
      ? { 'OAI-Sites-Authorization': `Bearer ${process.env.SITES_TEST_AUTH}` }
      : {},
  },
  webServer: target
    ? undefined
    : {
        command: 'pnpm preview --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
      },
  reporter: [['list'], ['html', { open: 'never' }]],
});
