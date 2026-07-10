const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/api',
  timeout: 45 * 1000,
  fullyParallel: false,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'cd backend && npm start',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
