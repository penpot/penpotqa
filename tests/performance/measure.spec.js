import { expect, test } from '@playwright/test'
import { PerformancePage } from '../../pages/performance-page'

function waitForSeconds(timeInSeconds) {
  return new Promise((resolve) => setTimeout(() => resolve(), timeInSeconds * 1000));
}

test('PERF Measure frames per second', async ({ page }) => {
  const performancePage = new PerformancePage(page);
  await performancePage.injectFrameRateRecorder();
  await performancePage.startRecordingFrameRate();
  await waitForSeconds(3);
  const records = await performancePage.stopRecordingFrameRate();
  // This is an example of how to use the performance page
  // API, in idle time we should have average ~60 frames per second.
  const averageFrameRate = records.reduce((acc, record) => acc + record.value, 0) / records.length;
  expect(averageFrameRate).toBeGreaterThan(55);
  expect(averageFrameRate).toBeLessThan(65);
})

test('PERF Measure long tasks', async ({ page }) => {
  const performancePage = new PerformancePage(page);
  await performancePage.startObservingLongTasks();
  await waitForSeconds(3);
  const records = await performancePage.stopObservingLongTasks();
  // This is an example of how to use the performance page
  // API, in idle time we should have no long tasks.
  expect(records.length).toBe(0);
});
