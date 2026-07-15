import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  snapshotPathTemplate: `{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}`,
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: process.env.CI ? 120 * 1000 : 80 * 1000,
  globalTeardown: './tests/global.teardown.ts',
  globalSetup: './tests/global.setup.ts',
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 15000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.001,
      maxDiffPixels: 30,
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 3,
  /* Directory where test artifacts are stored */
  outputDir: 'test-results',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['list'], // Shows each test as it runs with timing
        ['github'], // GitHub Actions annotations
        ['html'],
        ['json', { outputFile: 'playwright-report/results.json' }],
        [
          'playwright-qase-reporter',
          {
            mode: process.env.QASE_MODE ?? 'off',
            environment: 'PRE',
            testops: {
              api: {
                token: process.env.QASE_API_TOKEN,
              },
              project: process.env.QASE_PROJECT_CODE,
              run: {
                title: `[Automated] PRE Chrome Daily - ${new Date().toISOString().split('T')[0]}`,
                description: 'PRE_chrome_daily',
                complete: true,
                tags: ['automated'],
              },
              uploadAttachments: true,
              showPublicReportLink: true,
            },
            framework: {
              browser: {
                addAsParameter: true,
                parameterName: 'Browser',
              },
              markAsFlaky: true,
            },
          },
        ],
      ]
    : [['html'], ['json', { outputFile: 'playwright-report/results.json' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 15 * 1000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL,
    headless: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'on-first-retry' : 'on',
    video: process.env.CI ? 'on-first-retry' : 'on',
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    /* Default viewport for all projects */
    viewport: {
      height: 969,
      width: 1920,
    },
  },
  projects: [
    {
      name: 'chrome',
      expect: {
        toHaveScreenshot: {
          maxDiffPixelRatio: 0.0001,
        },
      },
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        launchOptions: {
          ignoreDefaultArgs: ['--hide-scrollbars'],
          args: ['--headless=new'], // Use new headless mode
        },
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
    },
  ],
});
