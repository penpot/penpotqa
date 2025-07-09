const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

let teamPage, dashboardPage, mainPage;

test.beforeEach(async ({ page }) => {
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  const projectFirst = 'QA Project';

  await teamPage.goToTeam();
  await dashboardPage.openProjectFromLeftSidebar(projectFirst);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  // await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightClick();
  });

  mainTest(
    qase(544, 'CO-329 Add nodes via Node panel and SHIFT PLUS shortcut'),
    async () => {
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickAddNodeButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-added-one-node.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await mainPage.clickFourthNode();
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFifthNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressShiftPlusKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-added-two-nodes.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
    },
  );

  mainTest(
    qase(545, 'CO-330 Delete node via Node panel and Del shortcut'),
    async () => {
      await mainPage.clickFirstNode();
      await mainPage.clickDeleteNodeButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-deleted-one-node.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await mainPage.clickSecondNode();
      await mainPage.pressDeleteKeyboardButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-deleted-two-nodes.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(547, 'CO-332 Merge nodes via Node panel and CTRL J shortcut'),
    async () => {
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickMergeNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-merged-nodes-once.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressCtrlJKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-merged-nodes-twice.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(548, 'CO-333 Join nodes via Node panel and J shortcut'),
    async () => {
      await mainPage.clickDrawNodesButtonOnNodePanel();
      await mainPage.clickViewportByCoordinates(600, 200, 2);
      await mainPage.clickViewportByCoordinates(750, 300, 2);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickMoveNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickSixthNode();
      await mainPage.clickThirdNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickJoinNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-joined-nodes-once.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFifthNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressJKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-joined-nodes-twice.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(549, 'CO-334 Separate nodes via Node panel and K shortcut'),
    async () => {
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFirstNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickSeparateNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-separated-nodes-once.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.clickSecondNode();
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickThirdNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressKKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-separated-nodes-twice.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(550, 'CO-335 To corner via Node panel and X shortcut - single node'),
    async () => {
      await mainPage.clickFirstNode();
      await mainPage.clickToCornerButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-to-corner-one-node.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.clickSecondNode();
      await mainPage.pressXKeyboardShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-to-corner-two-nodes.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );
});

mainTest(
  qase(552, 'CO-337 To curve via Node panel and C shortcut - single node'),
  async () => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightClick();
    await mainPage.clickFirstNode();
    await mainPage.clickToCurveButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-to-curve-one-node.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await mainPage.clickSecondNode();
    await mainPage.pressCKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-to-curve-two-nodes.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  },
);
