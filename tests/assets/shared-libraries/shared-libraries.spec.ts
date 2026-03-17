import { mainTest } from 'fixtures';
import { expect } from 'playwright/test';
import { DashboardPage } from 'pages/dashboard/dashboard-page';
import { TeamPage } from 'pages/dashboard/team-page';
import { MainPage } from 'pages/workspace/main-page';
import { AssetsPanelPage } from 'pages/workspace/assets-panel-page';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';

const teamName = random().concat('autotest');

let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let mainPage: MainPage;
let assetsPanelPage: AssetsPanelPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);

  await teamPage.createTeam(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.hideLibrariesAndTemplatesCarrousel();
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest(
    qase([1457], 'Publish Shared Library from the Libraries popup (with assets)'),
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-shared-library.png',
        { mask: mainPage.maskViewport() },
      );
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.clickCloseModalButton();
      await assetsPanelPage.isSharedLibraryBadgeVisible();
    },
  );

  mainTest.afterEach(async () => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.clickRemoveAsSharedLibraryMainMenuSubItem();
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest(
  qase([1458], 'Publish Shared Library from the dashboard (RMB) (with assets)'),
  async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-shared-library.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  },
);

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-update-library-1-file.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();

    await dashboardPage.createFileViaTitlePanel();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
    await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
    await assetsPanelPage.clickCloseModalButton();
    await mainPage.clickMoveButton();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await designPanelPage.changeAxisXAndYForLayer('100', '100');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
    await designPanelPage.changeAxisXAndYForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('2 files');

    await dashboardPage.openFileWithName('New File 1');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await designPanelPage.changeHeightAndWidthForLayer('100', '150');
    await designPanelPage.clickFirstColorIcon();
    await colorPalettePage.setHex('#05143F');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('2 files');
  });

  mainTest(
    qase(
      [1365],
      'Apply updates from Libraries → Updates (after dismissing at the beginning)',
    ),
    async () => {
      await mainTest.slow();
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickDismissButton();
      await mainPage.reloadPage();
      await mainPage.waitForViewportVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-1.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickUpdatesTab();
      await assetsPanelPage.clickLibrariesUpdateButton();
      await assetsPanelPage.clickCloseModalButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-2.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-update-library-1-file.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();

    await dashboardPage.createFileViaTitlePanel();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
    await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
    await assetsPanelPage.clickCloseModalButton();
    await dashboardPage.reloadPage();
    await assetsPanelPage.clickAssetsTab();
    await mainPage.clickMoveButton();
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await designPanelPage.changeAxisXAndYForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.isFileVisibleByName('New File 2');
    await dashboardPage.checkNumberOfFiles('2 files');

    await dashboardPage.createFileViaTitlePanel();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
    await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
    await assetsPanelPage.clickCloseModalButton();
    await dashboardPage.reloadPage();
    await assetsPanelPage.clickAssetsTab();
    await mainPage.clickMoveButton();
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await designPanelPage.changeAxisXAndYForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('3 files');
  });

  mainTest(
    qase(
      [1092],
      'Delete library which is used by a few files ( 1 library in a few files)',
    ),
    async () => {
      await dashboardPage.deleteFileWithNameViaRightClick('New File 1');
      await expect(dashboardPage.deleteFileModalWindow).toHaveScreenshot(
        'library-delete-warning.png',
        { mask: [dashboardPage.deletedSharedElementList] },
      );
      await expect(dashboardPage.deletedSharedElementList).toHaveCount(2);
      await expect(dashboardPage.deletedSharedElementList.nth(0)).toContainText(
        /New File [2-3]/,
      );
      await expect(dashboardPage.deletedSharedElementList.nth(1)).toContainText(
        /New File [2-3]/,
      );

      await dashboardPage.clickDeleteFileButton();

      await dashboardPage.openFileWithName('New File 2');
      await mainPage.waitForViewportVisible();

      await expect(mainPage.viewport).toHaveScreenshot(
        'library-without-library-viewport.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');

      await dashboardPage.openFileWithName('New File 3');
      await mainPage.waitForViewportVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'library-without-library-viewport2.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest.describe(() => {
  const team2 = random().concat('autotest QA Test team 2');

  mainTest.afterEach(async () => {
    await teamPage.page.waitForTimeout(1000);
    await teamPage.deleteTeam(team2);
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.renameFileWithNameViaRightClick(
      'New File 1',
      'Whiteboarding & mapping kit',
    );
    await dashboardPage.createFileViaTitlePanel();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.isFileVisibleByName('New File 1');
    await dashboardPage.checkNumberOfFiles('2 files');
    await dashboardPage.addFileWithNameAsSharedLibraryViaRightClick('New File 1');
    await dashboardPage.renameFileWithNameViaRightClick(
      'New File 1',
      'Circum Icons pack',
    );
    await dashboardPage.createFileViaTitlePanel();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
  });

  mainTest(qase([1004], 'Search shared library (LIBRARIES pop-up)'), async () => {
    await assetsPanelPage.searchSharedLibraries('Whiteboarding & mapping kit');
    await expect(assetsPanelPage.librariesModal).toHaveScreenshot(
      'libraries-window-search.png',
    );
    await assetsPanelPage.clearSearchSharedLibraries();
    await assetsPanelPage.searchSharedLibraries('Circ');
    await expect(assetsPanelPage.librariesModal).toHaveScreenshot(
      'libraries-window-part-search.png',
    );
    await assetsPanelPage.clearSearchSharedLibraries();
    await assetsPanelPage.searchSharedLibraries('qwer');
    await expect(assetsPanelPage.librariesModal).toHaveScreenshot(
      'libraries-window-invalid-search.png',
    );
    await assetsPanelPage.clearSearchSharedLibraries();
  });

  mainTest.afterEach(async () => {
    await assetsPanelPage.clickCloseModalButton();
    await mainPage.backToDashboardFromFileEditor();
  });
});
