import { expect } from '@playwright/test';
import { performanceTest } from '../../fixtures.js';
import { PerformancePage } from '../../pages/performance-page';

performanceTest(
  'PERF Shape (single): Move single shape',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    // IMPORTANT: We need to set the click position because we can have
    // shapes overlapping each other and we need to make sure we click
    // the right one.
    await performancePage.selectShape(workingShapes.singleId, { x: 5, y: 10 });
    await performancePage.zoom(-10, 10);
    await performancePage.moveShapeBy(workingShapes.singleId, -100, -100, {
      x: 5,
      y: 10,
      steps: 100,
    });

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (single): Rotate single shape',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    // IMPORTANT: We need to set the click position because we can have
    // shapes overlapping each other and we need to make sure we click
    // the right one.
    await performancePage.selectShape(workingShapes.singleId, { x: 5, y: 10 });
    await performancePage.zoom(-10, 10);
    await performancePage.rotateShapeBy(workingShapes.singleId, 45);

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (single): Scale single shape',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    // IMPORTANT: We need to set the click position because we can have
    // shapes overlapping each other and we need to make sure we click
    // the right one.
    await performancePage.selectShape(workingShapes.singleId, { x: 5, y: 10 });
    await performancePage.zoom(-10, 10);
    await performancePage.scaleShapeBy(workingShapes.singleId, 100, 100);

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (multiple): Move multiple shapes',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    await performancePage.selectFrame(workingShapes.multipleFrameTitleId);
    await performancePage.selectShapes(workingShapes.multipleIds);
    await performancePage.zoom(-10, 10);
    await performancePage.moveSelectedBy(100, 100);

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (multiple): Rotate multiple shapes',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    await performancePage.selectFrame(workingShapes.multipleFrameTitleId);
    await performancePage.selectShapes(workingShapes.multipleIds);
    await performancePage.zoom(-10, 10);
    await performancePage.rotateSelectedBy(45);

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (multiple): Scale multiple shapes',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    await performancePage.selectFrame(workingShapes.multipleFrameTitleId);
    await performancePage.selectShapes(workingShapes.multipleIds);
    await performancePage.zoom(-10, 10);
    await performancePage.scaleSelectedBy(100, 100);

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (frame): Move frame nested shapes',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    await performancePage.selectShape(workingShapes.frameTitleId, { x: 2, y: 2 });
    await performancePage.zoom(-10, 10);
    await performancePage.moveShapeBy(workingShapes.frameId, 100, 100, {
      x: 5,
      y: 50,
      steps: 100,
    });

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (frame): Rotate frame nested shapes',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    await performancePage.selectShape(workingShapes.frameTitleId, {
      x: 2,
      y: 2,
    });
    await performancePage.zoom(-10, 10);
    await performancePage.rotateShapeBy(workingShapes.frameId, 100, 100, {
      x: 2,
      y: 2,
      steps: 100,
    });

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);

performanceTest(
  'PERF Shape (frame): Scale frame nested shapes',
  {
    tag: '@perf',
  },
  async ({ page, workingShapes }) => {
    const performancePage = new PerformancePage(page);
    await performancePage.setup();

    await performancePage.selectPage(workingShapes.pageId);
    await performancePage.selectShape(workingShapes.frameTitleId, {
      x: 2,
      y: 2,
    });
    await performancePage.zoom(-10, 10);
    await performancePage.scaleShapeBy(workingShapes.frameId, 100, 100, {
      x: 2,
      y: 2,
      steps: 100,
    });

    const [averageFrameRate, averageLongTaskDuration] =
      await performancePage.measure();
  },
);
