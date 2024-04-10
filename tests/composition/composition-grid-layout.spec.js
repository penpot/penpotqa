const { expect, test } = require('@playwright/test');
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { InspectPanelPage } = require('../../pages/workspace/inspect-panel-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');

const teamName = random().concat('autotest');

let teamPage,dashboardPage,mainPage,designPanelPage,layersPanelPage,inspectPanelPage,assetsPanelPage,colorPalettePage;
test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest('PENPOT-1689,1696 Check grid lines, check edit mode in the right panel', async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(200, 300);
  await designPanelPage.changeHeightAndWidthForLayer('300', '400');
  await mainPage.waitForChangeIsSaved();
  await mainPage.addGridLayoutViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.isLayoutRemoveButtonExists();
  await mainPage.clickViewportOnce();
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-layout.png', {
    mask: [mainPage.guides],
  });
  await designPanelPage.openGridEditModeFromDesignPanel();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-edit-mode.png', {
    mask: [mainPage.guides],
  });
  await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
    'grid-edit-right-sidebar-image.png',
    {
      mask: [mainPage.usersSection],
    },
  );
});

test.describe(() => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(400, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '600');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();

    await mainPage.createDefaultEllipseByCoordinates(200, 200, true);
    await mainPage.createComponentViaRightClick();
    await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
    await mainPage.createComponentViaRightClick();
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 200, true);
    await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
    await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest('PENPOT-1690 Change direction', async ({ page }) => {
    await designPanelPage.changeLayoutDirection('Column', false);
    await mainPage.waitForChangeIsSaved();
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'column-direction-layer.png',
    );
  });

  mainTest('PENPOT-1691 Change alignment', async ({ page }) => {
    await designPanelPage.changeLayoutAlignment('Center', false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-alignment-center.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1692 Change justify - PENPOT-1694 Сhange vertical, horizontal, bottom and left paddings', async ({ page }) => {
    await designPanelPage.openGridEditModeFromDesignPanel();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.switchToIndependentPaddingOnGridEdit();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Top', '50');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Left', '50');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Bottom', '50');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Right', '50');
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-paddings.png', {
      mask: [mainPage.guides],
    });
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'grid-edit-right-sidebar-paddings-image.png',
      {
        mask: [mainPage.usersSection],
      },
    );
    await designPanelPage.clickGridDoneButton();
    await designPanelPage.changeLayoutJustification('Space between', false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-justify-space-between.png', {
      mask: [mainPage.guides],
    });
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'right-sidebar-justify-image.png',
      {
        mask: [mainPage.usersSection],
      },
    );
  });

  mainTest('PENPOT-1693,1716,1744 Change row gap, Check Gap info on inspect tab', async ({ page }) => {
    await designPanelPage.openGridEditModeFromDesignPanel();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutRowGapOnGridEdit('50');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-row-gap.png', {
      mask: [mainPage.guides],
    });
    await inspectPanelPage.openInspectTab();
    await inspectPanelPage.isRowGapExistOnInspectTab();
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'right-sidebar-inspect-row-gap-image.png',
      {
        mask: [mainPage.usersSection],
      },
    );
  });

  mainTest('PENPOT-1695 Change columns and rows', async ({ page }) => {
    await designPanelPage.openGridEditModeFromDesignPanel();
    await mainPage.waitForChangeIsSaved();
    await mainPage.addRowGridLayoutBtnClick();
    await mainPage.addColumnGridLayoutBtnClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-3-3.png', {
      mask: [mainPage.guides],
    });
  });
});

mainTest('PENPOT-1697,1735 Check if the grid layout is resized automatically', async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(200, 300);
  await designPanelPage.changeHeightAndWidthForLayer('300', '400');
  await mainPage.waitForChangeIsSaved();
  await mainPage.addGridLayoutViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.isLayoutRemoveButtonExists();
  await mainPage.clickViewportOnce();
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await designPanelPage.changeHeightAndWidthForLayer('400', '600');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('resized-board-with-grid-layout.png', {
    mask: [mainPage.guides],
  });
  await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
  await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
  await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportOnce();
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await designPanelPage.changeHeightAndWidthForLayer('200', '300');
  await expect(mainPage.viewport).toHaveScreenshot('resized-board-with-rectangle.png', {
    mask: [mainPage.guides],
  });
});

mainTest('PENPOT-1698 Upload an image and add it to the table - check the resizing of the image inside the table', async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(200, 300);
  await designPanelPage.changeHeightAndWidthForLayer('600', '600');
  await mainPage.waitForChangeIsSaved();
  await mainPage.addGridLayoutViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.isLayoutRemoveButtonExists();
  await mainPage.uploadImage('images/sample.jpeg');
  await layersPanelPage.dragAndDropComponentToBoard('sample');
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportOnce();
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await designPanelPage.changeHeightAndWidthForLayer('700', '800');
  await designPanelPage.openGridEditModeFromDesignPanel();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('resized-board-with-image.png', {
    mask: [mainPage.guides],
  });
});

test.describe(() => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(400, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '600');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();

    await mainPage.uploadImage('images/mini_sample.jpg');
    await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest('PENPOT-1699 Image and change -  alignment and change vertical, horizontal margin', async ({ page }) => {
    await mainPage.uploadImage('images/mini_sample.jpg');
    await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImage('images/mini_sample.jpg');
    await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImage('images/mini_sample.jpg');
    await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();

    await designPanelPage.changeLayoutAlignment('Center', false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-image-alignment-center.png', {
      mask: [mainPage.guides],
    });

    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();

    await designPanelPage.openGridEditModeFromDesignPanel();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.switchToIndependentPaddingOnGridEdit();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Top', '50');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Left', '50');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Bottom', '50');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPaddingOnGridEdit('Right', '50');
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-image-paddings.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1700 Create a board with Grid Layout with a image and create duplicate this image in next column (change vertical direction)', async ({ page }) => {
    await designPanelPage.changeLayoutDirection('Column', false);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickLayerOnLayersTab('mini_sample');
    await mainPage.duplicateLayerViaLayersTab('mini_sample');
    await expect(mainPage.viewport).toHaveScreenshot(
      'column-direction-image.png', {
        mask: [mainPage.guides],
      });
  });

  mainTest('PENPOT-1701 Create a board with Grid Layout with a image and create duplicate this image in next column (change horizontal direction)', async ({ page }) => {
    await designPanelPage.changeLayoutDirection('Row', false);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickLayerOnLayersTab('mini_sample');
    await mainPage.duplicateLayerViaLayersTab('mini_sample');
    await expect(mainPage.viewport).toHaveScreenshot(
      'row-direction-image.png', {
        mask: [mainPage.guides],
      });
  });

  mainTest('PENPOT-1704 Change position and alignment within the Board', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await designPanelPage.changeLayoutAlignment('Center', false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'alignment-image.png', {
        mask: [mainPage.guides],
      });
    await designPanelPage.changeLayoutJustification('Space between', false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'position-image.png', {
        mask: [mainPage.guides],
      });
  });

  mainTest('PENPOT-1705 Change margin and padding within the Board', async ({ page }) => {
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
    await expect(mainPage.viewport).toHaveScreenshot('board-with-image-grid-paddings.png', {
      mask: [mainPage.guides],
    });
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'grid-edit-right-sidebar-paddings-image2.png',
      {
        mask: [mainPage.usersSection],
      },
    );
  });

  mainTest('PENPOT-1706 Adding Flex Board', async ({ page }) => {
    await designPanelPage.addLayoutFromDesignPanel('flex');
    await designPanelPage.isFlexElementSectionOpened();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-flex-layout.png', {
      mask: [mainPage.guides],
    });
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'flex-layout-right-sidebar-image.png',
      {
        mask: [mainPage.usersSection],
      },
    );
  });

  mainTest('PENPOT-1711 add grid lines as a dashboard - table - change duplicate, add row, delete row, change column numbers', async ({ page }) => {
    await designPanelPage.changeHeightAndWidthForLayer('600', '400');
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.deleteGridRow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-image-delete-row.png', {
      mask: [mainPage.guides],
    });
    await mainPage.duplicateGridRow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-image-duplicated-row.png', {
      mask: [mainPage.guides],
    });
    await mainPage.addGridRowBelow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-image-add-row-below.png', {
      mask: [mainPage.guides],
    });
    await mainPage.addGridColumnRight();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-image-add-column-right.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1713  Add 4 pictures of different sizes and change the color for the back', async ({ page }) => {
    await mainPage.uploadImage('images/horizontal_sample.jpg');
    await layersPanelPage.dragAndDropComponentToBoard('horizontal_sample');
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImage('images/vertical_sample.jpg');
    await layersPanelPage.dragAndDropComponentToBoard('vertical_sample');
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImage('images/mini_sample2.jpg');
    await layersPanelPage.dragAndDropComponentToBoard('mini_sample2');
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();

    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#FF0000');
    await mainPage.waitForChangeIsSaved();

    await expect(mainPage.viewport).toHaveScreenshot('red-board-with-4-image.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1745 Check code section', async ({ page }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await inspectPanelPage.openInspectTab();
    await inspectPanelPage.openCodeTab();
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'right-sidebar-inspect-code-section-image.png',
      {
        mask: [mainPage.usersSection],
      },
    );
  });
});

test.describe(() => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  mainTest('PENPOT-1715 Add grid lines, check edit mode and add the text', async ({ page }) => {
    await mainPage.createDefaultTextLayer();
    await layersPanelPage.dragAndDropComponentToBoard('Hello World!');
    await mainPage.waitForChangeIsSaved();

    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-text.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1702 Check fraction units, three dots and check duplicate, add row, delete row', async ({ page }) => {
    await designPanelPage.changeHeightAndWidthForLayer('600', '400');
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.duplicateGridRow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-duplicated-row.png', {
      mask: [mainPage.guides],
    });
    await mainPage.deleteGridRow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-delete-row.png', {
      mask: [mainPage.guides],
    });
    await mainPage.addGridRowBelow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-add-row-below.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1703 Check fraction units, change px column manual', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.changeGridRowLabel('100 PX');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-px-row.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1708 Check occupy two cells (button Area) - vertical and horizontal', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await mainPage.addRowGridLayoutBtnClick();
    await mainPage.addColumnGridLayoutBtnClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.selectGridCellMultiple(6,9);
    await designPanelPage.clickOnAreaButton();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-vertical-area.png', {
      mask: [mainPage.guides],
    });
    await mainPage.selectGridCellMultiple(1,2);
    await designPanelPage.clickOnAreaButton();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-horizontal-area.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1709 Check occupy four cells (button Area) - Create Area name', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await mainPage.selectGridCellMultiple(1,4);
    await designPanelPage.clickOnAreaButton();
    await designPanelPage.enterAreaName('Test Area  Name');
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-4cell-area.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1736 Check row numbers in right menu', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickOnGridExpandColumnUnitButton();
    await designPanelPage.hoverOnGridFirstColumnSelectButton();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-selected-column.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1737 Locate button', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await designPanelPage.changeAxisXandYForLayer('400', '2000');
    await designPanelPage.addLayoutFromDesignPanel('grid');
    await designPanelPage.openGridEditModeFromDesignPanel();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-not-visible.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.clickGridLocateButton();
    await expect(mainPage.viewport).toHaveScreenshot('board-visible.png', {
      mask: [mainPage.guides],
    });
  });

  // mainTest.only('PENPOT-1738 Move element inside grid board', async ({ page }) => {
  //   await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
  //   await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  //   await mainPage.waitForChangeIsSaved();
  //   await mainPage.dragAndDropComponentToAnotherFraction(2, page);
  //   await mainPage.waitForChangeIsSaved();
  //   await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-move-element.png', {
  //     mask: [mainPage.guides],
  //   });
  // });

  mainTest('PENPOT-1739,1742 Duplicate vertical and horizontal direction, undo element duplication', async ({ browserName }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();

    await designPanelPage.changeLayoutDirection('Column', false);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickLayerOnLayersTab('Rectangle');
    await mainPage.duplicateLayerViaLayersTab('Rectangle');
    await expect(mainPage.viewport).toHaveScreenshot(
      'column-direction-rectangle.png', {
        mask: [mainPage.guides],
      });
    await mainPage.clickShortcutCtrlZ(browserName);
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutDirection('Row', false);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickLayerOnLayersTab('Rectangle');
    await mainPage.duplicateLayerViaLayersTab('Rectangle');
    await expect(mainPage.viewport).toHaveScreenshot(
      'row-direction-rectangle.png', {
        mask: [mainPage.guides],
      });
  });

  mainTest('PENPOT-1743 Undo element editing', async ({ browserName }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#00FF00');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-green-color.png', {
        mask: [mainPage.guides],
      });
    await mainPage.clickViewportOnce();
    await mainPage.clickShortcutCtrlZ(browserName);
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-undo-color.png', {
        mask: [mainPage.guides],
      });
  });

  mainTest('PENPOT-1746 Check to add area - manually', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnGridCell(1);
    await designPanelPage.clickOnManualButton();
    await designPanelPage.enterGridCellCoordinate('row', 'end', '3');
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-manual-area.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1748 Check to add area - When you select cells and then “right click” merge cells', async ({ page }) => {
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await mainPage.addRowGridLayoutBtnClick();
    await mainPage.addColumnGridLayoutBtnClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.selectGridCellMultiple(1,3);
    await mainPage.mergeGridCellViaRightClick(3);
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-horizontal-area-right.png', {
      mask: [mainPage.guides],
    });
  });
});

mainTest('PENPOT-1707,1741 Add grid lines, and upload the images, check removed some image', async ({ page, browserName }) => {
  await mainPage.createDefaultBoardByCoordinates(400, 300);
  await designPanelPage.changeHeightAndWidthForLayer('500', '600');
  await mainPage.waitForChangeIsSaved();
  await mainPage.addGridLayoutViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.isLayoutRemoveButtonExists();

  await mainPage.uploadImage('images/mini_sample.jpg');
  await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickShortcutCtrlZ(browserName);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickShortcutCtrlZ(browserName);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('grid-with-removed-image.png', {
    mask: [mainPage.guides],
  });
});

mainTest('PENPOT-1710 Add grid lines as a dashboard - table', async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(200, 300);
  await designPanelPage.changeHeightAndWidthForLayer('300', '400');
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedBoardTitleOnCanvas();
  await layersPanelPage.renameCreatedLayer('Dashboard');
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.isBoardNameDisplayed('Dashboard');
  await layersPanelPage.clickLayerOnLayersTab('Dashboard');
  await designPanelPage.addLayoutFromDesignPanel('grid');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('dashboard-with-grid-layout.png', {
    mask: [mainPage.guides],
  });
});

mainTest('PENPOT-1712 Add grid lines, change px for all column', async ({ page, browserName }) => {
  await mainPage.createDefaultBoardByCoordinates(400, 300);
  await designPanelPage.changeHeightAndWidthForLayer('500', '600');
  await mainPage.waitForChangeIsSaved();
  await mainPage.addGridLayoutViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.isLayoutRemoveButtonExists();
  await mainPage.clickBoardOnCanvas();
  await mainPage.doubleClickBoardOnCanvas();

  await designPanelPage.clickOnGridExpandColumnUnitButton();
  await designPanelPage.selectGridCellUnit(1,'PX');
  await designPanelPage.selectGridCellUnit(2,'PX');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.enterGridCellValue(1,'200');
  await designPanelPage.enterGridCellValue(2,'200');
  await designPanelPage.clickOnGridExpandColumnUnitButton();
  await designPanelPage.clickOnGridExpandRowUnitButton();
  await designPanelPage.selectGridCellUnit(1,'PX');
  await designPanelPage.selectGridCellUnit(2,'PX');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.enterGridCellValue(1,'200');
  await designPanelPage.enterGridCellValue(2,'200');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('grid-with-px-all-column.png', {
    mask: [mainPage.guides],
  });
});
