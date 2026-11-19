import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

// The header snapshots need the Share button, hidden in the personal team
layoutTest.use({ inNewTeam: true });

layoutTest.describe('Grid board with components and shapes', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage, layersPanelPage }) => {
    layoutTest.slow();
    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('500', '600');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();

    await mainPage.createDefaultEllipseByCoordinates(210, 210, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultRectangleByCoordinates(320, 210, true);
    await layersPanelPage.clickLayerOnLayersTab('Rectangle');
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(210, 320, true);
    await layersPanelPage.clickLayerOnLayersTab('Ellipse');
    await mainPage.createDefaultRectangleByCoordinates(320, 320, true);
    await layersPanelPage.clickLayerOnLayersTab('Rectangle');
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  layoutTest(
    qase([1691], 'Create a board with Grid Layout - change alignment'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('Change layout alignment to Center', async () => {
        await designPanelPage.changeLayoutAlignment('Center', false);
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isLayoutAlignmentSelected('Center', false);
      });

      await layoutTest.step('Verify centered alignment on canvas', async () => {
        await mainPage.movePointerToViewportBottomRight();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-alignment-center.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  layoutTest(
    qase(
      [1692, 1694],
      'Create a board with Grid Layout - change justify, Create a board with Grid Layout - change vertical, horizontal, bottom and left paddings',
    ),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step(
        '(1694) Set independent paddings in grid edit mode',
        async () => {
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.switchToIndependentPaddingOnGridEdit();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutIndependentPaddingOnGridEdit(
            'Top',
            '50',
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutIndependentPaddingOnGridEdit(
            'Left',
            '50',
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutIndependentPaddingOnGridEdit(
            'Bottom',
            '50',
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutIndependentPaddingOnGridEdit(
            'Right',
            '50',
          );
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await layoutTest.step(
        '(1694) Verify paddings on canvas and in design panel',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-paddings.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.verifyLayoutIndependentPaddingValue('Top', '50');
          await designPanelPage.verifyLayoutIndependentPaddingValue('Left', '50');
          await designPanelPage.verifyLayoutIndependentPaddingValue('Bottom', '50');
          await designPanelPage.verifyLayoutIndependentPaddingValue('Right', '50');
        },
      );

      await layoutTest.step(
        '(1692) Change justification to Space around and verify',
        async () => {
          await designPanelPage.clickGridDoneButton();
          await designPanelPage.changeLayoutJustification('Space around', false);
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-justify-space-around.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkLayoutJustification('Space around', false);
        },
      );
    },
  );

  layoutTest(
    qase(
      [1693, 1716, 1744],
      'Create a board with Grid Layout - row gap, Check Gap info on inspect tab,  Check inspect section',
    ),
    async ({ mainPage, inspect, designPanelPage, inspectPanelPage }) => {
      await layoutTest.step(
        '(1693) Set row gap in grid edit mode and verify canvas',
        async () => {
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutRowGapOnGridEdit('50');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkRowGap('50');
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-row-gap.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );

      await layoutTest.step(
        '(1716) Verify row gap is visible on inspect tab',
        async () => {
          await inspectPanelPage.openInspectTab();
          await inspectPanelPage.openComputedTab();
          await inspect.checkLayoutProperty('Row gap', '50px');
        },
      );

      await layoutTest.step(
        '(1744) Verify grid board information on inspect tab',
        async () => {
          await inspect.checkLayoutProperty('Display', 'grid');
          await inspect.checkLayoutProperty('Grid template rows', '1fr 1fr');
          await inspect.checkLayoutProperty('Grid template columns', '1fr 1fr');
          await inspect.checkLayoutProperty('Align items', 'start');
          await inspect.checkLayoutProperty('Align content', 'stretch');
          await inspect.checkLayoutProperty('Justify items', 'start');
          await inspect.checkLayoutProperty('Justify content', 'stretch');
        },
      );
    },
  );

  layoutTest(
    qase(
      [1695],
      'Create a board with Grid Layout - check edit mode, change columns and rows',
    ),
    async ({ mainPage, design, designPanelPage }) => {
      await layoutTest.step(
        'Open grid edit mode and add a row and column',
        async () => {
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
          await mainPage.addRowGridLayoutBtnClick();
          await mainPage.addColumnGridLayoutBtnClick();
          await mainPage.waitForChangeIsSaved();
          await design.checkGridEditModePanel(
            ['1fr', '1fr', '1fr'],
            ['1fr', '1fr', '1fr'],
          );
        },
      );

      await layoutTest.step('Verify 3x3 grid layout on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-3-3.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
      });
    },
  );
});

layoutTest(
  qase(
    [1697, 1735],
    'Check if the grid layout is resized automatically, Autoscale while resizing',
  ),
  async ({ mainPage, designPanelPage, layersPanelPage }) => {
    await layoutTest.step('Create board with grid layout', async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 200);
      await designPanelPage.changeHeightAndWidthForLayer('300', '400');
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
    });

    await layoutTest.step(
      '(1697) Resize board and verify layout adapts',
      async () => {
        await designPanelPage.changeHeightAndWidthForLayer('400', '600');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkSizeWidth('600');
        await designPanelPage.checkSizeHeight('400');
        await mainPage.isCornerHandleVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'resized-board-with-grid-layout.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );

    await layoutTest.step(
      '(1735) Add rectangles, resize board smaller and verify',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(210, 210, true);
        await mainPage.createDefaultRectangleByCoordinates(320, 210, true);
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await designPanelPage.changeHeightAndWidthForLayer('200', '300');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkSizeWidth('300');
        await designPanelPage.checkSizeHeight('200');
        await layersPanelPage.clickLayerOnLayersTab('Rectangle');
        await designPanelPage.checkSizeWidth('100');
        await designPanelPage.checkSizeHeight('100');
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.isCornerHandleVisible();
        await mainPage.waitForChangeIsSaved();
        await mainPage.movePointerToViewportBottomRight();
        await expect(mainPage.viewport).toHaveScreenshot(
          'resized-board-with-rectangle.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);

layoutTest(
  qase([1712], 'Add grid lines, change px for all columns and rows'),
  async ({ mainPage, design, designPanelPage }) => {
    await layoutTest.step('Create board with grid layout', async () => {
      await mainPage.createDefaultBoardByCoordinates(400, 300);
      await designPanelPage.changeHeightAndWidthForLayer('500', '600');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickBoardOnCanvas();
      await mainPage.doubleClickBoardOnCanvas();
    });

    await layoutTest.step(
      'Change all columns and rows to PX and set values',
      async () => {
        await designPanelPage.clickOnGridExpandColumnUnitButton();
        await designPanelPage.selectGridCellUnit(1, 'PX');
        await designPanelPage.selectGridCellUnit(2, 'PX');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.enterGridCellValue(1, '200');
        await designPanelPage.enterGridCellValue(2, '200');
        await designPanelPage.clickOnGridExpandColumnUnitButton();
        await designPanelPage.clickOnGridExpandRowUnitButton();
        await designPanelPage.selectGridCellUnit(1, 'PX');
        await designPanelPage.selectGridCellUnit(2, 'PX');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.enterGridCellValue(1, '200');
        await designPanelPage.enterGridCellValue(2, '200');
        await mainPage.waitForChangeIsSaved();
        await design.checkGridEditModePanel(['200px', '200px'], ['200px', '200px']);
      },
    );

    await layoutTest.step('Verify grid layout with PX columns', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'grid-with-px-all-column.png',
        {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        },
      );
    });
  },
);
