const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

test.describe(() => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightClick();
  });

  mainTest(
    'CO-329 Add nodes via Node panel and SHIFT PLUS shortcut',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickAddNodeButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-added-one-node.png');
      await mainPage.clickFourthNode();
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFifthNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressShiftPlusKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-added-two-nodes.png');
    },
  );

  mainTest(
    'CO-330 Delete node via Node panel and Del shortcut',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.clickFirstNode();
      await mainPage.clickDeleteNodeButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-deleted-one-node.png');
      await mainPage.clickSecondNode();
      await mainPage.pressDeleteKeyboardButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-deleted-two-nodes.png');
    },
  );

  mainTest(
    'CO-332 Merge nodes via Node panel and CTRL J shortcut',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickMergeNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-merged-nodes-once.png');
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressCtrlJKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-merged-nodes-twice.png',
      );
    },
  );

  mainTest('CO-333 Join nodes via Node panel and J shortcut', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickDrawNodesButtonOnNodePanel();
    await mainPage.clickViewportByCoordinates(600, 200);
    await mainPage.clickViewportByCoordinates(750, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveNodesButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickSixthNode();
    await mainPage.clickThirdNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.clickJoinNodesButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-joined-nodes-once.png');
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickFifthNode();
    await mainPage.clickSecondNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.pressJKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-joined-nodes-twice.png');
  });

  mainTest(
    'CO-334 Separate nodes via Node panel and K shortcut',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickSeparateNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-separated-nodes-once.png',
      );
      await mainPage.clickSecondNode();
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickThirdNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressKKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-separated-nodes-twice.png',
      );
    },
  );

  mainTest(
    'CO-335 To corner via Node panel and X shortcut - single node',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.clickFirstNode();
      await mainPage.clickToCornerButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-to-corner-one-node.png',
      );
      await mainPage.clickSecondNode();
      await mainPage.pressXKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-to-corner-two-nodes.png',
      );
    },
  );
});

mainTest(
  'CO-337 To curve via Node panel and C shortcut - single node',
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightClick();
    await mainPage.clickFirstNode();
    await mainPage.clickToCurveButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-to-curve-one-node.png');
    await mainPage.clickSecondNode();
    await mainPage.pressCKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-to-curve-two-nodes.png');
  },
);
