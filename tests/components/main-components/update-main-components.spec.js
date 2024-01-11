const { mainTest } = require('../../../fixtures');
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { MainPage } = require('../../../pages/workspace/main-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');

const teamName = random().concat('autotest');

let dashboardPage, teamPage, mainPage, layersPanelPage, designPanelPage, colorPalettePage, assetsPanelPage
test.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest('PENPOT-1444 Update main component', async ({ page }) => {
  test.setTimeout(60000);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickComponentFillColorIcon();
  await colorPalettePage.setHex('#304d6a');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.updateMainComponentViaRightClick();
  await expect(mainPage.viewport).toHaveScreenshot('component-update-canvas.png');
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'component-update-asset.png',
  );
});

mainTest('Check copy and main component icons', async ({ page }) => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'copy-main-components-layers.png',
  );
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '500');
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('50', '400');
  });

  mainTest(
    'Create a component and 2 copies of it, change rotation of main',
    async ({ page }) => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeRotationForLayer('20');
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-rotation.png',
      );
    },
  );

  mainTest(
    'Create a component and 2 copies of it, change all corners of main',
    async ({ page }) => {
      const cornerValue = '45';
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickIndividualCornersRadiusButton();
      await designPanelPage.changeTopLeftCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeTopRightCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeBottomLeftCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeBottomRightCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-corners.png',
      );
    },
  );

  mainTest(
    "Create a component and 2 copies of it, change corners of main separate by using 'All corners'",
    async ({ page }) => {
      const cornerValue = '45';
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeGeneralCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-corners.png',
      );
    },
  );

  mainTest(
    'PENPOT-1408 Create a component and 2 copies of it, change stroke color of main',
    async ({ page }) => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddStrokeButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setStrokeColor('#d80909');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportByCoordinates(400, 400);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-stroke.png',
      );
    },
  );

  mainTest(
    'PENPOT-1445 Create a component and 2 copies of it, change shadow opacity and color of main',
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-shadow-default.png',
        {
          mask: [mainPage.guides],
          maxDiffPixels: 0,
        },
      );
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickShadowActionsButton();
      await designPanelPage.changeOpacityForShadow("70");
      await designPanelPage.clickShadowColorIcon();
      await colorPalettePage.setHex('#09e5ec');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-shadow-updated.png', {
        mask: [mainPage.guides],
        maxDiffPixels: 0,
      });
    },
  );

  mainTest(
    'PENPOT-1446 Create a component and 2 copies of it, change blur of main',
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('2');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-blur.png', {
        mask: [mainPage.guides],
        maxDiffPixels: 0,
      });
    },
  );

  mainTest(
    'PENPOT-1447 Create a component and 2 copies of it, change grid style and size of main',
    async ({page}) => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddGridButton();
      await designPanelPage.selectGridType('Rows');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-grid-default.png', {
        mask: [mainPage.guides],
        maxDiffPixels: 0,
      });
      await designPanelPage.changeSizeForGrid('4');
      await designPanelPage.gridTypeField.click();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-grid-updated.png', {
          mask: [mainPage.guides],
          maxDiffPixels: 0,
        }
      );
    },
  );
});

test.describe("Text", () => {
  test.beforeEach(async ({page}, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultTextLayer(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '500');
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('50', '400');
  });

  mainTest(
    'PENPOT-1448 Create a component from text and 2 copies of it, change font, style and size of main',
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.changeTextFont('Source Serif 4');
      await designPanelPage.changeTextFontStyle('300 (italic)');
      await designPanelPage.changeTextFontSize('18');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.page.waitForTimeout(4000);
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-text.png', {
        mask: [mainPage.guides],
        maxDiffPixels: 0,
      });
    },
  );
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '500');
  });

  mainTest(
    'PENPOT-1404 Change copy components shadow and update main components color',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0538D1');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('0538D1');
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-shadow.png',
      );
    },
  );

  mainTest(
    'PENPOT-1403 Change copy components color and update main components color',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#050E23');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#C10C43');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('050E23');
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-fill.png',
      );
    },
  );

  mainTest(
    'PENPOT-1405 Change copy components blur and update main components color',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('2');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0538D1');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-blur.png',
      );
    },
  );

  mainTest(
    'PENPOT-1406 Change copy components grid and update main components color',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddGridButton();
      await designPanelPage.selectGridType('Rows');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0538D1');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-change-grid.png', {
        mask: [mainPage.guides],
        maxDiffPixels: 0,
      });
    },
  );

  mainTest(
    'PENPOT-1409 Change copy name and change component name',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();

      await layersPanelPage.doubleClickCopyComponentOnLayersTab();
      await layersPanelPage.renameCreatedLayer('test');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isCopyComponentNameDisplayed('test');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.doubleClickMainComponentOnLayersTab();
      await layersPanelPage.renameCreatedLayer('dfsfs');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isCopyComponentNameDisplayed('test');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-name.png',
      );
    },
  );
});
