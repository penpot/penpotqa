const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { test, expect } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let teamPage, mainPage, designPanelPage, dashboardPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase(719, 'PF-1 Set square grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-default.png');
  });

  mainTest(qase(720, 'PF-2 Square grid - change size'), async () => {
    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeSizeForGrid('8');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'square-grid-changed-size.png',
    );
  });

  mainTest(qase(721, 'PF-3 Square grid - change opacity'), async () => {
    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.changeOpacityForGrid('70');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'square-grid-changed-opacity.png',
    );
  });

  mainTest(qase(722, 'PF-4 Use default square grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeSizeForGrid('8');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.clickUseDefaultGridButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-default.png');
  });

  mainTest(
    qase(724, 'PF-6 Hide and unhide square grid via Design panel'),
    async () => {
      await designPanelPage.clickAddGridButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'square-grid-default.png',
      );
      await designPanelPage.clickHideGridButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-hide.png');
      await designPanelPage.clickUnhideGridButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-unhide.png');
    },
  );

  mainTest(qase(725, 'PF-7 Hide and unhide square grid via Main menu'), async () => {
    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-default.png');
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickHideGridsMainMenuSubItem();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-hide.png');
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickShowGridsMainMenuSubItem();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-unhide.png');
  });

  mainTest(qase(729, 'PF-11 Remove square grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickRemoveGridButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-without-grid.png');
  });

  mainTest(qase(730, 'PF-12 Set columns grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Columns');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('columns-grid-default.png');
  });

  mainTest(qase(731, 'PF-13 Columns grid - change columns number'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGrid('8');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'columns-grid-changed-columns.png',
    );
  });

  mainTest(qase(732, 'PF-14 Columns grid - change width'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGrid('3');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.changeWidthForGrid('10');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'columns-grid-changed-width.png',
    );
  });

  mainTest(qase(735, 'PF-17 Columns grid - change opacity'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Columns');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('columns-grid-default.png');
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.changeOpacityForGrid('50');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'columns-grid-opacity-50.png',
    );
    await designPanelPage.changeOpacityForGrid('100');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'columns-grid-opacity-100.png',
    );
  });

  mainTest(qase(736, 'PF-18 Use default columns grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGrid('3');
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.clickUseDefaultGridButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('columns-grid-default.png');
  });

  mainTest(
    qase(738, 'PF-20 Hide and unhide columns grid via Design panel'),
    async () => {
      await designPanelPage.clickAddGridButton();
      await designPanelPage.selectGridType('Columns');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'columns-grid-default.png',
      );
      await designPanelPage.clickHideGridButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot('columns-grid-hide.png');
      await designPanelPage.clickUnhideGridButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'columns-grid-unhide.png',
      );
    },
  );

  mainTest(qase(743, 'PF-25 Remove columns grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickRemoveGridButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-without-grid.png');
  });

  mainTest(qase(744, 'PF-26 Set rows grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Rows');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rows-grid-default.png');
  });

  mainTest(qase(745, 'PF-27 Rows grid - change rows number'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Rows');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGrid('12');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rows-grid-changed-rows.png',
    );
  });

  mainTest(qase(746, 'PF-28 Rows grid - change height'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Rows');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGrid('3');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.changeHeightForGrid('20');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rows-grid-changed-height.png',
    );
  });

  mainTest(qase(749, 'PF-31 Rows grid - change opacity'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Rows');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rows-grid-default.png');
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.changeOpacityForGrid('50');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rows-grid-opacity-50.png');
    await designPanelPage.changeOpacityForGrid('100');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rows-grid-opacity-100.png',
    );
  });

  mainTest(qase(750, 'PF-32 Use default rows grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Rows');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGrid('3');
    await designPanelPage.clickGridActionsButton();
    await designPanelPage.clickUseDefaultGridButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rows-grid-default.png');
  });

  mainTest(qase(753, 'PF-35 Hide and unhide rows grid via Main menu'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Rows');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rows-grid-default.png');
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickHideGridsMainMenuSubItem();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rows-grid-hide.png');
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickShowGridsMainMenuSubItem();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rows-grid-unhide.png');
  });

  mainTest(qase(757, 'PF-39 Remove rows grid'), async () => {
    await designPanelPage.clickAddGridButton();
    await designPanelPage.selectGridType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickRemoveGridButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-without-grid.png');
  });

  mainTest(qase(1864, 'Duplicate board with guide'), async ({ browserName }) => {
    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickShortcutCtrlD(browserName);
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('two-board-with-guide.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });
});
