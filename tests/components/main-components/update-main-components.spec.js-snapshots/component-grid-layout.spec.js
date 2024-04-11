const { expect, test } = require('@playwright/test');
const { mainTest } = require('../../../../fixtures');
const { MainPage } = require('../../../../pages/workspace/main-page');
const { LayersPanelPage } = require('../../../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../../../pages/workspace/design-panel-page');
const { random } = require('../../../../helpers/string-generator');
const { TeamPage } = require('../../../../pages/dashboard/team-page');
const { DashboardPage } = require('../../../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('../../../../helpers/saveTestResults.js');
const { InspectPanelPage } = require('../../../../pages/workspace/inspect-panel-page');
const { AssetsPanelPage } = require('../../../../pages/workspace/assets-panel-page');
const { ColorPalettePage } = require('../../../../pages/workspace/color-palette-page');

const teamName = random().concat('autotest');

let teamPage,dashboardPage,mainPage,designPanelPage,layersPanelPage,inspectPanelPage,assetsPanelPage,colorPalettePage;
test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  designPanelPage = new DesignPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
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

  mainTest('PENPOT-1717 Create a component from empty Grid Board', async ({}) => {
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-board-component-with-grid-layout.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1724 Create a component from grid board with some element inside, edit component in grid layout section', async ({}) => {
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.clickBoardOnCanvas();
    await mainPage.doubleClickBoardOnCanvas();
    await mainPage.changeGridRowLabel('100 PX');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-component-with-px-row.png', {
      mask: [mainPage.guides],
    });
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
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.createDefaultRectangleByCoordinates(180, 200, true);
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaLayersTab('Rectangle');
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  // mainTest.only('PENPOT-1718 Copy-paste component, that was created from grid board', async ({browserName}) => {
  //   await mainPage.clickViewportOnce();
  //   await mainPage.clickCreatedBoardTitleOnCanvas();
  //   await mainPage.pressCopyShortcut(browserName);
  //   await mainPage.pressPasteShortcut(browserName);
  //   await expect(mainPage.viewport).toHaveScreenshot('board-component-with-grid-layout-copy-paste.png', {
  //     mask: [mainPage.guides],
  //   });
  //   await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
  //     'copy-paste-layer.png',
  //   );
  // });

  mainTest('PENPOT-1719 Create a component from grid board with some element inside', async ({}) => {
    await expect(mainPage.viewport).toHaveScreenshot('board-component-with-grid-layout-with-rectangle.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1728 Duplicate component, that was created from grid board', async ({browserName}) => {
    await mainPage.clickShortcutCtrlD(browserName);
    await expect(mainPage.viewport).toHaveScreenshot('board-component-with-grid-layout-duplicated.png', {
      mask: [mainPage.guides],
    });
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'duplicated-layer.png',
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
    await mainPage.createDefaultBoardByCoordinates(100, 100);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickShortcutCtrlD(browserName);
    await designPanelPage.changeAxisXandYForLayer('500', '100');
  });

  mainTest('PENPOT-1720 Change the copy component and click "Update main component"', async ({}) => {
    await designPanelPage.changeHeightAndWidthForLayer('25', '25');
    await layersPanelPage.updateMainComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-component-with-grid-layout-main-updated.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1721 Change the copy component and click "Show main component"', async ({}) => {
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#000000');
    await mainPage.waitForChangeIsSaved();
    await mainPage.showMainComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-component-with-grid-layout-main-show.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1722 Change the copy component and click "Reset overrides"', async ({}) => {
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#000000');
    await mainPage.waitForChangeIsSaved();
    await mainPage.resetOverridesViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-component-with-grid-layout-reset-overrides.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('PENPOT-1723 Change the copy component and click "Detach instance"', async ({}) => {
    await designPanelPage.changeHeightAndWidthForLayer('25', '25');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.detachInstanceCopyComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-component-with-grid-layout-detach-instance.png', {
      mask: [mainPage.guides],
    });
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'detach-instance-layer.png',
    );
  });

});
