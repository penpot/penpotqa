import { ViewModePage } from '@pages/workspace/view-mode-page';
import { expect } from '@playwright/test';
import { prototypeTest } from '@tests/panels-features/prototype/prototype-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

const defaultNameBoard = 'Board';
const screenshotMask = { usersSection: true };

prototypeTest.describe(() => {
  prototypeTest.beforeEach(
    async ({ mainPage, workspacePage, prototypeOverlay, layersPanelPage }) => {
      await mainPage.createDefaultBoardByCoordinates(900, 100);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
      await mainPage.createDefaultBoardByCoordinates(500, 200);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 2);
      await workspacePage.rightSidebar.clickTab('prototype');
      await prototypeOverlay.dragNewConnectorTo(900, 100);
      await mainPage.waitForChangeIsSaved();
    },
  );

  prototypeTest(
    qase([857, 863], 'Add and remove connector via mouse drag'),
    async ({ page, mainPage, prototypeTab, prototypeOverlay }) => {
      await prototypeTest.step(
        'Verify flow name and connection screenshot',
        async () => {
          await prototypeTab.flow.checkFlowName('Flow 1');
          await prototypeOverlay.checkSelectedConnectorCount(1);
          await mainPage.moveMouseOutOfViewport();
          await expect(page).toHaveScreenshot(
            'connector-between-board2-and-board1.png',
            { mask: mainPage.maskViewport(screenshotMask) },
          );
        },
      );

      await prototypeTest.step(
        'Drag connector out to empty space and verify interaction is removed',
        async () => {
          await prototypeOverlay.dragConnectorEndTo(0, 900, 600);
          await mainPage.waitForChangeIsSaved();
          await prototypeTab.interactions.checkInteractionCount(0);
          await prototypeOverlay.checkSelectedConnectorCount(0);
        },
      );
    },
  );

  prototypeTest(
    qase([861, 862], 'Add and remove interaction via Prototype panel'),
    async ({ page, mainPage, prototypeTab, prototypeOverlay }) => {
      await prototypeTest.step(
        'Add interaction and verify second connector screenshot',
        async () => {
          await prototypeTab.interactions.addInteraction();
          await mainPage.waitForChangeIsSaved();
          await prototypeOverlay.checkSelectedConnectorCount(2);
          await mainPage.hideRulersViaMainMenu();
          await expect(mainPage.viewport).toHaveScreenshot('add-interaction.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await prototypeTest.step(
        'Remove interaction and verify removed screenshot',
        async () => {
          // The removed screenshot is the one taken with rulers shown.
          await mainPage.pressHideShowRulersShortcut();
          await mainPage.isRulersVisible(true);
          await prototypeTab.interactions.removeInteraction(1);
          await mainPage.waitForChangeIsSaved();
          await prototypeTab.interactions.checkInteractionCount(1);
          await prototypeOverlay.checkSelectedConnectorCount(1);
          await mainPage.moveMouseOutOfViewport();
          await expect(page).toHaveScreenshot(
            'connector-between-board2-and-board1.png',
            { mask: mainPage.maskViewport(screenshotMask) },
          );
        },
      );
    },
  );

  prototypeTest(
    qase([870], 'Add 2nd Flow'),
    async ({ page, mainPage, prototypeTab, prototypeOverlay, layersPanelPage }) => {
      await prototypeTest.step(
        'Create third board and connect to first',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(200, 600);
          await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 3);
          await mainPage.clickViewportByCoordinates(200, 600);
          await prototypeOverlay.dragNewConnectorTo(900, 100);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await prototypeTest.step('Verify second flow and screenshot', async () => {
        await prototypeTab.flow.checkFlowName('Flow 2');
        await mainPage.clickViewportByCoordinates(300, 700);
        await mainPage.moveMouseOutOfViewport();
        await expect(page).toHaveScreenshot('add-2nd-flow.png', {
          mask: mainPage.maskViewport(screenshotMask),
        });
      });
    },
  );

  prototypeTest(
    qase([872, 873], 'Rename and delete flow'),
    async ({ page, mainPage, prototypeTab }) => {
      await prototypeTest.step(
        'Rename flow to qa and verify renamed flow screenshot',
        async () => {
          await prototypeTab.flow.renameFlow('qa');
          await mainPage.waitForChangeIsSaved();
          await prototypeTab.flow.checkFlowName('qa');
          await mainPage.moveMouseOutOfViewport();
          await expect(page).toHaveScreenshot('rename-flow.png', {
            mask: mainPage.maskViewport(screenshotMask),
          });
        },
      );

      await prototypeTest.step(
        'Delete flow and verify flow deleted screenshot',
        async () => {
          await prototypeTab.flow.removeFlow();
          await mainPage.waitForChangeIsSaved();
          await prototypeTab.flow.checkNoFlow();
          await mainPage.moveMouseOutOfViewport();
          await expect(page).toHaveScreenshot('delete-flow.png', {
            mask: mainPage.maskViewport(screenshotMask),
          });
        },
      );
    },
  );

  prototypeTest(
    qase([868], 'Add animation via Prototype panel'),
    async ({ mainPage, prototypeTab, viewModePage }) => {
      await prototypeTest.step('Set Slide animation on interaction', async () => {
        await prototypeTab.interactions.openInteractionOptions(0);
        await prototypeTab.interactions.selectAnimation('Slide');
        await mainPage.waitForChangeIsSaved();
        await prototypeTab.interactions.checkAnimation('Slide');
      });

      await prototypeTest.step(
        'Click board in view mode and verify it navigates to the destination',
        async () => {
          const viewer = new ViewModePage(
            await viewModePage.clickViewModeShortcut(),
          );
          await viewer.waitForViewerSection(45000);
          await viewer.checkBoardCounter('1 / 2');
          await viewer.clickOnViewSection();
          await viewer.checkBoardCounter('2 / 2');
        },
      );
    },
  );
});

prototypeTest(
  qase([865], 'Change destination via Prototype panel'),
  async ({
    page,
    mainPage,
    workspacePage,
    prototypeTab,
    prototypeOverlay,
    layersPanelPage,
  }) => {
    await prototypeTest.step(
      'Create boards and connect board2 to board1',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(900, 100);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter('Board #1');
        await mainPage.createDefaultBoardByCoordinates(500, 200);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter('Board #2');
        await workspacePage.rightSidebar.clickTab('prototype');
        await prototypeOverlay.dragNewConnectorTo(900, 100);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await prototypeTest.step(
      'Change destination to Board #3 and verify screenshot',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 600);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter('Board #3');
        await mainPage.clickViewportByCoordinates(500, 200);
        await prototypeTab.interactions.openInteractionOptions(0);
        await prototypeTab.interactions.selectDestination('Board #3');
        await mainPage.waitForChangeIsSaved();
        await mainPage.moveMouseOutOfViewport();
        await expect(page).toHaveScreenshot(
          'connector-between-board2-and-board3.png',
          { mask: mainPage.maskViewport(screenshotMask) },
        );
      },
    );
  },
);
