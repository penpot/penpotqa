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

let mainPage, teamPage, dashboardPage, prototypePanelPage, layersPanelPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  prototypePanelPage = new PrototypePanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultBoardByCoordinates(900, 100);
    await mainPage.createDefaultBoardByCoordinates(500, 200, true);
    await prototypePanelPage.clickPrototypeTab();
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(857, 'PF-139 Add connector between 2 boards via mouse drag'),
    async ({ page }) => {
      await prototypePanelPage.isFlowNameDisplayedOnPrototypePanel('Flow 1');
      await expect(page).toHaveScreenshot(
        'connector-between-board2-and-board1.png',
        {
          mask: [
            mainPage.usersSection,
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
          ],
        },
      );
    },
  );

  mainTest(
    qase(861, 'PF-143 Add Interaction via Prototype panel'),
    async ({ page }) => {
      await prototypePanelPage.clickAddInteractionButton();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
      await expect(page).toHaveScreenshot('add-interaction.png', {
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
    qase(862, 'PF-144 Remove Interaction via Prototype panel'),
    async ({ page }) => {
      await prototypePanelPage.clickAddInteractionButton();
      await mainPage.waitForChangeIsSaved();
      await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
      await prototypePanelPage.clickRemoveSecondInteractionButton();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await prototypePanelPage.isPrototypeArrowSecondConnectorNotDisplayed();
      await expect(page).toHaveScreenshot(
        'connector-between-board2-and-board1.png',
        {
          mask: [
            mainPage.usersSection,
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
          ],
        },
      );
    },
  );

  mainTest(qase(870, 'PF-152 Add 2nd Flow'), async ({ page }) => {
    await mainPage.createDefaultBoardByCoordinates(200, 600);
    await mainPage.clickViewportByCoordinates(200, 600);
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isFlowNameDisplayedOnPrototypePanel('Flow 2');
    await mainPage.clickViewportByCoordinates(300, 700);
    await expect(page).toHaveScreenshot('add-2nd-flow.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });

  mainTest(qase(872, 'PF-154 Rename flow'), async ({ page }) => {
    await prototypePanelPage.renameFlow('qa');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isFlowNameDisplayedOnPrototypePanel('qa');
    await expect(page).toHaveScreenshot('rename-flow.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });

  mainTest(qase(873, 'PF-155 Delete flow'), async ({ page }) => {
    await prototypePanelPage.clickRemoveFlowButton();
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.isFlowNameNotDisplayedOnPrototypePanel();
    await expect(page).toHaveScreenshot('delete-flow.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });
});

mainTest(
  qase(865, 'PF-147 Change destination via Prototype panel'),
  async ({ page }) => {
    await mainPage.createDefaultBoardByCoordinates(900, 100);
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Board #1');
    await mainPage.createDefaultBoardByCoordinates(500, 200);
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Board #2');
    await prototypePanelPage.clickPrototypeTab();
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultBoardByCoordinates(200, 600);
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Board #3');
    await mainPage.clickViewportByCoordinates(500, 200);
    await prototypePanelPage.clickFirstInteractionRecord();
    await prototypePanelPage.selectInteractionDestination('Board #3');
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot('connector-between-board2-and-board3.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  },
);
