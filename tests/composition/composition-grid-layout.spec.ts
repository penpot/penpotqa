import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let inspectPanelPage: InspectPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
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

  mainTest(
    qase(
      [1689, 1696],
      'Create a board with Grid Layout - check edit mode in the right panel',
    ),
    async () => {
      await mainTest.step('Verify board with grid layout', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-layout.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await mainTest.step(
        'Open grid edit mode and verify canvas and sidebar',
        async () => {
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-edit-mode.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
          await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
            'grid-edit-right-sidebar-image.png',
            {
              mask: [mainPage.usersSection],
            },
          );
        },
      );
    },
  );

  mainTest(
    qase([1863], 'Add a lot of columns and check "Columns" panel'),
    async () => {
      await mainTest.step('Open grid edit mode and add 30 columns', async () => {
        await designPanelPage.openGridEditModeFromDesignPanel();
        await mainPage.waitForChangeIsSaved();
        await mainPage.addColumnsGridLayout(30);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify canvas and columns panel with 30 columns',
        async () => {
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

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
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

  mainTest(
    qase([1690], 'Create a board with Grid Layout - change direction'),
    async () => {
      await mainTest.step('Change layout direction to Column', async () => {
        const waitForUpdateFile = mainPage.waitForUpdateFileRequest();
        await designPanelPage.changeLayoutDirection('Column', false);
        await waitForUpdateFile;
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify column direction in layers panel', async () => {
        await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
          'column-direction-layer.png',
        );
      });
    },
  );

  mainTest(
    qase([1691], 'Create a board with Grid Layout - change alignment'),
    async () => {
      await mainTest.step('Change layout alignment to Center', async () => {
        await designPanelPage.changeLayoutAlignment('Center', false);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify centered alignment on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-alignment-center.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(
    qase(
      [1692, 1694],
      'Create a board with Grid Layout - change justify and change vertical, horizontal, bottom, and left paddings ',
    ),
    async () => {
      await mainTest.step('Set independent paddings in grid edit mode', async () => {
        await designPanelPage.openGridEditModeFromDesignPanel();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.switchToIndependentPaddingOnGridEdit();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Top', '50');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Left', '50');
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
      });

      await mainTest.step(
        'Verify paddings on canvas and in design panel',
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

      await mainTest.step(
        'Change justification to Space between and verify',
        async () => {
          await designPanelPage.clickGridDoneButton();
          await designPanelPage.changeLayoutJustification('Space between', false);
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-justify-space-between.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkLayoutJustification('Space between', false);
        },
      );
    },
  );

  mainTest(
    qase(
      [1693, 1716, 1744],
      'Create a board with Grid Layout - row gap, Check Gap info on inspect tab,  Check inspect section',
    ),
    async () => {
      await mainTest.step(
        'Set row gap in grid edit mode and verify canvas',
        async () => {
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutRowGapOnGridEdit('50');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-row-gap.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );

      await mainTest.step('Verify row gap is visible on inspect tab', async () => {
        await inspectPanelPage.openInspectTab();
        await inspectPanelPage.openComputedTab();
        await inspectPanelPage.isRowGapExistOnInspectTab();
        await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
          'right-sidebar-inspect-row-gap-image.png',
          {
            mask: [mainPage.usersSection],
          },
        );
      });
    },
  );

  mainTest(
    qase(
      [1695],
      'Create a board with Grid Layout - check edit mode, change columns and rows',
    ),
    async () => {
      await mainTest.step(
        'Open grid edit mode and add a row and column',
        async () => {
          await designPanelPage.openGridEditModeFromDesignPanel();
          await mainPage.waitForChangeIsSaved();
          await mainPage.addRowGridLayoutBtnClick();
          await mainPage.addColumnGridLayoutBtnClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Verify 3x3 grid layout on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-3-3.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
      });
    },
  );
});

mainTest(
  qase(
    [1697, 1735],
    'Check if the grid layout is resized automatically,  Autoscale while resizing',
  ),
  async () => {
    await mainTest.step('Create board with grid layout', async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 200);
      await designPanelPage.changeHeightAndWidthForLayer('300', '400');
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
    });

    await mainTest.step('Resize board and verify layout adapts', async () => {
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
    });

    await mainTest.step(
      'Add rectangles, resize board smaller and verify',
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
        await mainPage.isCornerHandleVisible();
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

mainTest(
  qase(
    [1698],
    'Create a board with Grid Layout - upload an image and add it to the table - check the resizing of the image inside the table',
  ),
  async () => {
    await mainTest.step('Create board with grid layout', async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 300);
      await designPanelPage.changeHeightAndWidthForLayer('900', '900');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isLayoutRemoveButtonExists();
    });

    await mainTest.step('Upload image and add to board', async () => {
      await mainPage.uploadImage('images/sample.jpeg');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('sample');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Resize image and verify layout', async () => {
      await designPanelPage.changeWidthForLayer('800');
      await mainPage.hoverBoardOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'resized-board-with-image.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  },
);

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
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

  mainTest(
    qase(
      [1699],
      'Create a board with Grid Layout with a image and change -  alignment and change vertical, horizontal margin',
    ),
    async () => {
      await mainTest.step('Add three more images to the board', async () => {
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

      await mainTest.step('Change alignment to Center and verify', async () => {
        await designPanelPage.changeLayoutAlignment('Center', false);
        await mainPage.waitForChangeIsSaved();
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

      await mainTest.step('Set independent paddings and verify', async () => {
        await designPanelPage.openGridEditModeFromDesignPanel();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.switchToIndependentPaddingOnGridEdit();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Top', '50');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Left', '50');
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
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-image-paddings.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });
    },
  );

  mainTest(
    qase(
      [1700],
      'Create a board with Grid Layout with a image and create duplicate this image in next column (change vertical direction)',
    ),
    async () => {
      await mainTest.step(
        'Change direction to Column and duplicate image',
        async () => {
          await designPanelPage.changeLayoutDirection('Column', false);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickLayerOnLayersTab('mini_sample');
          await mainPage.duplicateLayerViaLayersTab('mini_sample');
        },
      );

      await mainTest.step(
        'Verify column direction with duplicated image',
        async () => {
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

  mainTest(
    qase(
      [1701],
      'Create a board with Grid Layout with an image and create duplicate this image in next column (change horizontal direction)',
    ),
    async () => {
      await mainTest.step(
        'Change direction to Row and duplicate image',
        async () => {
          await designPanelPage.changeLayoutDirection('Row', false);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickLayerOnLayersTab('mini_sample');
          await mainPage.duplicateLayerViaLayersTab('mini_sample');
        },
      );

      await mainTest.step('Verify row direction with duplicated image', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('row-direction-image.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase([1704], 'Change position and alignment within the Board'),
    async () => {
      await mainTest.step('Enter board and change alignment to Center', async () => {
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
        await designPanelPage.changeLayoutAlignment('Center', false);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify centered alignment', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('alignment-image.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
      });

      await mainTest.step(
        'Change justification to Space between and verify',
        async () => {
          await designPanelPage.changeLayoutJustification('Space between', false);
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot('position-image.png', {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          });
        },
      );
    },
  );

  mainTest(qase([1705], 'Change margin and padding within the Board'), async () => {
    await mainTest.step('Enter board and set independent paddings', async () => {
      await mainPage.clickBoardOnCanvas();
      await mainPage.doubleClickBoardOnCanvas();
      await designPanelPage.switchToIndependentPaddingOnGridEdit();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Top', '50');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Left', '50');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Bottom', '50');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Right', '50');
    });

    await mainTest.step('Verify paddings on canvas and design panel', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-with-image-grid-paddings.png',
        {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        },
      );
      await designPanelPage.verifyLayoutIndependentPaddingValue('Top', '50');
      await designPanelPage.verifyLayoutIndependentPaddingValue('Left', '50');
      await designPanelPage.verifyLayoutIndependentPaddingValue('Bottom', '50');
      await designPanelPage.verifyLayoutIndependentPaddingValue('Right', '50');
    });
  });

  mainTest(qase([1706], 'Adding Flex Board'), async () => {
    await mainTest.step('Add flex layout from design panel', async () => {
      await designPanelPage.addLayoutFromDesignPanel('flex');
      await designPanelPage.isFlexElementSectionOpened();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify flex layout on canvas and sidebar', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-with-flex-layout.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
        'flex-layout-right-sidebar-image.png',
        {
          mask: [mainPage.usersSection],
        },
      );
    });
  });

  mainTest(
    qase(
      [1711],
      'Create a board with Grid Layout - add grid lines as a dashboard - table - change duplicate, add row, delete row, change column numbers',
    ),
    async () => {
      await mainTest.step('Resize board and open grid edit mode', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('600', '400');
        await mainPage.clickBoardOnCanvas();
        await designPanelPage.expandGridLayoutMenu();
        await designPanelPage.openGridEditModeFromDesignPanel();
      });

      await mainTest.step('Delete row and verify', async () => {
        await mainPage.deleteGridRow();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-image-delete-row.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await mainTest.step('Duplicate row and verify', async () => {
        await mainPage.duplicateGridRow();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-image-duplicated-row.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await mainTest.step('Add row below and verify', async () => {
        await mainPage.addGridRowBelow();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-image-add-row-below.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await mainTest.step('Add column right and verify', async () => {
        await mainPage.addGridColumnRight();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-image-add-column-right.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });
    },
  );

  mainTest(
    qase(
      [1713],
      'Create a board with Grid Layout - add grid lines, add 4 pictures of different sizes and change the color for the back',
    ),
    async () => {
      await mainTest.step('Upload additional images and add to board', async () => {
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
      });

      await mainTest.step('Change board fill color to red and verify', async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#FF0000');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'red-board-with-4-image.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(qase([1745], 'Check code section'), async ({ page }) => {
    await mainTest.step('Add rectangle and open inspect code tab', async () => {
      await mainPage.createDefaultRectangleByCoordinates(410, 310, true);
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openCodeTab();
      await page.waitForTimeout(200);
    });

    await mainTest.step('Verify code section in right sidebar', async () => {
      await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
        'right-sidebar-inspect-code-section-image.png',
        {
          mask: [mainPage.usersSection, inspectPanelPage.codeHtmlStrings],
          maxDiffPixelRatio: 0.001,
        },
      );
    });
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  mainTest(
    qase(
      [1715],
      'Create a board with Grid Layout - add grid lines, check edit mode and add the text',
    ),
    async () => {
      await mainTest.step('Create text layer and add it to board', async () => {
        await mainPage.createDefaultTextLayerByCoordinates(500, 500);
        await layersPanelPage.dragAndDropComponentToBoard('Hello world!');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify board with text layer in grid', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-text.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(
    qase(
      [1702],
      'Check fraction units, three dots and check duplicate, add row, delete row',
    ),
    async () => {
      await mainTest.step('Resize board and open grid edit mode', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('600', '400');
        await mainPage.clickBoardOnCanvas();
        await designPanelPage.expandGridLayoutMenu();
        await designPanelPage.openGridEditModeFromDesignPanel();
      });

      await mainTest.step('Duplicate row and verify', async () => {
        await mainPage.duplicateGridRow();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-duplicated-row.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await mainTest.step('Delete row and verify', async () => {
        await mainPage.deleteGridRow();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-delete-row.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });

      await mainTest.step('Add row below and verify', async () => {
        await mainPage.addGridRowBelow();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-add-row-below.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });
    },
  );

  mainTest(
    qase([1703], 'Check fraction units, change px column manual'),
    async () => {
      await mainTest.step('Enter board and change row label to 100 PX', async () => {
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
        await mainPage.changeGridRowLabel('100 PX');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify PX row on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('board-with-px-row.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
      });
    },
  );

  mainTest(
    qase([1708], 'Check occupy two cells (button Area) - vertical and horizontal'),
    async () => {
      await mainTest.step('Enter board and add row and column', async () => {
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
        await mainPage.waitForChangeIsSaved();
        await mainPage.addRowGridLayoutBtnClick();
        await mainPage.addColumnGridLayoutBtnClick();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Select cells and create vertical area, verify',
        async () => {
          await mainPage.selectGridCellMultiple(6, 9);
          await designPanelPage.clickOnAreaButton();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-grid-vertical-area.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );

      await mainTest.step(
        'Select cells and create horizontal area, verify',
        async () => {
          await mainPage.selectGridCellMultiple(1, 2);
          await designPanelPage.clickOnAreaButton();
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

  mainTest(
    qase([1709], 'Check occupy four cells (button Area) - Create Area name'),
    async () => {
      await mainTest.step(
        'Enter board, select four cells and create area',
        async () => {
          await mainPage.clickBoardOnCanvas();
          await mainPage.doubleClickBoardOnCanvas();
          await mainPage.waitForChangeIsSaved();
          await mainPage.selectGridCellMultiple(1, 4);
          await designPanelPage.clickOnAreaButton();
          await designPanelPage.enterAreaName('Test Area  Name');
        },
      );

      await mainTest.step('Verify area with name on canvas', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-4cell-area.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      });
    },
  );

  mainTest(qase([1736], 'Check row numbers in right menu'), async () => {
    await mainTest.step('Enter board and hover on first column button', async () => {
      await mainPage.clickBoardOnCanvas();
      await mainPage.doubleClickBoardOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickOnGridExpandColumnUnitButton();
      await designPanelPage.hoverOnGridFirstColumnSelectButton();
    });

    await mainTest.step('Verify selected column on canvas', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-with-grid-selected-column.png',
        {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        },
      );
    });
  });

  mainTest(qase([1737], 'Locate button'), async () => {
    await mainTest.step(
      'Move board off-screen and open grid edit mode',
      async () => {
        await mainPage.clickBoardOnCanvas();
        await designPanelPage.changeAxisXAndYForLayer('400', '2000');
        await designPanelPage.expandGridLayoutMenu();
        await designPanelPage.openGridEditModeFromDesignPanel();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Hide rulers before taking the snapshot', async () => {
      await mainPage.clickMainMenuButton();
      await mainPage.clickViewMainMenuItem();
      await mainPage.clickHideRulersMainMenuSubItem();
      await mainPage.clickViewportOnce();
    });

    await mainTest.step(
      'Verify board is not visible, then click locate',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot('board-not-visible.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
        await designPanelPage.clickGridLocateButton();
        await expect(mainPage.viewport).toHaveScreenshot('board-visible.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
      },
    );
  });

  mainTest(
    qase(
      [1739, 1742],
      'Duplicate vertical and horizontal direction, Undo element duplication',
    ),
    async () => {
      await mainTest.step('Add rectangle to board', async () => {
        await mainPage.createDefaultRectangleByCoordinates(410, 410, true);
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Duplicate rectangle in column direction and verify',
        async () => {
          await designPanelPage.changeLayoutDirection('Column', false);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickLayerOnLayersTab('Rectangle');
          await mainPage.duplicateLayerViaLayersTab('Rectangle');
          await expect(mainPage.viewport).toHaveScreenshot(
            'column-direction-rectangle.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await mainTest.step(
        'Undo and duplicate rectangle in row direction, verify',
        async () => {
          await mainPage.clickShortcutCtrlZ();
          await mainPage.clickViewportOnce();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutDirection('Row', false);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickLayerOnLayersTab('Rectangle');
          await mainPage.duplicateLayerViaLayersTab('Rectangle');
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

  mainTest(qase([1743], 'Undo element editing'), async () => {
    await mainTest.step('Add rectangle and change fill color to green', async () => {
      await mainPage.createDefaultRectangleByCoordinates(410, 410, true);
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#00FF00');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
    });

    await mainTest.step('Verify green rectangle', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-green-color.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Undo color change and verify', async () => {
      await mainPage.clickViewportOnce();
      await mainPage.clickShortcutCtrlZ();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-undo-color.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([1746], 'Check to add area - manually'), async () => {
    await mainTest.step('Enter board and click on grid cell', async () => {
      await mainPage.clickBoardOnCanvas();
      await mainPage.doubleClickBoardOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickOnGridCell(1);
    });

    await mainTest.step(
      'Set area manually via design panel and verify',
      async () => {
        await designPanelPage.clickOnManualButton();
        await designPanelPage.enterGridCellCoordinate('row', 'end', '3');
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-grid-manual-area.png',
          {
            mask: mainPage.maskViewport({ gridEditorToolbar: true }),
          },
        );
      },
    );
  });

  mainTest(
    qase(
      [1748],
      'Check to add area - When you select cells and then "right click" merge cells',
    ),
    async () => {
      await mainTest.step('Enter board and add row and column', async () => {
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
        await mainPage.waitForChangeIsSaved();
        await mainPage.addRowGridLayoutBtnClick();
        await mainPage.addColumnGridLayoutBtnClick();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Select cells and merge via right click, verify',
        async () => {
          await mainPage.selectGridCellMultiple(1, 3);
          await mainPage.mergeGridCellViaRightClick(3);
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

mainTest(
  qase(
    [1707, 1741],
    'Add grid lines, and upload the images, Check removed some image',
  ),
  async () => {
    await mainTest.step('Create board with grid layout', async () => {
      await mainPage.createDefaultBoardByCoordinates(400, 300);
      await designPanelPage.changeHeightAndWidthForLayer('500', '600');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isLayoutRemoveButtonExists();
    });

    await mainTest.step('Upload image and drag to board', async () => {
      await mainPage.uploadImage('images/mini_sample.jpg');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab('mini_sample', true);
    });

    await mainTest.step('Undo twice and verify image is removed', async () => {
      await mainPage.clickShortcutCtrlZ();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickShortcutCtrlZ();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab('mini_sample', false);
    });
  },
);

mainTest(qase([1710], 'Add grid lines as a dashboard - table'), async () => {
  await mainTest.step('Create board and rename it to Dashboard', async () => {
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickCreatedBoardTitleOnCanvas();
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Dashboard');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isBoardNameDisplayed('Dashboard');
  });

  await mainTest.step('Add grid layout from design panel and verify', async () => {
    await layersPanelPage.clickLayerOnLayersTab('Dashboard');
    await designPanelPage.addLayoutFromDesignPanel('grid');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'dashboard-with-grid-layout.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });
});

mainTest(qase([1712], 'Add grid lines, change px for all column'), async () => {
  await mainTest.step('Create board with grid layout', async () => {
    await mainPage.createDefaultBoardByCoordinates(400, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '600');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
  });

  await mainTest.step(
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
    },
  );

  await mainTest.step('Verify grid layout with PX columns', async () => {
    await expect(mainPage.viewport).toHaveScreenshot('grid-with-px-all-column.png', {
      mask: mainPage.maskViewport({ gridEditorToolbar: true }),
    });
  });
});
