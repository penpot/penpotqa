const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { PrototypePanelPage } = require('../../pages/workspace/prototype-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
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
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    const prototypePanelPage = new PrototypePanelPage(page);
    await mainPage.createDefaultBoardByCoordinates(900, 100);
    await mainPage.createDefaultBoardByCoordinates(500, 200, true);
    await prototypePanelPage.clickPrototypeTab();
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(857,'PF-139 Add connector between 2 boards via mouse drag'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const prototypePanelPage = new PrototypePanelPage(page);
      await prototypePanelPage.isFlowNameDisplayedOnPrototypePanel('Flow 1');
      await expect(page).toHaveScreenshot(
        'connector-between-board2-and-board1.png',
        {
          mask: [mainPage.usersSection],
        },
      );
    },
  );

  mainTest(qase(861,'PF-143 Add Interaction via Prototype panel'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const prototypePanelPage = new PrototypePanelPage(page);
    await prototypePanelPage.clickAddInteractionButton();
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
    await expect(page).toHaveScreenshot('add-interaction.png', {
      mask: [mainPage.usersSection],
    });
  });

  mainTest(qase(862,'PF-144 Remove Interaction via Prototype panel'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const prototypePanelPage = new PrototypePanelPage(page);
    await prototypePanelPage.clickAddInteractionButton();
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
    await prototypePanelPage.clickRemoveSecondInteractionButton();
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isPrototypeArrowSecondConnectorNotDisplayed();
    await expect(page).toHaveScreenshot('connector-between-board2-and-board1.png', {
      mask: [mainPage.usersSection],
    });
  });

  mainTest(qase(870,'PF-152 Add 2nd Flow'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const prototypePanelPage = new PrototypePanelPage(page);
    await mainPage.createDefaultBoardByCoordinates(200, 600);
    await mainPage.clickViewportByCoordinates(200, 600);
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isFlowNameDisplayedOnPrototypePanel('Flow 2');
    await mainPage.clickViewportByCoordinates(300, 700);
    await expect(page).toHaveScreenshot('add-2nd-flow.png', {
      mask: [mainPage.usersSection],
    });
  });

  mainTest(qase(872,'PF-154 Rename flow'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const prototypePanelPage = new PrototypePanelPage(page);
    await prototypePanelPage.renameFlow('qa');
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isFlowNameDisplayedOnPrototypePanel('qa');
    await expect(page).toHaveScreenshot('rename-flow.png', {
      mask: [mainPage.usersSection],
    });
  });

  mainTest(qase(873,'PF-155 Delete flow'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const prototypePanelPage = new PrototypePanelPage(page);
    await prototypePanelPage.clickRemoveFlowButton();
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isFlowNameNotDisplayedOnPrototypePanel();
    await expect(page).toHaveScreenshot('delete-flow.png', {
      mask: [mainPage.usersSection],
    });
  });
});

mainTest(qase(865,'PF-147 Change destination via Prototype panel'), async ({ page }) => {
  const mainPage = new MainPage(page);
  const prototypePanelPage = new PrototypePanelPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultBoardByCoordinates(900, 100);
  await layersPanelPage.doubleClickLayerOnLayersTab('Board');
  await layersPanelPage.renameCreatedLayer('Board #1');
  await mainPage.createDefaultBoardByCoordinates(500, 200);
  await layersPanelPage.doubleClickLayerOnLayersTab('Board');
  await layersPanelPage.renameCreatedLayer('Board #2');
  await prototypePanelPage.clickPrototypeTab();
  await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(200, 600);
  await layersPanelPage.doubleClickLayerOnLayersTab('Board');
  await layersPanelPage.renameCreatedLayer('Board #3');
  await mainPage.clickViewportByCoordinates(500, 200);
  await prototypePanelPage.clickFirstInteractionRecord();
  await prototypePanelPage.selectInteractionDestination('Board #3');
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot('connector-between-board2-and-board3.png', {
    mask: [mainPage.usersSection],
  });
});
