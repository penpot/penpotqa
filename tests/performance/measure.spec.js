import { expect, test } from '@playwright/test';
import { PerformancePage } from '../../pages/performance-page';

function waitForSeconds(timeInSeconds) {
  return new Promise((resolve) => setTimeout(() => resolve(), timeInSeconds * 1000));
}

test(
  'PERF Measure frames per second',
  {
    tag: '@perf',
  },
  async ({ page }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.injectFrameRateRecorder();
    await performancePage.startRecordingFrameRate();
    await waitForSeconds(3);
    const records = await performancePage.stopRecordingFrameRate();
    // This is an example of how to use the performance page
    // API, in idle time we should have average ~60 frames per second.
    const averageFrameRate =
      records.reduce((acc, record) => acc + record.value, 0) / records.length;
    expect(averageFrameRate).toBeGreaterThan(55);
    expect(averageFrameRate).toBeLessThan(65);
  },
);

test(
  'PERF Measure locking (frames per second ~= 0)',
  {
    tag: '@perf',
  },
  async ({ page }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.injectFrameRateRecorder();
    await performancePage.startRecordingFrameRate();
    // Do something intensive that "locks" the main thread.
    await page.evaluate(() => {
      const start = performance.now();
      while (performance.now() - start < 3000) {
        // Do nothing. Just locks the main thread
      }
    });
    const records = await performancePage.stopRecordingFrameRate();
    // If frame rate is less than 5 frames per second we can assume
    // that the main thread was locked.
    records.some((record) => expect(record.value).toBeLessThan(5));
  },
);

test(
  'PERF Measure long tasks',
  {
    tag: '@perf',
  },
  async ({ page }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.startObservingLongTasks();
    await waitForSeconds(3);
    const records = await performancePage.stopObservingLongTasks();
    // This is an example of how to use the performance page
    // API, in idle time we should have no long tasks.
    expect(records.length).toBe(0);
  },
);
