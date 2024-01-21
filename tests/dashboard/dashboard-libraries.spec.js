const { mainTest } = require('../../fixtures');
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');

const teamName = random().concat('autotest');

let dashboardPage, teamPage, mainPage, assetsPanelPage, designPanelPage, layersPanelPage, colorPalettePage, colorPalettePopUp;
test.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  colorPalettePopUp = new ColorPalettePage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  await teamPage.deleteTeam(teamName);
});

mainTest(
  'PENPOT-1084 Check view for empty library',
  async ({ page }) => {
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      'empty-library.png',
    );
  },
);

mainTest(
  'PENPOT-1541 Create 2 rectangles and look library view',
  async ({ page }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      '2-rectangles-library.png',
    );
  },
);

mainTest(
  'PENPOT-1542 Create 4 ellipses and look at library view',
  async ({ page }) => {
    await mainPage.createDefaultEllipseByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(400, 200, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(400, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      '4-ellipses-library.png',
    );
  },
);

mainTest(
  'PENPOT-1351 Check actual library view after adding / updating / removing assets',
  async ({ page }) => {
    await mainPage.createDefaultTextLayer(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      'library-text-component-added.png',
    );

    await dashboardPage.openSidebarItem('Projects');
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.openFileWithName('New File 1');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.selectMainComponentChildLayer();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#FD1C37');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      'library-text-component-changed-color.png',
    );

    await dashboardPage.openSidebarItem('Projects');
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.openFileWithName('New File 1');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.deleteMainComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      'library-text-component-deleted.png',
    );
  },
);

mainTest(
  'PENPOT-1476 Check view for library with one type of assets',
  async ({ page }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePopUp.setHex('#7D8CB7');
    await colorPalettePopUp.clickSaveColorStyleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      'library-all-assets-type-added.png',
    );
  },
);
