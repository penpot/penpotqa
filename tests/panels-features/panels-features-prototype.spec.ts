import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { PrototypePanelPage } from '@pages/workspace/prototype-panel-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let prototypePanelPage: PrototypePanelPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page }) => {
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

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultBoardByCoordinates(900, 100);
    await mainPage.createDefaultBoardByCoordinates(500, 200, true);
    await prototypePanelPage.clickPrototypeTab();
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase([857], 'Add connector between 2 boards via mouse drag'),
    async ({ page }) => {
      await mainTest.step('Verify flow name and connection screenshot', async () => {
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
      });
    },
  );

  mainTest(qase([861], 'Add Interaction via Prototype panel'), async () => {
    await mainTest.step('Add interaction', async () => {
      await prototypePanelPage.clickAddInteractionButton();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify second connector and screenshot', async () => {
      await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
      await prototypePanelPage.checkNumberOfInteractions(2);
      await mainPage.hideRulersViaMainMenu();
      await expect(mainPage.viewport).toHaveScreenshot('add-interaction.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase([862], 'Remove Interaction via Prototype panel'),
    async ({ page }) => {
      await mainTest.step('Add then remove interaction', async () => {
        await prototypePanelPage.clickAddInteractionButton();
        await mainPage.waitForChangeIsSaved();
        await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
        await prototypePanelPage.clickRemoveInteractionByIndex(2);
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify interaction removed screenshot', async () => {
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
      });
    },
  );

  mainTest(qase([870], 'Add 2nd Flow'), async ({ page }) => {
    await mainTest.step('Create third board and connect to first', async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 600);
      await mainPage.clickViewportByCoordinates(200, 600);
      await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify second flow and screenshot', async () => {
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
  });

  mainTest(qase([872], 'Rename flow'), async ({ page }) => {
    await mainTest.step('Rename flow to qa', async () => {
      await prototypePanelPage.renameFlow('qa');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify renamed flow screenshot', async () => {
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
  });

  mainTest(qase([873], 'Delete flow'), async ({ page }) => {
    await mainTest.step('Delete flow', async () => {
      await prototypePanelPage.clickRemoveFlowByIndex(0);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify flow deleted screenshot', async () => {
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
});

mainTest(qase([865], 'Change destination via Prototype panel'), async ({ page }) => {
  await mainTest.step('Create boards and connect board2 to board1', async () => {
    await mainPage.createDefaultBoardByCoordinates(900, 100);
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Board #1');
    await mainPage.createDefaultBoardByCoordinates(500, 200);
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Board #2');
    await prototypePanelPage.clickPrototypeTab();
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Change destination to Board #3 and verify screenshot',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 600);
      await layersPanelPage.doubleClickLayerOnLayersTab('Board');
      await layersPanelPage.typeNameCreatedLayerAndEnter('Board #3');
      await mainPage.clickViewportByCoordinates(500, 200);
      await prototypePanelPage.openInteractionsOptionsByIndex(0);
      await prototypePanelPage.selectInteractionDestination('Board #3');
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot(
        'connector-between-board2-and-board3.png',
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
});
