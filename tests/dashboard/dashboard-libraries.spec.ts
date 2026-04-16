import { mainTest } from 'fixtures';
import { expect } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { random } from 'helpers/string-generator';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = random().concat('autotest');

let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let mainPage: MainPage;
let assetsPanelPage: AssetsPanelPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let colorPalettePopUp: ColorPalettePage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  colorPalettePopUp = new ColorPalettePage(page);

  await teamPage.createTeam(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.hideLibrariesAndTemplatesCarrousel();
});

mainTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
  });

  mainTest(qase(1084, 'Check view for empty library'), async () => {
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
      'empty-library.png',
    );
  });

  mainTest(qase(1541, 'Create 2 rectangles and look library view'), async () => {
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
  });

  mainTest(qase(1542, 'Create 4 ellipses and look at library view'), async () => {
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
  });

  mainTest(
    qase(
      1351,
      'Check actual library view after adding / updating / removing assets',
    ),
    async () => {
      await mainPage.createDefaultTextLayer();
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
    qase(1476, 'Check view for library with one type of assets'),
    async () => {
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

  mainTest.describe(() => {
    mainTest.beforeEach(async () => {
      await mainPage.clickPencilBoxButton();
      await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
      await dashboardPage.isSharedLibraryIconDisplayed();
      await dashboardPage.openSidebarItem('Libraries');
      await dashboardPage.isFilePresent('New File 1');
    });

    mainTest(qase(1057, 'Rename file from Libraries tab'), async () => {
      await dashboardPage.renameFile('Renamed Test File');
      await dashboardPage.isFilePresent('Renamed Test File');
    });

    mainTest(qase(1058, 'Duplicate file from Libraries tab'), async () => {
      await dashboardPage.duplicateFileViaRightclick();
      await dashboardPage.openSidebarItem('Projects');
      await dashboardPage.checkNumberOfFiles('2 files');
    });
  });
});

mainTest(
  qase(
    1088,
    'Check view for Penpot libraries (imported from Libraries & Templates carousel)',
  ),
  async () => {
    const libraryAndTemplateName1 = 'Wireframe library';
    const libraryImportedName = 'Wireframing kit v1.1';

    await mainTest.step('Import library from Libraries & Templates', async () => {
      await dashboardPage.showLibrariesAndTemplatesCarrousel();
      await dashboardPage.downloadFromLibrariesAndTemplates(libraryAndTemplateName1);
    });

    await mainTest.step('Check library imported in Drafts page', async () => {
      await dashboardPage.openSidebarItem('Drafts');
      await dashboardPage.isFilePresentWithName(libraryImportedName);
      await dashboardPage.isSharedLibraryIconDisplayed();
    });

    await mainTest.step('Check library imported in Libraries page', async () => {
      await dashboardPage.openSidebarItem('Libraries');
      await dashboardPage.isFilePresentWithName(libraryImportedName);
    });
  },
);
