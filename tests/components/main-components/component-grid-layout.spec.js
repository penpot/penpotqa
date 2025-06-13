const { expect, test } = require('@playwright/test');
const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { random } = require('../../../helpers/string-generator');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('../../../helpers/saveTestResults.js');
const { InspectPanelPage } = require('../../../pages/workspace/inspect-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');
const annotation = 'Test annotation for automation';

let teamPage,
  dashboardPage,
  mainPage,
  designPanelPage,
  layersPanelPage,
  inspectPanelPage,
  assetsPanelPage,
  colorPalettePage;
test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  designPanelPage = new DesignPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
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

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  mainTest(
    qase(1717, 'PENPOT-1717 Create a component from empty Grid Board'),
    async ({}) => {
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'empty-board-component-with-grid-layout.png',
      );
    },
  );

  mainTest(
    qase(
      1724,
      'PENPOT-1724 Create a component from grid board with some element inside, edit component in grid layout section',
    ),
    async ({}) => {
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.clickBoardOnCanvas();
      await mainPage.doubleClickBoardOnCanvas();
      await mainPage.changeGridRowLabel('100 PX');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-with-px-row.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment],
        },
      );
    },
  );

  mainTest(
    qase(1729, 'PENPOT-1729 Move a component between pages'),
    async ({ browserName }) => {
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.pressCopyShortcut(browserName);
      await mainPage.clickAddPageButton();
      await mainPage.clickOnPageOnLayersPanel(false);
      await mainPage.clickMoveButton();
      await mainPage.pressPasteShortcut(browserName);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isPageNameSelected('Page 1', false);
      await mainPage.isPageNameSelected('Page 2', true);
      await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Board');
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'board-component-on-page2.png',
      );
    },
  );

  mainTest(
    qase(1730, 'PENPOT-1730 Restore main component'),
    async ({ browserName }) => {
      await mainPage.createComponentViaRightClick();
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.pressCopyShortcut(browserName);
      await mainPage.pressPasteShortcut(browserName);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.deleteMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.restoreMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-with-grid-layout-main-restore.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Board');
    },
  );

  mainTest(
    qase(1731, 'PENPOT-1731 Undo component editing and deleting'),
    async ({ browserName }) => {
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0000FF');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-blue-color.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.clickViewportOnce();
      await mainPage.clickShortcutCtrlZ(browserName);
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'board-component-undo-color.png',
      );
      await layersPanelPage.deleteMainComponentViaRightClick();
      await mainPage.isCreatedLayerVisible(false);
      await mainPage.clickShortcutCtrlZ(browserName);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'board-component-restored.png',
      );
    },
  );

  mainTest(
    qase(
      [1732, 1733, 1734],
      'PENPOT-1732,1733,1734 Click "Show main component" in File2',
    ),
    async ({ page }) => {
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
      await dashboardPage.reloadPage();
      await assetsPanelPage.clickAssetsTab();
      await mainPage.clickMoveButton();
      await assetsPanelPage.clickLibraryTitleWithName('New File 1');
      await assetsPanelPage.clickLibraryComponentsTitle();
      await assetsPanelPage.dragAndDropComponentToViewport('Board');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'board-from-library-file.png',
      );

      const popupPromise = page.waitForEvent('popup');
      await mainPage.showMainComponentViaRightClick();
      const newPage = await popupPromise;
      const newMainPage = new MainPage(newPage);
      await newMainPage.waitForViewportVisible();
      await newMainPage.isCopyLayerVisible();
      await newPage.waitForTimeout(2000);
      await expect(newMainPage.viewport).toHaveScreenshot(
        'board-component-on-first-file.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.createDefaultRectangleByCoordinates(180, 200, true);
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaLayersTab('Rectangle');
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(1718, 'PENPOT-1718 Copy-paste component, that was created from grid board'),
    async ({ browserName }) => {
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.copyLayerViaRightClick();
      await mainPage.pressPasteShortcut(browserName);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'board-component-with-grid-layout-copy-paste.png',
      );
      await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
        'copy-paste-layer.png',
      );
    },
  );

  mainTest(
    qase(
      1719,
      'PENPOT-1719 Create a component from grid board with some element inside',
    ),
    async ({}) => {
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'board-component-with-grid-layout-with-rectangle.png',
      );
    },
  );

  mainTest(
    qase(1728, 'PENPOT-1728 Duplicate component, that was created from grid board'),
    async ({ browserName }) => {
      await mainPage.clickShortcutCtrlD(browserName);
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-with-grid-layout-duplicated.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Board');
      await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Board');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(100, 100);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickShortcutCtrlD(browserName);
    await designPanelPage.changeAxisXandYForLayer('500', '100');
  });

  mainTest(
    qase(
      1720,
      'PENPOT-1720 Change the copy component and click "Update main component"',
    ),
    async ({}) => {
      await designPanelPage.changeHeightAndWidthForLayer('25', '25');
      await layersPanelPage.updateMainComponentViaRightClick();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-with-grid-layout-main-updated.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(
      1721,
      'PENPOT-1721 Change the copy component and click "Show main component"',
    ),
    async ({}) => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#000000');
      await mainPage.waitForChangeIsSaved();
      await mainPage.showMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-with-grid-layout-main-show.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(1722, 'PENPOT-1722 Change the copy component and click "Reset overrides"'),
    async ({}) => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#000000');
      await mainPage.waitForChangeIsSaved();
      await mainPage.resetOverridesViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-with-grid-layout-reset-overrides.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(1723, 'PENPOT-1723 Change the copy component and click "Detach instance"'),
    async ({}) => {
      await designPanelPage.changeHeightAndWidthForLayer('25', '25');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.detachInstanceCopyComponentViaRightClick();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-component-with-grid-layout-detach-instance.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
        'detach-instance-layer.png',
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsUnsaved();
    await designPanelPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(
      [1725, 1752],
      'PENPOT-1725,1752 Create annotation for component, that already has annotation',
    ),
    async () => {
      await designPanelPage.isAnnotationAddedToComponent(annotation);
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isAnnotationOptionNotVisibleRightClick();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.isAnnotationOptionNotVisible();
    },
  );

  mainTest(qase(1726, 'PENPOT-1726 Edit annotation for component'), async ({}) => {
    await designPanelPage.clickOnEditAnnotation();
    await designPanelPage.editAnnotationForComponent('Edit annotation');
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent('Edit annotation');
  });

  mainTest(qase(1727, 'PENPOT-1727 Delete annotation for component'), async ({}) => {
    await designPanelPage.clickOnDeleteAnnotation();
    await designPanelPage.confirmDeleteAnnotation();
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationNotAddedToComponent();
  });
});
