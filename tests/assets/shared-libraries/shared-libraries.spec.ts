import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { expect } from '@playwright/test';
import { demoAccountApiFixture } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

let mainPage: MainPage;
let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let teamName: string;
let assetsPanelPage: AssetsPanelPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let pagesPanelPage: PagesPanelPage;

demoAccountApiFixture.beforeEach(async ({ page }) => {
  mainPage = new MainPage(page);
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  pagesPanelPage = new PagesPanelPage(page);
  teamName = createTeamName();

  await demoAccountApiFixture.step(
    `Create team "${teamName}" and open its first file`,
    async () => {
      await teamPage.createTeam(teamName);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
    },
  );
});

demoAccountApiFixture.describe(() => {
  demoAccountApiFixture(
    qase([1540], 'Move library to a different team'),
    async () => {
      const team1 = teamName;
      const team2 = createTeamName();

      demoAccountApiFixture.slow();
      await mainPage.createDefaultEllipseByCoordinates(200, 200);
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
      await assetsPanelPage.clickCloseModalButton();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibraryTitleWithName('New File 1');
      await assetsPanelPage.clickLibraryComponentsTitle();
      await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickPencilBoxButton();

      await teamPage.createTeam(team2);
      await teamPage.switchTeam(team1);

      await dashboardPage.moveFileToOtherTeamViaRightClick('New File 1', team2);
      await dashboardPage.isDeletingLibraryWarningVisible(1, 'New File 2');
      await dashboardPage.clickOnMoveButton();
      await teamPage.isTeamSelected(team2);
      await dashboardPage.isSharedLibraryIconDisplayed();
    },
  );
});

demoAccountApiFixture.describe(() => {
  demoAccountApiFixture(
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

  demoAccountApiFixture.afterEach(async () => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.clickRemoveAsSharedLibraryMainMenuSubItem();
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    await mainPage.backToDashboardFromFileEditor();
  });
});

demoAccountApiFixture(
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

demoAccountApiFixture.describe(() => {
  demoAccountApiFixture.beforeEach(async () => {
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
    await mainPage.reloadPage();
    await mainPage.waitForViewportVisible();
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

  demoAccountApiFixture(
    qase(
      [1365],
      'Apply updates from Libraries → Updates (after dismissing at the beginning)',
    ),
    async () => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.reloadPage();
      await mainPage.waitForViewportVisible();
      await assetsPanelPage.isWrapperMessageVisible();
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
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-2.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );
});

demoAccountApiFixture.describe(() => {
  demoAccountApiFixture.beforeEach(async () => {
    demoAccountApiFixture.slow();
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

  demoAccountApiFixture(
    qase(
      [1092],
      'Delete library which is used by a few files ( 1 library in a few files)',
    ),
    async () => {
      const libraryName = 'New File 1';
      const backupPageName = 'Main components';

      await demoAccountApiFixture.step(
        `Delete library "${libraryName}"`,
        async () => {
          await dashboardPage.deleteFileWithNameViaRightClick(libraryName);
          await dashboardPage.isDeletingLibraryWarningVisible(2, /New File [2-3]/);
          await dashboardPage.clickDeleteFileButton();
        },
      );

      for (const fileName of ['New File 2', 'New File 3']) {
        await demoAccountApiFixture.step(
          `Open "${fileName}" and check the "${backupPageName}" page`,
          async () => {
            await dashboardPage.openFileWithName(fileName);
            await pagesPanelPage.reloadUntilPageNameDisplayed(backupPageName);
            await pagesPanelPage.clickPageByName(backupPageName);
            await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
              'Ellipse',
            );
            await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
              'Rectangle',
            );
          },
        );

        await demoAccountApiFixture.step(
          `Check the Assets tab of "${fileName}"`,
          async () => {
            await assetsPanelPage.clickAssetsTab();
            await assetsPanelPage.checkLibraryTitleVisible('Local library');
            await assetsPanelPage.checkLibraryTitleVisible(libraryName, false);
            await assetsPanelPage.expandComponentsBlockOnAssetsTab();
            await assetsPanelPage.isComponentVisibleInAssetsTab('Ellipse');
            await assetsPanelPage.isSecondComponentVisibleInAssetsTab('Rectangle');
          },
        );

        await demoAccountApiFixture.step('Go back to the dashboard', async () => {
          await mainPage.clickPencilBoxButton();
          await dashboardPage.isHeaderDisplayed('Projects');
        });
      }
    },
  );
});

demoAccountApiFixture.describe(() => {
  demoAccountApiFixture.beforeEach(async () => {
    await mainPage.clickPencilBoxButton();
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.renameFile('New File 1', 'Whiteboarding & mapping kit');
    await dashboardPage.createFileViaTitlePanel();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.isFileVisibleByName('New File 1');
    await dashboardPage.checkNumberOfFiles('2 files');
    await dashboardPage.addFileWithNameAsSharedLibraryViaRightClick('New File 1');
    await dashboardPage.renameFile('New File 1', 'Circum Icons pack');
    await dashboardPage.createFileViaTitlePanel();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
  });

  demoAccountApiFixture(
    qase([1004], 'Search shared library (LIBRARIES pop-up)'),
    async () => {
      const libraryName1 = 'Whiteboarding & mapping kit';
      const libraryName2 = 'Circum Icons pack';

      await assetsPanelPage.searchSharedLibraries(libraryName1);
      await assetsPanelPage.firstLibraryItemContainsLibraryName(libraryName1);
      await assetsPanelPage.clearSearchSharedLibraries();
      await assetsPanelPage.searchSharedLibraries('Circ');
      await assetsPanelPage.firstLibraryItemContainsLibraryName(libraryName2);
      await assetsPanelPage.clearSearchSharedLibraries();
      await assetsPanelPage.searchSharedLibraries('qwer');
      await assetsPanelPage.isEmptyLibrarySearchResults();
      await assetsPanelPage.clearSearchSharedLibraries();
    },
  );

  demoAccountApiFixture.afterEach(async () => {
    await assetsPanelPage.clickCloseModalButton();
    await mainPage.backToDashboardFromFileEditor();
  });
});
