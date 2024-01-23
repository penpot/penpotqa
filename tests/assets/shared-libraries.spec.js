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
});

test.afterEach(async ({ page }) => {
  await teamPage.deleteTeam(teamName);
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 15000);
  });

  mainTest(
    'PENPOT-1457 Publish Shared Library from the Libraries popup (with assets)',
    async ({ page }) => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-shared-library.png',
      );
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      // pop-up window click
      // await assetsPanelPage.isSharedLibraryButtonVisible();
      // await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.clickCloseModalButton();
      await assetsPanelPage.isSharedLibraryBadgeVisible();
    },
  );

  mainTest(
    'PENPOT-1459 Publish Shared Library without any assets',
    async ({ page }) => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryBadgeVisible();
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.clickRemoveAsSharedLibraryMainMenuSubItem();
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    await mainPage.backToDashboardFromFileEditor();
  });
});

test.describe(() => {
  mainTest(
    'PENPOT-1460 Canceling publish Shared Library',
    async ({ page }) => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryCancelButtonVisible();
      await assetsPanelPage.clickCancelSharedLibraryButton();
      await assetsPanelPage.isSharedLibrarySearchInputVisible();
      await assetsPanelPage.clickCloseModalButton();
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest(
  'PENPOT-1458 Publish Shared Library from the dashboard (RMB) (with assets)',
  async ({ page }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-shared-library.png',
    );

    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  },
);

mainTest(
  'PENPOT-1466 Unpublish Shared Library  which is not linked with any files (from dashboard)',
  async ({ page }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-unpublished-shared-library.png',
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.deleteFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  },
);

test.describe(() => {
  mainTest(
    'PENPOT-1467 Unpublish Shared Library  which is not linked with any files (from Libraries popup)',
    async ({ page }) => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-unpublished-shared-library.png',
      );
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      // pop-up window click
      // await assetsPanelPage.isSharedLibraryButtonVisible();
      // await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryBadgeVisible();

      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isRemoveAsSharedLibraryButtonVisible();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-shared-library-few-files.png',
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  });

  mainTest(
    'PENPOT-1468 Unpublish Shared Library which is linked with a few files (but both files do not used any assets yet)',
    async ({ page }) => {
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.checkNumberOfFiles('2 files');
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.checkNumberOfFiles('3 files');

      await dashboardPage.openFileWithName('New File 1');
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isRemoveAsSharedLibraryButtonVisible();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryBadgeNotVisible();
      await mainPage.clickPencilBoxButton();

      await dashboardPage.openFileWithName('New File 2');
      await assetsPanelPage.clickAssetsTab();
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'unpublich-shared-library-file2.png',
      );
      await mainPage.clickPencilBoxButton();
      await dashboardPage.openFileWithName('New File 3');
      await assetsPanelPage.clickAssetsTab();
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'unpublich-shared-library-file3.png',
      );
    },
  );

  mainTest(
    'PENPOT-1469 Unpublish Shared Library which is linked with a few files (both files use assets )',
    async ({ page }) => {
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
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await dashboardPage.reloadPage();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibraryTitle();
      await assetsPanelPage.clickLibraryComponentsTitle();
      await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.isFileVisibleByName('New File 3');
      await dashboardPage.checkNumberOfFiles('3 files');

      await dashboardPage.openFileWithName('New File 1');
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isRemoveAsSharedLibraryButtonVisible();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryBadgeNotVisible();
      await mainPage.clickPencilBoxButton();

      await dashboardPage.openFileWithName('New File 2');
      await assetsPanelPage.clickAssetsTab();
      await expect(mainPage.viewport).toHaveScreenshot(
        'unpublich-shared-library-component-file2.png',
      );
      await mainPage.clickPencilBoxButton();
      await dashboardPage.openFileWithName('New File 3');
      await assetsPanelPage.clickAssetsTab();
      await expect(mainPage.viewport).toHaveScreenshot(
        'unpublich-shared-library-component-file3.png',
      );
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mainPage.createDefaultEllipseByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-shared-library-2-files.png',
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  });

  mainTest(
    'PENPOT-1474 Unlink Shared Library file from Libraries popup when assets are not used in working file',
    async ({ page }) => {
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.checkNumberOfFiles('2 files');
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await dashboardPage.reloadPage();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'delete-shared-library-file2.png',
      );

    },
  );

  mainTest(
    'PENPOT-1475 Unlink Shared Library file from Libraries popup when assets are used in working file',
    async ({ page }) => {
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await dashboardPage.reloadPage();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibraryTitle();
      await assetsPanelPage.clickLibraryComponentsTitle();
      await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
      await mainPage.waitForChangeIsSaved();
      await dashboardPage.reloadPage();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await dashboardPage.reloadPage();
      await assetsPanelPage.clickAssetsTab();
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'delete-shared-library-file2-with-ellipse.png',
      );
      await expect(mainPage.viewport).toHaveScreenshot(
        'delete-shared-library-component-file2.png',
      );
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-update-library-1-file.png',
    );
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
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
    await designPanelPage.changeAxisXandYForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('2 files');

    await dashboardPage.openFileWithName('New File 1');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await designPanelPage.changeHeightAndWidthForLayer('100', '150');
    await designPanelPage.clickAddFillButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#05143F');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('05143F');
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('2 files');
  });

  mainTest(
    'PENPOT-1359 Dismiss updates from shared library file (click "Dismiss" button)',
    async ({ page }) => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickDismissButton();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-1.png',
      );
    },
  );

  mainTest(
    'PENPOT-1360 Check updates info (click "More info" link in pop-up message)',
    async ({ page }) => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickLibrariesMoreInfoButton();
      await assetsPanelPage.isLibrariesUpdateButtonVisible();

      await expect(assetsPanelPage.librariesModal).toHaveScreenshot(
        'libraries-change-window.png',
      );
    },
  );

  mainTest(
    'PENPOT-1365 Apply updates from Libraries → Updates (after dismissing at the beginning)',
    async ({ page }) => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickDismissButton();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-1.png',
      );
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickUpdatesTab();
      await assetsPanelPage.clickLibrariesUpdateButton();
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.clickCloseModalButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-2.png',
      );
    },
  );

  mainTest(
    'PENPOT-1362 Closing Updates pop-up on "More info" stage (changes are not applied)',
    async ({ page }) => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickLibrariesMoreInfoButton();
      await assetsPanelPage.isLibrariesUpdateButtonVisible();
      await assetsPanelPage.clickCloseModalButton();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-1.png',
      );
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-update-library-1-file.png',
    );
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
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
    await designPanelPage.changeAxisXandYForLayer('300', '400');
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
    await dashboardPage.reloadPage();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibraryTitle();
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
    await designPanelPage.changeAxisXandYForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('3 files');
  });

  mainTest(
    'PENPOT-1092 Delete library which is used by a few files ( 1 library in a few files)',
    async ({ page }) => {
      await dashboardPage.deleteFileWithNameViaRightClick('New File 1');
      await expect(dashboardPage.deleteFileModalWindow).toHaveScreenshot(
        'library-delete-warning.png',
      );
      await dashboardPage.clickDeleteFileButton();

      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isSecondPageNameDisplayed('Library backup');
      await mainPage.clickOnPageOnLayersPanel(false);
      await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
        'library-backup-layers.png',
      );
      await expect(mainPage.viewport).toHaveScreenshot(
        'library-backup-viewport.png',
      );
      await assetsPanelPage.clickAssetsTab();
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'library-backup-assets.png',
      );
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');

      await dashboardPage.openFileWithName('New File 3');
      await mainPage.isSecondPageNameDisplayed('Library backup');
      await mainPage.clickOnPageOnLayersPanel(false);
      await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
        'library-backup-layers.png',
      );
      await expect(mainPage.viewport).toHaveScreenshot(
        'library-backup-viewport.png',
      );
      await assetsPanelPage.clickAssetsTab();
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'library-backup-assets.png',
      );
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest(
  'PENPOT-1471 Remove Shared Library file which is not linked with any files (from dashboard)',
  async ({ page }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();

    await dashboardPage.deleteFileViaRightclick();
    await dashboardPage.isSuccessMessageDisplayed(
      'Your file has been deleted successfully',
    );
    await dashboardPage.waitSuccessMessageHidden();
    await dashboardPage.checkNumberOfFiles('0 files');
  },
);

test.describe(() => {
  const team1 = teamName;
  const team2 = random().concat('QA Test team 2');

  mainTest('PENDOT-1540 Move library to a different team', async ({ page }) => {
    await mainPage.createDefaultEllipseByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();

    await teamPage.createTeam(team2);
    await teamPage.isTeamSelected(team2);
    await teamPage.switchTeam(team1);

    await dashboardPage.createFileViaTitlePanel();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
    await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
    await dashboardPage.reloadPage();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibraryTitle();
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickPencilBoxButton();
    await dashboardPage.moveFileToOtherTeamViaRightClick('New File 1', team2);
    // Warning message not displays
    // await expect(dashboardPage.deleteFileModalWindow).toHaveScreenshot(
    //   'library-move-to-other-team-warning.png',
    // );
  });

  test.afterEach(async ({ page }) => {
    await teamPage.deleteTeam(team2);
  });
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.renameFileWithNameViaRightClick(
      'New File 1',
      'Whiteboarding & mapping kit'
    );
    await dashboardPage.createFileViaTitlePanel();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.isFileVisibleByName('New File 1');
    await dashboardPage.checkNumberOfFiles('2 files');
    await dashboardPage.addFileWithNameAsSharedLibraryViaRightClick('New File 1');
    await dashboardPage.renameFileWithNameViaRightClick('New File 1', 'Circum Icons pack');
    await dashboardPage.createFileViaTitlePanel();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();

  });

  mainTest(
    'PENPOT-1004 Search shared library (LIBRARIES pop-up)',
    async ({ page }) => {
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
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await assetsPanelPage.clickCloseModalButton();
    await mainPage.backToDashboardFromFileEditor();
  });
});
