import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import {
  LayoutDirection,
  LayoutType,
} from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { ElementMargin } from '@pages/workspace/right-sidebar/design-tab/layout-item-section-component';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

// The header snapshots need the Share button, hidden in the personal team
layoutTest.use({ inNewTeam: true });

layoutTest.describe('Grid board with an image', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage, layersPanelPage }) => {
    layoutTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '600');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();

    await mainPage.uploadImage('images/mini_sample.jpg');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  layoutTest(
    qase(
      [1699],
      'Create a board with Grid Layout with a image and change -  alignment and change vertical, horizontal margin',
    ),
    async ({ mainPage, layoutItem, designPanelPage, layersPanelPage }) => {
      await layoutTest.step('Add three more images to the board', async () => {
        await mainPage.uploadImage('images/mini_sample.jpg');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.uploadImage('images/mini_sample.jpg');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.uploadImage('images/mini_sample.jpg');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();

        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step('Change alignment to Center and verify', async () => {
        await designPanelPage.changeLayoutAlignment('Center', false);
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isLayoutAlignmentSelected('Center', false);
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-image-alignment-center.png',
          {
            mask: mainPage.maskViewport(),
          },
        );

        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step(
        'Change vertical and horizontal margin of an image and verify',
        async () => {
          await layersPanelPage.clickLayerOnLayersTab('mini_sample');
          await mainPage.waitForChangeIsSaved();
          await layoutItem.changeMargin(ElementMargin.Vertical, '50');
          await mainPage.waitForChangeIsSaved();
          await layoutItem.changeMargin(ElementMargin.Horizontal, '50');
          await mainPage.waitForChangeIsSaved();
          await layoutItem.checkMargin(ElementMargin.Vertical, '50');
          await layoutItem.checkMargin(ElementMargin.Horizontal, '50');
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-image-margins.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase(
      [1700],
      'Create a board with Grid Layout with a image and create duplicate this image in next column (change vertical direction)',
    ),
    async ({ mainPage, layoutContainer, layersPanelPage }) => {
      await layoutTest.step('Select Column direction', async () => {
        await layoutContainer.changeDirection(LayoutDirection.Column);
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkDirection(LayoutDirection.Column);
      });

      await layoutTest.step('Duplicate the image', async () => {
        await layersPanelPage.clickLayerOnLayersTab('mini_sample');
        await mainPage.duplicateLayerViaLayersTab('mini_sample');
      });

      await layoutTest.step(
        'Verify column direction with duplicated image',
        async () => {
          await layersPanelPage.isNumLayerNameVisible('mini_sample', 2);
          await expect(mainPage.viewport).toHaveScreenshot(
            'column-direction-image.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase(
      [1701],
      'Create a board with Grid Layout with an image and create duplicate this image in next column (change horizontal direction)',
    ),
    async ({ mainPage, layoutContainer, layersPanelPage }) => {
      await layoutTest.step('Select Row direction', async () => {
        await layoutContainer.changeDirection(LayoutDirection.Row);
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkDirection(LayoutDirection.Row);
      });

      await layoutTest.step('Duplicate the image', async () => {
        await layersPanelPage.clickLayerOnLayersTab('mini_sample');
        await mainPage.duplicateLayerViaLayersTab('mini_sample');
      });

      await layoutTest.step(
        'Verify row direction with duplicated image',
        async () => {
          await layersPanelPage.isNumLayerNameVisible('mini_sample', 2);
          await expect(mainPage.viewport).toHaveScreenshot(
            'row-direction-image.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase([1706], 'Adding Flex Board'),
    async ({ mainPage, layoutContainer, designPanelPage }) => {
      await layoutTest.step('Add flex layout from design panel', async () => {
        await designPanelPage.addLayoutFromDesignPanel('flex');
        await designPanelPage.isFlexElementSectionOpened();
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkLayoutType(LayoutType.Flex);
        await layoutContainer.checkDirection(LayoutDirection.Row);
        await expect(layoutContainer.root).toHaveScreenshot(
          'flex-layout-section.png',
        );
      });

      await layoutTest.step('Verify flex layout on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-flex-layout.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  layoutTest(
    qase(
      [1711],
      'Create a board with Grid Layout - add grid lines as a dashboard - table - change duplicate, add row, delete row, change column numbers',
    ),
    async ({ mainPage, design, designPanelPage }) => {
      await layoutTest.step('Resize board and open grid edit mode', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('600', '400');
        await mainPage.clickBoardOnCanvas();
        await designPanelPage.expandGridLayoutMenu();
        await designPanelPage.openGridEditModeFromDesignPanel();
      });

      await layoutTest.step('Delete row and verify', async () => {
        await mainPage.deleteGridRow();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-image-delete-row.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await layoutTest.step('Duplicate row and verify', async () => {
        await mainPage.duplicateGridRow();
        await mainPage.waitForChangeIsSaved();
        await design.checkGridEditModePanel(['1fr', '1fr'], ['1fr', '1fr']);
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-image-duplicated-row.png',
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
          'board-with-image-add-row-below.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await layoutTest.step('Add column right and verify', async () => {
        await mainPage.addGridColumnRight();
        await mainPage.waitForChangeIsSaved();
        await design.checkGridEditModePanel(
          ['1fr', '1fr', '1fr'],
          ['1fr', '1fr', '1fr'],
        );
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-image-add-column-right.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });
    },
  );

  layoutTest(
    qase(
      [1713],
      'Create a board with Grid Layout - add grid lines, add 4 pictures of different sizes and change the color for the back',
    ),
    async ({ mainPage, designPanelPage, layersPanelPage, colorPalettePage }) => {
      await layoutTest.step(
        'Upload additional images and add to board',
        async () => {
          await mainPage.uploadImage('images/horizontal_sample.jpg');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.dragAndDropComponentToBoard('horizontal_sample');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await mainPage.uploadImage('images/vertical_sample.jpg');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.dragAndDropComponentToBoard('vertical_sample');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await mainPage.uploadImage('images/mini_sample2.jpg');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.dragAndDropComponentToBoard('mini_sample2');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();

          await mainPage.clickViewportOnce();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await layoutTest.step(
        'Change board fill color to red and verify',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#FF0000');
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await designPanelPage.isFillHexCodeSet('#FF0000');
          await expect(mainPage.viewport).toHaveScreenshot(
            'red-board-with-4-image.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});

layoutTest(
  qase(
    [1698],
    'Create a board with Grid Layout - upload an image and add it to the table - check the resizing of the image inside the table',
  ),
  async ({ mainPage, designPanelPage, layersPanelPage }) => {
    await layoutTest.step('Create board with grid layout', async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 300);
      await designPanelPage.changeHeightAndWidthForLayer('900', '900');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isLayoutRemoveButtonExists();
    });

    await layoutTest.step('Upload image and add to board', async () => {
      await mainPage.uploadImage('images/sample.jpeg');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('sample');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await layoutTest.step('Resize image and verify layout', async () => {
      await designPanelPage.changeWidthForLayer('800');
      await mainPage.hoverBoardOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickLayerOnLayersTab('sample');
      await designPanelPage.checkSizeWidth('800');
      await designPanelPage.checkSizeHeight('532.5');
      await expect(mainPage.viewport).toHaveScreenshot(
        'resized-board-with-image.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  },
);

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
  qase(
    [1707, 1741],
    'Add grid lines, and upload the images, check removed some image, Undo element creation',
  ),
  async ({ mainPage, designPanelPage, layersPanelPage }) => {
    await layoutTest.step('Create board with grid layout', async () => {
      await mainPage.createDefaultBoardByCoordinates(400, 300);
      await designPanelPage.changeHeightAndWidthForLayer('500', '600');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isLayoutRemoveButtonExists();
    });

    await layoutTest.step('(1707) Upload image and drag to board', async () => {
      await mainPage.uploadImage('images/mini_sample.jpg');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab('mini_sample', true);
    });

    await layoutTest.step(
      '(1741) Undo twice and verify image is removed',
      async () => {
        await mainPage.clickShortcutCtrlZ();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickShortcutCtrlZ();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isLayerPresentOnLayersTab('mini_sample', false);
      },
    );
  },
);
