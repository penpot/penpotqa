const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const {
  ColorPalettePage,
} = require('../../pages/workspace/color-palette-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest('CO-272 Create Path from toolbar - closed', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-closed.png');
});

mainTest('CO-274 Create Path from toolbar - opened', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultOpenPath();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-opened.png');
});

mainTest('CO-277 Rename path with valid name', async ({ page }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultClosedPath();
  await layersPanelPage.doubleClickLayerOnLayersTab('Path');
  await layersPanelPage.renameCreatedLayer('renamed path');
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.isLayerNameDisplayed('renamed path');
});

mainTest(
  'CO-279 Add, hide, unhide, change type and delete Shadow to Path',
  async ({ page }) => {
    test.setTimeout(70000);
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createDefaultOpenPath();
    await designPanelPage.clickAddShadowButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'path-drop-shadow-default.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.hideShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'path-drop-shadow-hide.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.unhideShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'path-drop-shadow-unhide.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.selectTypeForShadow('Inner shadow');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'path-inner-shadow-default.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.removeShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'path-inner-shadow-remove.png',
      {
        mask: [mainPage.guides],
      },
    );
  },
);

mainTest('CO-280 Add and edit Shadow to path', async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.createDefaultOpenPath();
  await designPanelPage.clickAddShadowButton();
  await designPanelPage.clickShadowActionsButton();
  await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
  await designPanelPage.clickShadowColorIcon();
  await colorPalettePage.setHex('#304d6a');
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-drop-shadow.png');
  await designPanelPage.selectTypeForShadow('Inner shadow');
  await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
  await designPanelPage.clickShadowColorIcon();
  await colorPalettePage.setHex('#96e637');
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-inner-shadow.png');
});

mainTest(
  'CO-282 Add, hide, unhide and delete Blur to Path',
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createDefaultClosedPath();
    await designPanelPage.clickAddBlurButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-default.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.hideBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-hide.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.unhideBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-unhide.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.removeBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-remove.png', {
      mask: [mainPage.guides],
    });
  },
);

mainTest('CO-283 Add and edit Blur to path', async ({ page }) => {
  const mainPage = new MainPage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.createDefaultClosedPath();
  await designPanelPage.clickAddBlurButton();
  await designPanelPage.changeValueForBlur('55');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-blur.png');
});

mainTest('CO-297 Add rotation to path', async ({ page }) => {
  const mainPage = new MainPage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.createDefaultClosedPath();
  await designPanelPage.changeRotationForLayer('90');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-rotated-90.png');
  await designPanelPage.changeRotationForLayer('120');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-rotated-120.png');
  await designPanelPage.changeRotationForLayer('45');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-rotated-45.png');
  await designPanelPage.changeRotationForLayer('360');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-rotated-359.png');
});

mainTest('CO-298-1 Delete path via rightclick', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
});

mainTest('CO-298-2 Delete path via shortcut Del', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
});

mainTest(
  'CO-303 Hide and show path from rightclick and icons',
  async ({ page }) => {
    test.setTimeout(70000);
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const path1 = 'Path #1';
    const path2 = 'Path #2';
    await mainPage.createDefaultClosedPath();
    await layersPanelPage.doubleClickLayerOnLayersTab('Path');
    await layersPanelPage.renameCreatedLayer(path1);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCreatePathButton();
    await mainPage.clickViewportByCoordinates(200, 300);
    await mainPage.clickViewportByCoordinates(300, 500);
    await mainPage.clickViewportByCoordinates(100, 200);
    await mainPage.clickViewportByCoordinates(200, 300);
    await mainPage.clickOnDesignTab();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.doubleClickLayerOnLayersTab('Path');
    await layersPanelPage.renameCreatedLayer(path2);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportOnce();
    await layersPanelPage.hideUnhideLayerByIconOnLayersTab(path1);
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot('path-first-hide.png', {
      mask: [mainPage.guides, mainPage.usersSection],
    });
    await layersPanelPage.hideLayerViaRightClickOnLayersTab(path2);
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot('path-second-hide.png', {
      mask: [mainPage.guides, mainPage.usersSection],
    });
    await layersPanelPage.hideUnhideLayerByIconOnLayersTab(path2, false);
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot('path-second-show.png', {
      mask: [mainPage.guides, mainPage.usersSection],
    });
    await layersPanelPage.unHideLayerViaRightClickOnLayersTab(path1);
    await expect(page).toHaveScreenshot('path-first-show.png', {
      mask: [mainPage.guides, mainPage.usersSection],
    });
  },
);

mainTest('CO-310 Flip Vertical and Flip Horizontal path', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.flipVerticalViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-flipped-vertical.png');
  await mainPage.flipHorizontalViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    'path-flipped-vertical-horizontal.png',
  );
  await mainPage.flipVerticalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    'path-flipped-horizontal.png',
  );
  await mainPage.flipHorizontalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-non-flipped-jpeg.png');
});

mainTest('CO-322 Selection to board', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-to-board.png');
});
