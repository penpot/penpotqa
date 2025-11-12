import { expect } from '@playwright/test';
import { performanceTest } from '../../fixtures.js';
import { PerformancePage } from '../../pages/performance-page';

performanceTest(
  'PERF Viewport: Pan viewport in workspace',
  {
    tag: '@perf',
  },
  async ({ page }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.waitForPageLoaded();
    await performancePage.injectFrameRateRecorder();
    await performancePage.waitForViewportControls();
    await performancePage.startAll();
    await performancePage.pan(10, 0, 10);
    await performancePage.pan(0, 10, 10);
    await performancePage.pan(-10, 0, 10);
    await performancePage.pan(0, -10, 10);
    const [frameRateRecords, longTasksRecords] = await performancePage.stopAll();
    const averageFrameRate =
      performancePage.calculateAverageFrameRate(frameRateRecords);
    console.log('FPS', averageFrameRate);
    expect(averageFrameRate).toBeGreaterThan(30);
    const averageLongTaskDuration =
      performancePage.calculateAverageLongTaskDuration(longTasksRecords);
    console.log('LTS', averageLongTaskDuration);
    expect(averageLongTaskDuration).toBeLessThan(100);
  },
);

performanceTest(
  'PERF Viewport: Zoom viewport in workspace',
  {
    tag: '@perf',
  },
  async ({ page }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.waitForPageLoaded();
    await performancePage.injectFrameRateRecorder();
    await performancePage.waitForViewportControls();
    await performancePage.startAll();
    await performancePage.zoom(10, 10);
    await performancePage.zoom(-10, 10);
    const [frameRateRecords, longTasksRecords] = await performancePage.stopAll();
    const averageFrameRate =
      performancePage.calculateAverageFrameRate(frameRateRecords);
    console.log('FPS', averageFrameRate);
    expect(averageFrameRate).toBeGreaterThan(30);
    const averageLongTaskDuration =
      performancePage.calculateAverageLongTaskDuration(longTasksRecords);
    console.log('LTS', averageLongTaskDuration);
    expect(averageLongTaskDuration).toBeLessThan(100);
  },
);
