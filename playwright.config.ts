import { defineConfig, devices } from "@playwright/test";


const browsers = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];

const uiProjects = browsers.map((browser) => ({
  name: `travel-ui-${browser.name}`,
  testMatch: /.*ui\/.*\.spec\.ts/,
  use: {
    ...browser.device,
    baseURL: 'https://ostrovok.ru/',
  },
}));

export default defineConfig({
  webServer: {
    command: 'npx tsx server.ts',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  testDir: "./tests",

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [["html", { open: "never" }]],

  use: {
    trace: "on-first-retry",

    locale: 'ru-RU',

    timezoneId: 'Europe/Moscow',

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "fintech",
      testMatch: /.*api\/.*\.spec\.ts/,
      use: {
        baseURL: "http://127.0.01:3000",
      },
    },

    ...uiProjects,


    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
