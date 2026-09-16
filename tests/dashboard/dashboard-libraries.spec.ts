import { demoAccountApiFixture, demoAccountFileTest } from 'fixtures';
import { expect } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { qase } from 'playwright-qase-reporter/playwright';

let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ page }) => {
    layersPanelPage = new LayersPanelPage(page);
    designPanelPage = new DesignPanelPage(page);
    colorPalettePage = new ColorPalettePage(page);
  });

  demoAccountFileTest(
    qase(
      1351,
      'Check actual library view after adding / updating / removing assets',
    ),
    async ({ mainPage, dashboardPage }) => {
      await mainPage.createDefaultTextLayer();
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickPencilBoxButton();
      await dashboardPage.hideLibrariesAndTemplatesCarrousel();
      await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
      await dashboardPage.isSharedLibraryIconDisplayed();
      await dashboardPage.openSidebarItem('Libraries');
      await dashboardPage.isFilePresentWithName('New File 1');
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
      await dashboardPage.isFilePresentWithName('New File 1');
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
      await dashboardPage.isFilePresentWithName('New File 1');
      await expect(dashboardPage.dashboardLibraryItem).toHaveScreenshot(
        'library-text-component-deleted.png',
      );
    },
  );

  demoAccountFileTest.describe(() => {
    demoAccountFileTest.beforeEach(async ({ mainPage, dashboardPage }) => {
      await mainPage.clickPencilBoxButton();
      await dashboardPage.hideLibrariesAndTemplatesCarrousel();
      await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
      await dashboardPage.isSharedLibraryIconDisplayed();
      await dashboardPage.openSidebarItem('Libraries');
      await dashboardPage.isFilePresentWithName('New File 1');
    });

    demoAccountFileTest(
      qase(1057, 'Rename file from Libraries tab'),
      async ({ dashboardPage }) => {
        await dashboardPage.renameFile('New File 1', 'Renamed Test File');
        await dashboardPage.isFilePresentWithName('Renamed Test File');
      },
    );

    demoAccountFileTest(
      qase(1058, 'Duplicate file from Libraries tab'),
      async ({ dashboardPage }) => {
        await dashboardPage.duplicateFileViaRightclick();
        await dashboardPage.openSidebarItem('Projects');
        await dashboardPage.checkNumberOfFiles('2 files');
      },
    );
  });
});

demoAccountApiFixture(
  qase(
    1088,
    'Check view for Penpot libraries (imported from Libraries & Templates carousel)',
  ),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const libraryAndTemplateName1 = 'Wireframe library';
    const libraryImportedName = 'Wireframing kit v1.1';

    await dashboardPage.isHeaderDisplayed('Projects');

    await demoAccountApiFixture.step(
      'Import library from Libraries & Templates',
      async () => {
        await dashboardPage.showLibrariesAndTemplatesCarrousel();
        await dashboardPage.downloadFromLibrariesAndTemplates(
          libraryAndTemplateName1,
        );
      },
    );

    await demoAccountApiFixture.step(
      'Check library imported in Drafts page',
      async () => {
        await dashboardPage.openSidebarItem('Drafts');
        await dashboardPage.isFilePresentWithName(libraryImportedName);
        await dashboardPage.isSharedLibraryIconDisplayed();
      },
    );

    await demoAccountApiFixture.step(
      'Check library imported in Libraries page',
      async () => {
        await dashboardPage.openSidebarItem('Libraries');
        await dashboardPage.isFilePresentWithName(libraryImportedName);
      },
    );
  },
);
