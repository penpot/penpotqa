import { expect } from '@playwright/test';
import { performanceTest } from '../../fixtures.js';
import { PerformancePage } from '../../pages/performance-page';

performanceTest('PERF Thumbnail renderer', async ({ page }) => {
  const performancePage = new PerformancePage(page);
  await performancePage.setup();

  // TODO: Medir el tiempo que tarda en renderizar el thumbnail.

  const content = page.locator('.frame-container > .frame-content');
  await content.waitFor();
  performance.mark('imposter:start');

  const imposter = page.locator('.frame-container > .frame-imposter');
  await imposter.waitFor();
  performance.mark('imposter:end');

  const measure = performance.measure('imposter', 'imposter:start', 'imposter:end');
  console.log(measure.duration, measure.entryType, measure.name);

  const [averageFrameRate, averageLongTaskDuration] =
    await performancePage.measure();

  expect(averageFrameRate).toBeGreaterThan(55);
  expect(averageFrameRate).toBeLessThan(65);
  expect(averageLongTaskDuration).toBeLessThan(0.5);
});
