const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(qase(850, 'PF-132 Zoom via top right menu'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.increaseZoom(1);
  await mainPage.clickViewportOnce();
  await expect(page).toHaveScreenshot('canvas-zoom-in.png', {
    mask: [
      mainPage.usersSection,
      mainPage.guides,
      mainPage.guidesFragment,
      mainPage.toolBarWindow,
    ],
  });
  await mainPage.decreaseZoom(2);
  await mainPage.clickViewportOnce();
  await expect(page).toHaveScreenshot('canvas-zoom-out.png', {
    mask: [
      mainPage.usersSection,
      mainPage.guides,
      mainPage.guidesFragment,
      mainPage.toolBarWindow,
    ],
  });
});

mainTest(qase(852, 'PF-134 Reset zoom via top right menu'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.increaseZoom(1);
  await mainPage.clickViewportOnce();
  await expect(page).toHaveScreenshot('canvas-zoom-in.png', {
    mask: [
      mainPage.usersSection,
      mainPage.guides,
      mainPage.guidesFragment,
      mainPage.toolBarWindow,
    ],
  });
  await mainPage.resetZoom();
  await expect(page).toHaveScreenshot('canvas-zoom-default.png', {
    mask: [
      mainPage.usersSection,
      mainPage.guides,
      mainPage.guidesFragment,
      mainPage.toolBarWindow,
    ],
  });
});

mainTest(
  qase(854, 'PF-136 Zoom to fit all via top right menu'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await page.mouse.wheel(0, 1000);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.zoomToFitAll();
    await mainPage.clickViewportTwice();
    await expect(page).toHaveScreenshot('canvas-zoom-to-fit-all.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  },
);

mainTest(
  qase(856, 'PF-138 Zoom to selected via top right menu'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(900, 100);
    await mainPage.waitForChangeIsSaved();
    await mainPage.zoomToFitSelected();
    await mainPage.clickViewportTwice();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-zoom-to-selected.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  },
);
