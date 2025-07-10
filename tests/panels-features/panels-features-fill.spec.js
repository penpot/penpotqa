const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

let teamPage, mainPage, colorPalettePage, dashboardPage, designPanelPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  mainPage = new MainPage(page);
  const projectFirst = 'QA Project';
  await teamPage.goToTeam();
  await dashboardPage.openProjectFromLeftSidebar(projectFirst);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase(786, 'PF-68 Add fill to board'), async () => {
    await designPanelPage.isFillHexCodeSet('FFFFFF');
    await designPanelPage.isFillOpacitySet('100');
    await expect(mainPage.createdLayer).toHaveScreenshot('board-fill.png');
  });

  mainTest(qase(791, 'PF-73 Change fill color for board'), async () => {
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.modalSetHex('FF0000');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('ff0000');
    await designPanelPage.isFillOpacitySet('100');
    await expect(mainPage.createdLayer).toHaveScreenshot('board-changed-fill.png');
  });

  mainTest(qase(796, 'PF-78 Change fill opacity for board'), async () => {
    await designPanelPage.changeOpacityForFill('70');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('FFFFFF');
    await designPanelPage.isFillOpacitySet('70');
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'board-changed-opacity.png',
    );
  });

  mainTest(qase(811, 'PF-93 Remove fill for board'), async () => {
    await designPanelPage.clickRemoveFillButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-removed-fill.png');
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultClosedPath();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase(790, 'PF-72 Add fill to path'), async () => {
    await designPanelPage.clickAddFillButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('B1B2B5');
    await designPanelPage.isFillOpacitySet('100');
    await expect(mainPage.createdLayer).toHaveScreenshot('path-fill.png');
  });

  mainTest(qase(795, 'PF-77 Change fill color for path'), async () => {
    await designPanelPage.clickAddFillButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#FF0000');
    await mainPage.clickOnDesignTab();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('FF0000');
    await designPanelPage.isFillOpacitySet('100');
    await expect(mainPage.createdLayer).toHaveScreenshot('path-changed-fill.png');
  });

  mainTest(qase(800, 'PF-82 Change fill opacity for path'), async () => {
    await designPanelPage.clickAddFillButton();
    await designPanelPage.changeOpacityForFill('70');
    await mainPage.clickOnDesignTab();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('B1B2B5');
    await designPanelPage.isFillOpacitySet('70');
    await expect(mainPage.createdLayer).toHaveScreenshot('path-changed-opacity.png');
  });

  mainTest(qase(815, 'PF-97 Remove fill for path'), async () => {
    await designPanelPage.clickAddFillButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickRemoveFillButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnDesignTab();
    await expect(mainPage.copyLayer).toHaveScreenshot('path-removed-fill.png');
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase(787, 'PF-69 Add fill to shape'), async () => {
    await designPanelPage.isFillHexCodeSet('B1B2B5');
    await designPanelPage.isFillOpacitySet('100');
    await expect(mainPage.createdLayer).toHaveScreenshot('rectangle-fill.png');
  });

  mainTest(qase(797, 'PF-79 Change fill opacity for shape'), async () => {
    await designPanelPage.changeOpacityForFill('70');
    await mainPage.clickViewportTwice();
    await designPanelPage.isFillHexCodeSet('B1B2B5');
    await designPanelPage.isFillOpacitySet('70');
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rectangle-changed-opacity.png',
    );
  });

  mainTest(qase(812, 'PF-94 Remove fill for shape'), async () => {
    await designPanelPage.clickRemoveFillButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rectangle--removed-fill.png',
    );
  });

  mainTest(qase(792, 'PF-74 Change fill color for shape'), async () => {
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#FF0000');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('FF0000');
    await designPanelPage.isFillOpacitySet('100');
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rectangle-changed-fill.png',
    );
  });
});
