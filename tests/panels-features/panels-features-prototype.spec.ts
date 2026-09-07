import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PrototypePanelPage } from '@pages/workspace/prototype-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let prototypePanelPage: PrototypePanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  prototypePanelPage = new PrototypePanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultBoardByCoordinates(900, 100);
    await mainPage.createDefaultBoardByCoordinates(500, 200, true);
    await prototypePanelPage.clickPrototypeTab();
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(
    qase([857], 'Add connector between 2 boards via mouse drag'),
    async ({ page, mainPage }) => {
      await mainAccountFileTest.step(
        'Verify flow name and connection screenshot',
        async () => {
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
    },
  );

  mainAccountFileTest(
    qase([861], 'Add Interaction via Prototype panel'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Add interaction', async () => {
        await prototypePanelPage.clickAddInteractionButton();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Verify second connector and screenshot',
        async () => {
          await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
          await prototypePanelPage.checkNumberOfInteractions(2);
          await mainPage.hideRulersViaMainMenu();
          await expect(mainPage.viewport).toHaveScreenshot('add-interaction.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase([862], 'Remove Interaction via Prototype panel'),
    async ({ page, mainPage }) => {
      await mainAccountFileTest.step('Add then remove interaction', async () => {
        await prototypePanelPage.clickAddInteractionButton();
        await mainPage.waitForChangeIsSaved();
        await prototypePanelPage.isPrototypeArrowSecondConnectorDisplayed();
        await prototypePanelPage.clickRemoveInteractionByIndex(2);
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Verify interaction removed screenshot',
        async () => {
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
    },
  );

  mainAccountFileTest(qase([870], 'Add 2nd Flow'), async ({ page, mainPage }) => {
    await mainAccountFileTest.step(
      'Create third board and connect to first',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 600);
        await mainPage.clickViewportByCoordinates(200, 600);
        await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step('Verify second flow and screenshot', async () => {
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

  mainAccountFileTest(qase([872], 'Rename flow'), async ({ page, mainPage }) => {
    await mainAccountFileTest.step('Rename flow to qa', async () => {
      await prototypePanelPage.renameFlow('qa');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Verify renamed flow screenshot', async () => {
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

  mainAccountFileTest(qase([873], 'Delete flow'), async ({ page, mainPage }) => {
    await mainAccountFileTest.step('Delete flow', async () => {
      await prototypePanelPage.clickRemoveFlowByIndex(0);
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Verify flow deleted screenshot', async () => {
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

mainAccountFileTest(
  qase([865], 'Change destination via Prototype panel'),
  async ({ page, mainPage }) => {
    await mainAccountFileTest.step(
      'Create boards and connect board2 to board1',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(900, 100);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter('Board #1');
        await mainPage.createDefaultBoardByCoordinates(500, 200);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter('Board #2');
        await prototypePanelPage.clickPrototypeTab();
        await prototypePanelPage.dragAndDropPrototypeArrowConnector(900, 100);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
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
  },
);
