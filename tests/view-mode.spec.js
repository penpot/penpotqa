const { expect, test } = require('@playwright/test');
const { mainTest } = require('../fixtures');
const { MainPage } = require('../pages/workspace/main-page');
const { random } = require('../helpers/string-generator');
const { TeamPage } = require('../pages/dashboard/team-page');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { ViewModePage } = require('../pages/workspace/view-mode-page');
const { PrototypePanelPage } = require('../pages/workspace/prototype-panel-page');

const teamName = random().concat('autotest');

let teamPage,dashboardPage,mainPage,viewModePage,prototypePanelPage;
test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  viewModePage = new ViewModePage(page);
  prototypePanelPage = new PrototypePanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest(qase([685],'CO-364 Click view mode (From right top click) - no boards created'), async ({ page }) => {
  const newPage = await viewModePage.clickViewModeButton();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'no-board-view-mode-page-image.png'
  );
});

mainTest(qase([688],'CO-367 Click view mode (From shortcut G+V) - board is created'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-image.png'
  );
});

mainTest(qase([690],'CO-369 Full screen on/off'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickFullScreenButton();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'view-mode-full-screen-image.png'
  );
  await viewModePage.clickOnESC();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-image.png'
  );
});

mainTest(qase([698],'CO-377 Click arrows to navigate to other boards'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png'
  );
  await viewModePage.clickPrevButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png'
  );
  await viewModePage.clickPrevButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
});

mainTest(qase([700],'CO-379 Click Back icon to reset view'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(100, 100, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'third-board-view-mode-page-image.png'
  );
  await viewModePage.clickResetButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
});

mainTest(qase([699],'CO-378 Click board dropdown to navigate to other boards'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickSelectBoardDropdown();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'board-dropdown-view-mode-page-image.png'
  );
  await viewModePage.selectSecondBoard();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-selected-view-mode-page-image.png'
  );
  await viewModePage.selectFirstBoard();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-selected-view-mode-page-image.png'
  );
});

// mainTest(qase([689],'CO-368 Interactions dropdown'), async ({ page }) => {
//   await mainPage.createDefaultBoardByCoordinates(300, 300);
//   await mainPage.createDefaultBoardByCoordinates(500, 500, true);
//   await mainPage.waitForChangeIsSaved();
//   await prototypePanelPage.clickPrototypeTab();
//   await prototypePanelPage.dragAndDropPrototypeArrowConnector(300, 300);
//   const newPage = await viewModePage.clickViewModeShortcut();
//   viewModePage = new ViewModePage(newPage);
//   await viewModePage.clickInteractionsDropdown();
//   await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
//     'interactions-dont-show-options-image.png'
//   );
//   await viewModePage.selectShowInteractionsOptions();
//   await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
//     'show-interactions-board-view-mode-page-image.png'
//   );
//   // await viewModePage.clickInteractionsDropdown();
//   await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
//     'interactions-show-options-image.png'
//   );
//   await viewModePage.selectShowOnClickInteractionsOptions();
//   await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
//     'show-on-click-interactions-board-view-mode-page-image.png'
//   );
//   await viewModePage.clickOnBoardCounter();
//   await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
//     'show-on-click-interactions-board-view-mode-page-image2.png'
//   );
// });

mainTest(qase([691],'CO-370 Change scale'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.openScaleDropdown();
  await expect(viewModePage.scaleDropdownOptions).toHaveScreenshot(
    'scale-dropdown-view-mode-page-image.png'
  );
  await viewModePage.clickDownscaleButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'downscale-board-view-mode-page-image.png'
  );
  await viewModePage.clickResetScaleButton();
  await viewModePage.clickUpscaleButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'upscale-board-view-mode-page-image.png'
  );
  await viewModePage.selectFitScaleOptions();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'fit-scale-board-view-mode-page-image.png'
  );
  await viewModePage.selectFillScaleOptions();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'fill-scale-board-view-mode-page-image.png'
  );
  await viewModePage.selectFullScreenScaleOptions();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'full-screen-scale-board-view-mode-page-image.png'
  );
  await viewModePage.clickResetScaleButton();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'full-screen-default-scale-board-view-mode-page-image.png'
  );
});

mainTest(qase([713],'CO-392 Zoom by pressing + and - keys'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickOnAdd();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-add-button-image.png'
  );
  await viewModePage.clickOnSubtract();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-subtract-button-image.png'
  );
});

mainTest(qase([708],'CO-387 Page dropdown'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.openPageDropdown();
  await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
    'page-list-image.png'
  );
  await viewModePage.selectPageByName("Page 2");
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-2page-image.png'
  );
  await viewModePage.openPageDropdown();
  await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
    'page-list-image2.png'
  );
  await viewModePage.selectPageByName("Page 1");
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-1page-image.png'
  );
});
