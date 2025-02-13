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

let dashboardPage,
  teamPage,
  mainPage,
  assetsPanelPage,
  designPanelPage,
  layersPanelPage,
  colorPalettePage;
mainTest.beforeEach(async ({ page }) => {
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

mainTest.afterEach(async ({}, testInfo) => {
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);
  });

  mainTest(
    qase(
      1457,
      'PENPOT-1457 Publish Shared Library from the Libraries popup (with assets)',
    ),
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-shared-library.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
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
    qase(1459, 'PENPOT-1459 Publish Shared Library without any assets'),
    async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
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

mainTest.describe(() => {
  mainTest(qase(1460, 'PENPOT-1460 Canceling publish Shared Library'), async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibrariesButton();
    await assetsPanelPage.isSharedLibraryButtonVisible();
    await assetsPanelPage.clickSharedLibraryButton();
    await assetsPanelPage.isSharedLibraryCancelButtonVisible();
    await assetsPanelPage.clickCancelSharedLibraryButton();
    await assetsPanelPage.isSharedLibrarySearchInputVisible();
    await assetsPanelPage.clickCloseModalButton();
  });

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest(
  qase(
    1458,
    'PENPOT-1458 Publish Shared Library from the dashboard (RMB) (with assets)',
  ),
  async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-shared-library.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  },
);

mainTest(
  qase(
    1466,
    'PENPOT-1466 Unpublish Shared Library  which is not linked with any files (from dashboard)',
  ),
  async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-unpublished-shared-library.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.deleteFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  },
);

mainTest.describe(() => {
  mainTest(
    qase(
      1467,
      'PENPOT-1467 Unpublish Shared Library  which is not linked with any files (from Libraries popup)',
    ),
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-unpublished-shared-library.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
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

      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isRemoveAsSharedLibraryButtonVisible();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.clickCloseModalButton();
      await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    },
  );

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-shared-library-few-files.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  });

  mainTest(
    qase(
      1468,
      'PENPOT-1468 Unpublish Shared Library which is linked with a few files (but both files do not used any assets yet)',
    ),
    async () => {
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await assetsPanelPage.clickCloseModalButton();

      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.checkNumberOfFiles('2 files');
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await assetsPanelPage.clickCloseModalButton();
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.checkNumberOfFiles('3 files');

      await dashboardPage.openFileWithName('New File 1');
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.isRemoveAsSharedLibraryButtonVisible();
      await assetsPanelPage.clickRemoveAsSharedLibraryButton();
      await assetsPanelPage.clickCloseModalButton();
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
    qase(
      1469,
      'PENPOT-1469 Unpublish Shared Library which is linked with a few files (both files use assets )',
    ),
    async () => {
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await assetsPanelPage.clickCloseModalButton();
      await dashboardPage.reloadPage();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibraryTitleWithName('New File 1');
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
      await assetsPanelPage.clickCloseModalButton();
      await assetsPanelPage.clickAssetsTab();
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
      await assetsPanelPage.clickCloseModalButton();
      await assetsPanelPage.isSharedLibraryBadgeNotVisible();
      await mainPage.clickPencilBoxButton();

      await dashboardPage.openFileWithName('New File 2');
      await assetsPanelPage.clickAssetsTab();
      await expect(mainPage.viewport).toHaveScreenshot(
        'unpublich-shared-library-component-file2.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.clickPencilBoxButton();
      await dashboardPage.openFileWithName('New File 3');
      await assetsPanelPage.clickAssetsTab();
      await expect(mainPage.viewport).toHaveScreenshot(
        'unpublich-shared-library-component-file3.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
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
    await mainPage.createDefaultEllipseByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-shared-library-2-files.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  });

  mainTest(
    qase(
      1474,
      'PENPOT-1474 Unlink Shared Library file from Libraries popup when assets are not used in working file',
    ),
    async () => {
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await assetsPanelPage.clickCloseModalButton();
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.checkNumberOfFiles('2 files');
      await dashboardPage.createFileViaTitlePanel();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await assetsPanelPage.clickCloseModalButton();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'delete-shared-library-file2.png',
      );
      await assetsPanelPage.clickCloseModalButton();
    },
  );

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

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
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
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
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await designPanelPage.changeAxisXandYForLayer('100', '100');
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
    'PENPOT-1359 Dismiss updates from shared library file (click "Dismiss" button)',
    async () => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickDismissButton();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-1.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    'PENPOT-1360 Check updates info (click "More info" link in pop-up message)',
    async () => {
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
      await assetsPanelPage.clickCloseModalButton();
    },
  );

  mainTest(
    'PENPOT-1365 Apply updates from Libraries → Updates (after dismissing at the beginning)',
    async () => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickDismissButton();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-1.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
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
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    'PENPOT-1362 Closing Updates pop-up on "More info" stage (changes are not applied)',
    async () => {
      await dashboardPage.openFileWithName('New File 2');
      await mainPage.isWrapperMessageVisible();
      await expect(assetsPanelPage.wrapperMessage).toHaveScreenshot(
        'wrapper-message.png',
      );
      await assetsPanelPage.clickLibrariesMoreInfoButton();
      await assetsPanelPage.isLibrariesUpdateButtonVisible();
      await assetsPanelPage.clickCloseModalButton();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-publish-update-file2-3.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 30000);
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-publish-update-library-1-file.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
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
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await designPanelPage.changeAxisXandYForLayer('300', '400');
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
    await assetsPanelPage.clickLibraryTitleWithName('New File 1');
    await assetsPanelPage.clickLibraryComponentsTitle();
    await assetsPanelPage.dragAndDropComponentToViewport('Ellipse');
    await designPanelPage.changeAxisXandYForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.checkNumberOfFiles('3 files');
  });

  mainTest(
    qase(
      1092,
      'PENPOT-1092 Delete library which is used by a few files ( 1 library in a few files)',
    ),
    async () => {
      await dashboardPage.deleteFileWithNameViaRightClick('New File 1');
      await expect(dashboardPage.deleteFileModalWindow).toHaveScreenshot(
        'library-delete-warning.png',
      );
      await dashboardPage.clickDeleteFileButton();

      await dashboardPage.openFileWithName('New File 2');
      await mainPage.waitForViewportVisible();
      // The Main Components page might be unexpectedly created before the test
      // await mainPage.isSecondPageAddedToAssetsPanel(false);
      // await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      //   'library-without-library-layers.png',
      // );
      await expect(mainPage.viewport).toHaveScreenshot(
        'library-without-library-viewport.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );

      await mainPage.clickPencilBoxButton();
      await dashboardPage.isHeaderDisplayed('Projects');

      await dashboardPage.openFileWithName('New File 3');
      await mainPage.waitForViewportVisible();
      // await mainPage.isSecondPageAddedToAssetsPanel(false);
      // await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      //   'library-without-library-layers.png',
      // );
      await expect(mainPage.viewport).toHaveScreenshot(
        'library-without-library-viewport2.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest(
  qase(
    1471,
    'PENPOT-1471 Remove Shared Library file which is not linked with any files (from dashboard)',
  ),
  async () => {
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

mainTest.describe(() => {
  const team1 = teamName;
  const team2 = random().concat('QA Test team 2');

  mainTest(qase(1540, 'PENPOT-1540 Move library to a different team'), async () => {
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
    await teamPage.isTeamSelected(team2);
    await teamPage.switchTeam(team1);

    await dashboardPage.moveFileToOtherTeamViaRightClick('New File 1', team2);
    await expect(dashboardPage.deleteFileModalWindow).toHaveScreenshot(
      'library-move-to-other-team-warning.png',
    );
    await dashboardPage.clickOnMoveButton();
    await teamPage.isTeamSelected(team2);
    await dashboardPage.isSharedLibraryIconDisplayed();
  });

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

  mainTest(
    qase(1004, 'PENPOT-1004 Search shared library (LIBRARIES pop-up)'),
    async () => {
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

  mainTest.afterEach(async () => {
    await assetsPanelPage.clickCloseModalButton();
    await mainPage.backToDashboardFromFileEditor();
  });
});
