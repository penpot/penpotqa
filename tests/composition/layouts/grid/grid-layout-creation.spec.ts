import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

// The header snapshots need the Share button, hidden in the personal team
layoutTest.use({ inNewTeam: true });

layoutTest.describe('Empty 300x400 grid board', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage }) => {
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  layoutTest(
    qase(
      [1689, 1696],
      'Create a board with Grid Layout - Check grid lines, check edit mode, Create a board with Grid Layout - check edit mode in the right panel',
    ),
    async ({ mainPage, design, designPanelPage }) => {
      await layoutTest.step('(1689) Verify board with grid layout', async () => {
        await designPanelPage.checkGridLayoutIsAdded();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-layout.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await layoutTest.step(
        '(1696) Open grid edit mode and verify canvas and sidebar',
        async () => {
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-edit-mode.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
          await design.checkGridEditModePanel(['1fr', '1fr'], ['1fr', '1fr']);
          // In grid edit mode the Design tab only shows the GRID LAYOUT panel
          await expect(design.root).toHaveScreenshot('grid-edit-mode-panel.png');
        },
      );
    },
  );

  layoutTest(
    qase([1863], 'Add a lot of columns and check "Columns" panel'),
    async ({ mainPage, design, designPanelPage }) => {
      await layoutTest.step('Open grid edit mode and add 30 columns', async () => {
        await designPanelPage.openGridEditModeFromDesignPanel();
        await mainPage.waitForChangeIsSaved();
        await mainPage.addColumnsGridLayout(30);
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step(
        'Verify canvas and columns panel with 30 columns',
        async () => {
          await design.checkGridEditModePanel(Array(32).fill('1fr'), ['1fr', '1fr']);
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-3-30.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
          await expect(mainPage.columnsRowsOnDesignPanel).toHaveScreenshot(
            'lot-1fr-columns.png',
          );
        },
      );
    },
  );
});
