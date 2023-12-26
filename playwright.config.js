/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  snapshotPathTemplate: `{testDir}/{testFileDir}/{testFileName}-snapshots/{projectName}/{arg}{ext}`,
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: process.env.CI ? 60 * 1000 : 50 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 2,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL,
    headless: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'on',
  },
  projects: [
    {
      name: 'chrome',
      expect: {
        toHaveScreenshot: {
          maxDiffPixelRatio: 0.01,
        },
      },
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: {
          height: 969,
          width: 1920,
        },
        launchOptions: {
          ignoreDefaultArgs: ['--hide-scrollbars'],
        },
      },
    },
    {
      name: 'firefox',
      expect: {
        toHaveScreenshot: {
          maxDiffPixelRatio: 0.01,
        },
      },
      use: {
        browserName: 'firefox',
        viewport: {
          height: 969,
          width: 1920,
        },
      },
    },
    {
      name: 'webkit',
      expect: {
        toHaveScreenshot: {
          maxDiffPixelRatio: 0.01,
        },
      },
      use: {
        browserName: 'webkit',
        viewport: {
          height: 969,
          width: 1920,
        },
      },
    },
  ],
};

module.exports = config;
