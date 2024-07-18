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
  snapshotPathTemplate: `{testDir}/{testFileDir}/{testFileName}-snapshots/win32/{projectName}/{arg}{ext}`,
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: process.env.CI ? 60 * 1000 : 80 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
    maxDiffPixels: 30,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter:  process.env.CI
    ? [
      ['html'],
      ['playwright-qase-reporter',
        {
          logging: true,
        },
      ],
    ]
    : [['html']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 15 * 1000,
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
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
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
      launchOptions: {
        firefoxUserPrefs: {
          'dom.events.asyncClipboard.readText': true,
          'dom.events.testing.asyncClipboard': true,
        },
      },
      contextOptions: {
        // chromium-specific permissions
        permissions: ['clipboard-read', 'clipboard-write'],
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
