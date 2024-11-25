const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

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

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(
  qase(817, "PF-99 Hide/show grids via shortcut CTRL '"),
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();

    await designPanelPage.clickAddGridButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-default.png');
    await mainPage.pressHideShowGridsShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-hide.png');
    await mainPage.pressHideShowGridsShortcut();
    await mainPage.waitForChangeIsSaved(browserName);
    await expect(mainPage.createdLayer).toHaveScreenshot('square-grid-default.png');
  },
);

mainTest(qase(816, 'PF-98-1 Hide/show rulers via main menu'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideRulersMainMenuSubItem();
  await mainPage.clickViewportOnce();
  await expect(mainPage.viewport).toHaveScreenshot('viewport-hidden-rulers.png');
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowRulersMainMenuSubItem();
  await mainPage.clickViewportOnce();
  await expect(mainPage.viewport).toHaveScreenshot('viewport-default.png');
});

mainTest(
  qase(816, 'PF-98-2 Hide/show rulers via shortcut CTRL SHIFT R'),
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickViewportTwice();
    await mainPage.pressHideShowRulersShortcut(browserName);
    await expect(mainPage.viewport).toHaveScreenshot('viewport-hidden-rulers.png');
    await mainPage.pressHideShowRulersShortcut(browserName);
    await expect(mainPage.viewport).toHaveScreenshot('viewport-default.png');
  },
);

mainTest(
  qase(819, 'PF-101 Hide/show color palette - file library check'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePage.setHex('#ffff00');
    await colorPalettePage.clickSaveColorStyleButton();
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickShowColorPaletteMainMenuSubItem();
    await mainPage.isColorsPaletteDisplayed();
    await colorPalettePage.openColorPaletteMenu();
    await colorPalettePage.selectColorPaletteMenuOption('File library');
    await expect(mainPage.typographiesColorsBottomPanel).toHaveScreenshot(
      'colors-file-library.png',
    );
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickHideColorPaletteMainMenuSubItem();
    await mainPage.isColorsPaletteNotDisplayed();
  },
);

mainTest(qase(820, 'PF-102 Hide/show board names'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('board-hide-name.png');
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('board-show-name.png');
});

mainTest(
  qase(821, 'PF-103-1 Hide/show pixel grid via main menu'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickViewportTwice();
    await mainPage.increaseZoom(10);
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png');
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickHidePixelGridMainMenuSubItem();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-hide-pixel-grid.png');
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickShowPixelGridMainMenuSubItem();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png');
  },
);

mainTest(
  qase(821, 'PF-103-2 Hide/show pixel grid via shortcut SHIFT ,'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickViewportTwice();
    await mainPage.increaseZoom(10);
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png');
    await mainPage.pressHideShowPixelGridShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-hide-pixel-grid.png');
    await mainPage.pressHideShowPixelGridShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png');
  },
);

mainTest(
  qase(822, 'PF-104 Hide/show UI via main menu and shortcut "/"'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-ui.png');
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickShowHideUIMainMenuSubItem();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-hide-ui.png');
    await mainPage.pressHideShowUIShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-ui.png');
  },
);

mainTest(
  qase(827, 'PF-109 Select all via main menu and shortcut CTRL A'),
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.createDefaultRectangleByCoordinates(250, 350);
    await mainPage.createDefaultEllipseByCoordinates(100, 600);
    await mainPage.clickViewportTwice();
    await expect(mainPage.viewport).toHaveScreenshot('layers-all-unselected.png', {
      mask: [mainPage.guides],
    });
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
    await expect(mainPage.viewport).toHaveScreenshot('layers-all-selected.png', {
      mask: [mainPage.guides],
    });
    await mainPage.clickViewportTwice();
    await expect(mainPage.viewport).toHaveScreenshot('layers-all-unselected.png', {
      mask: [mainPage.guides],
    });
    await mainPage.pressSelectAllShortcut(browserName);
    await expect(mainPage.viewport).toHaveScreenshot('layers-all-selected.png', {
      mask: [mainPage.guides],
    });
  },
);

mainTest(qase(1911, 'Download Penpot file (.penpot)'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.downloadPenpotFileViaMenu();
});

mainTest(qase(831, 'PF-113 Add/Remove as shared library'), async ({ page }) => {
  const mainPage = new MainPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.clickAddAsSharedLibraryMainMenuSubItem();
  await assetsPanelPage.clickAddAsSharedLibraryButton();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.isSharedLibraryBadgeVisible();
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.clickRemoveAsSharedLibraryMainMenuSubItem();
  await assetsPanelPage.clickRemoveAsSharedLibraryButton();
  await assetsPanelPage.isSharedLibraryBadgeNotVisible();
});
