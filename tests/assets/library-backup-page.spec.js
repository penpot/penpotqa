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
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

let dashboardPage, teamPage, mainPage, assetsPanelPage, designPanelPage, layersPanelPage, colorPalettePage;
test.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.createDefaultRectangleByCoordinates(300, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.addFileAsSharedLibraryViaRightclick();
  await dashboardPage.isSharedLibraryIconDisplayed();

  await dashboardPage.createFileViaTitlePanel();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickLibrariesButton();
  await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
  await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
  await dashboardPage.reloadPage();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickLibraryTitle();
  await assetsPanelPage.clickLibraryComponentsTitle();
  await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.isFileVisibleByName('New File 2');
  await dashboardPage.checkNumberOfFiles('2 files');
  await dashboardPage.deleteFileWithNameViaRightClick('New File 1');
  await dashboardPage.clickDeleteFileButton();

  await dashboardPage.checkNumberOfFiles('1 file');
  await dashboardPage.openFileWithName('New File 2');
  await mainPage.isSecondPageNameDisplayed('Main components');
});

test.afterEach(async ({}, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest(
  qase(1303,'PENPOT-1303 Check main components in Library backup'),
  async () => {
    await mainPage.clickOnPageOnLayersPanel(false);
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-component-library-backup.png',
    );
  },
);

mainTest(
  qase(1370,'PENPOT-1370 Rename Library backup page'),
  async () => {
    await mainPage.clickOnPageOnLayersPanel(false);
    await mainPage.renamePageViaRightClick('Test', false);
    await mainPage.isSecondPageNameDisplayed('Test');
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'renamed-library-backup.png',
    );
  },
);

mainTest(
  qase(1371,'PENPOT-1371 Add/Delete main components from Library backup page'),
  async () => {
    await mainPage.clickOnPageOnLayersPanel(false);
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'add-main-component-library-backup.png',
    );
    await layersPanelPage.deleteMainComponentViaRightClick();
    await expect(mainPage.viewport).toHaveScreenshot(
      'delete-main-component-library-backup.png',
    );
  },
);

test.describe(() => {
  test.beforeEach(async () => {
    await mainPage.clickOnPageOnLayersPanel(false);
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.deleteMainComponentViaRightClick();
  });

  mainTest(
    qase(1372,'PENPOT-1372 Restore components, that were deleted from library backup'),
    async ({ browserName }) => {
      await mainPage.clickShortcutCtrlZ(browserName);
      await expect(mainPage.viewport).toHaveScreenshot(
        'restored-main-component-library-backup.png',
      );
    },
  );
});

mainTest(
  qase(1373,'PENPOT-1373 Delete Library backup page'),
  async () => {
    await mainPage.clickOnPageOnLayersPanel(false);
    await mainPage.deleteSecondPageViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isFirstPageNameDisplayed('Page 1');
    await expect(mainPage.pagesBlock).toHaveScreenshot(
      'deleted-library-backup.png'
    );
  },
);

mainTest(
  qase(1374,'PENPOT-1374 Duplicate Library backup page'),
  async () => {
    await mainPage.clickOnPageOnLayersPanel(false);
    await mainPage.duplicatePageViaRightClick(false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.pagesBlock).toHaveScreenshot(
      'duplicated-library-backup.png'
    );
  },
);

mainTest(
  qase(1516,'PENPOT-1516 Check Library backup file in case of unpublishing a few shared libraries'),
  async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 20000);

    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.isFileVisibleByName('New File 2');

    await dashboardPage.createFileViaTitlePanel();
    await mainPage.isMainPageLoaded();
    await mainPage.createDefaultEllipseByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.isFileVisibleByName('New File 1');
    await dashboardPage.checkNumberOfFiles('2 files');
    await dashboardPage.addFileWithNameAsSharedLibraryViaRightClick('New File 1');

    await dashboardPage.createFileViaTitlePanel();
    await mainPage.isMainPageLoaded();
    await mainPage.createDefaultTextLayer(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('3 files');
    await dashboardPage.addFileWithNameAsSharedLibraryViaRightClick('New File 3');

    await dashboardPage.openFileWithName('New File 2');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
    await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
    await assetsPanelPage.isSharedLibraryVisibleByName('New File 3');
    await assetsPanelPage.clickSharedLibraryImportButton('New File 3');
    await assetsPanelPage.clickCloseModalButton();

    await layersPanelPage.openLayersTab();
    await mainPage.clickOnPageOnLayersPanel(false);

    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryTitleWithName('New File 3');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Hello World!');
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickPencilBoxButton();
    await dashboardPage.openFileWithName('New File 1');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isRemoveAsSharedLibraryButtonVisible();
    await expect(dashboardPage.deleteFileModalWindow).toHaveScreenshot(
      'file1-library-delete-warning.png',
    );
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    await assetsPanelPage.clickCloseModalButton();

    await mainPage.clickPencilBoxButton();
    await dashboardPage.openFileWithName('New File 3');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isRemoveAsSharedLibraryButtonVisible();
    await expect(dashboardPage.deleteFileModalWindow).toHaveScreenshot(
      'file3-library-delete-warning.png',
    );
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    await assetsPanelPage.clickCloseModalButton();
  },
);
