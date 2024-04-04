const { expect, test } = require('@playwright/test');
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');

const teamName = random().concat('autotest');

let teamPage,dashboardPage,mainPage,designPanelPage,layersPanelPage;
test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
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

  mainTest('PENPOT-1693 Change row gap', async ({ page }) => {
    await designPanelPage.openGridEditModeFromDesignPanel();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutRowGapOnGridEdit('50');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-grid-row-gap.png', {
      mask: [mainPage.guides],
    });
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

});
