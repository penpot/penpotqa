import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { LayoutDirection } from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { GridCellCoordinate } from '@pages/workspace/right-sidebar/design-tab/grid-cell-section-component';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

// The header snapshots need the Share button, hidden in the personal team
layoutTest.use({ inNewTeam: true });

layoutTest.describe('Empty 300x400 grid board for cells and areas', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage }) => {
    layoutTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  layoutTest(
    qase(
      [1715],
      'Create a board with Grid Layout - add grid lines, check edit mode and add the text',
    ),
    async ({ mainPage, layersPanelPage }) => {
      await layoutTest.step('Create text layer and add it to board', async () => {
        await mainPage.createDefaultTextLayerByCoordinates(500, 500);
        await layersPanelPage.dragAndDropComponentToBoard('Hello world!');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isLayerNameDisplayed('Hello world!');
      });

      await layoutTest.step('Verify board with text layer in grid', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-text.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  layoutTest(
    qase(
      [1702],
      'Check fraction units, three dots and check duplicate, add row, delete row',
    ),
    async ({ mainPage, design, designPanelPage }) => {
      await layoutTest.step('Resize board and open grid edit mode', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('600', '400');
        await mainPage.clickBoardOnCanvas();
        await designPanelPage.expandGridLayoutMenu();
        await designPanelPage.openGridEditModeFromDesignPanel();
      });

      await layoutTest.step('Duplicate row and verify', async () => {
        await mainPage.duplicateGridRow();
        await mainPage.waitForChangeIsSaved();
        await design.checkGridEditModePanel(['1fr', '1fr'], ['1fr', '1fr', '1fr']);
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-duplicated-row.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await layoutTest.step('Delete row and verify', async () => {
        await mainPage.deleteGridRow();
        await mainPage.waitForChangeIsSaved();
        await design.checkGridEditModePanel(['1fr', '1fr'], ['1fr', '1fr']);
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-delete-row.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await layoutTest.step('Add row below and verify', async () => {
        await mainPage.addGridRowBelow();
        await mainPage.waitForChangeIsSaved();
        await design.checkGridEditModePanel(['1fr', '1fr'], ['1fr', '1fr', '1fr']);
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-add-row-below.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });
    },
  );

  layoutTest(
    qase([1703], 'Check fraction units, change px row manual'),
    async ({ mainPage, design }) => {
      await layoutTest.step(
        'Enter board and change row label to 100 PX',
        async () => {
          await mainPage.clickBoardOnCanvas();
          await mainPage.doubleClickBoardOnCanvas();
          await mainPage.changeGridRowLabel('100 PX');
          await mainPage.waitForChangeIsSaved();
          await design.checkGridEditModePanel(['1fr', '1fr'], ['1fr', '100px']);
        },
      );

      await layoutTest.step('Verify PX row on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('board-with-px-row.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
      });
    },
  );

  layoutTest(
    qase([1708], 'Check occupy two cells (button Area) - vertical and horizontal'),
    async ({ mainPage, workspacePage, gridCell }) => {
      await layoutTest.step('Enter board and add row and column', async () => {
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
        await mainPage.waitForChangeIsSaved();
        await mainPage.addRowGridLayoutBtnClick();
        await mainPage.addColumnGridLayoutBtnClick();
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step(
        'Select cells and create vertical area, verify',
        async () => {
          await workspacePage.gridEditor.selectCells(6, 9);
          await gridCell.clickOnAreaButton();
          await gridCell.checkCellPosition({
            columnStart: '3',
            columnEnd: '4',
            rowStart: '2',
            rowEnd: '4',
          });
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-vertical-area.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );

      await layoutTest.step(
        'Select cells and create horizontal area, verify',
        async () => {
          await workspacePage.gridEditor.selectCells(1, 2);
          await gridCell.clickOnAreaButton();
          await gridCell.checkCellPosition({
            columnStart: '1',
            columnEnd: '3',
            rowStart: '1',
            rowEnd: '2',
          });
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-horizontal-area.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase([1709], 'Check occupy four cells (button Area) - Create Area name'),
    async ({ mainPage, workspacePage, gridCell }) => {
      await layoutTest.step(
        'Enter board, select four cells and create area',
        async () => {
          await mainPage.clickBoardOnCanvas();
          await mainPage.doubleClickBoardOnCanvas();
          await mainPage.waitForChangeIsSaved();
          await workspacePage.gridEditor.selectCells(1, 4);
          await gridCell.clickOnAreaButton();
          await gridCell.enterAreaName('Test Area  Name');
          await gridCell.checkAreaName('Test Area  Name');
        },
      );

      await layoutTest.step('Verify area with name on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-4cell-area.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });
    },
  );

  layoutTest(
    qase([1737], 'Locate button'),
    async ({ mainPage, design, designPanelPage }) => {
      await layoutTest.step(
        'Move board off-screen and open grid edit mode',
        async () => {
          await mainPage.clickBoardOnCanvas();
          await designPanelPage.changeAxisXAndYForLayer('400', '2000');
          await designPanelPage.expandGridLayoutMenu();
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await layoutTest.step(
        'Verify board is not visible, then click Locate in the top menu',
        async () => {
          await mainPage.hideRulersViaMainMenu();
          await mainPage.clickViewportOnce();
          await expect(mainPage.viewport).toHaveScreenshot('board-not-visible.png', {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          });
          await designPanelPage.clickGridLocateButton();
          await expect(mainPage.viewport).toHaveScreenshot('board-visible.png', {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          });
        },
      );

      await layoutTest.step(
        'Move board off-screen again and reopen grid edit mode',
        async () => {
          await designPanelPage.clickGridDoneButton();
          await mainPage.clickBoardOnCanvas();
          await designPanelPage.changeAxisXAndYForLayer('400', '300');
          await designPanelPage.expandGridLayoutMenu();
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await layoutTest.step(
        'Verify board is not visible, then click Locate in the right menu',
        async () => {
          await mainPage.clickViewportOnce();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-not-visible-right-menu.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
          await design.clickGridLocate();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-visible-right-menu.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase(
      [1739, 1742],
      'Duplicate vertical and horizontal direction, Undo element duplication',
    ),
    async ({ mainPage, layoutContainer, layersPanelPage }) => {
      await layoutTest.step('Add rectangle to board', async () => {
        await mainPage.createDefaultRectangleByCoordinates(410, 410, true);
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step(
        '(1739) Duplicate rectangle in column direction and verify',
        async () => {
          await layoutContainer.changeDirection(LayoutDirection.Column);
          await mainPage.waitForChangeIsSaved();
          await layoutContainer.checkDirection(LayoutDirection.Column);
          await layersPanelPage.clickLayerOnLayersTab('Rectangle');
          await mainPage.duplicateLayerViaLayersTab('Rectangle');
          await layersPanelPage.isNumLayerNameVisible('Rectangle', 2);
          await expect(mainPage.viewport).toHaveScreenshot(
            'column-direction-rectangle.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await layoutTest.step('(1742) Undo the duplication', async () => {
        await mainPage.clickShortcutCtrlZ();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isNumLayerNameVisible('Rectangle', 1);
      });

      await layoutTest.step(
        '(1739) Duplicate rectangle in row direction and verify',
        async () => {
          await mainPage.clickViewportOnce();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await mainPage.waitForChangeIsSaved();
          await layoutContainer.changeDirection(LayoutDirection.Row);
          await mainPage.waitForChangeIsSaved();
          await layoutContainer.checkDirection(LayoutDirection.Row);
          await layersPanelPage.clickLayerOnLayersTab('Rectangle');
          await mainPage.duplicateLayerViaLayersTab('Rectangle');
          await layersPanelPage.isNumLayerNameVisible('Rectangle', 2);
          await expect(mainPage.viewport).toHaveScreenshot(
            'row-direction-rectangle.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase([1743], 'Undo element editing'),
    async ({ mainPage, designPanelPage, colorPalettePage }) => {
      await layoutTest.step(
        'Add rectangle and change fill color to green',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(410, 410, true);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#00FF00');
          await mainPage.clickViewportByCoordinates(410, 410);
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await designPanelPage.isFillHexCodeSet('#00FF00');
        },
      );

      await layoutTest.step('Verify green rectangle', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-green-color.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await layoutTest.step('Undo color change and verify', async () => {
        await mainPage.clickViewportOnce();
        await mainPage.clickShortcutCtrlZ();
        await mainPage.waitForResizeHandlerVisible();
        await designPanelPage.isFillHexCodeSet('#B1B2B5');
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-undo-color.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  layoutTest(
    qase([1746], 'Check to add area - manually'),
    async ({ mainPage, workspacePage, gridCell }) => {
      await layoutTest.step('Enter board and click on grid cell', async () => {
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
        await mainPage.waitForChangeIsSaved();
        await workspacePage.gridEditor.clickCell(1);
      });

      await layoutTest.step(
        'Set area manually via design panel and verify',
        async () => {
          await gridCell.clickOnManualButton();
          await gridCell.enterGridCellCoordinate(GridCellCoordinate.RowEnd, '3');
          await gridCell.checkCellPosition({
            columnStart: '1',
            columnEnd: '2',
            rowStart: '1',
            rowEnd: '3',
          });
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-manual-area.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase(
      [1748],
      'Check to add area - When you select cells and then "right click" merge cells',
    ),
    async ({ mainPage, workspacePage, gridCell }) => {
      await layoutTest.step('Enter board and add row and column', async () => {
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
        await mainPage.waitForChangeIsSaved();
        await mainPage.addRowGridLayoutBtnClick();
        await mainPage.addColumnGridLayoutBtnClick();
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step(
        'Select cells and merge via right click, verify',
        async () => {
          await workspacePage.gridEditor.selectCells(1, 3);
          await workspacePage.gridEditor.openCellContextMenu(3);
          await workspacePage.contextMenu.clickItem('Merge cells');
          await gridCell.checkCellPosition({
            columnStart: '1',
            columnEnd: '4',
            rowStart: '1',
            rowEnd: '2',
          });
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-horizontal-area-right.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );
    },
  );
});
