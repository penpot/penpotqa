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
const { updateTestResults } = require('./../../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

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

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest(qase(1275,'Update main component'), async () => {
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
  await colorPalettePage.modalSetHex('#304d6a');
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

mainTest(qase(1306,'Check copy and main component icons'), async () => {
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
    await testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickOnClipContentButton();
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
    qase(1438,'Create a component and 2 copies of it, change rotation of main'),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeRotationForLayer('20');
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-rotation.png',
      );
    },
  );

  mainTest(
    qase(1440,'Create a component and 2 copies of it, change all corners of main'),
    async () => {
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
    qase(1441,'Create a component and 2 copies of it, change corners of main separate by using "All corners"'),
    async () => {
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
    qase(1408,'PENPOT-1408 Create a component and 2 copies of it, change stroke color of main'),
    async () => {
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
    qase(1444,'PENPOT-1444 Create a component and 2 copies of it, change fill of main'),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.changeHeightAndWidthForLayer('50', '50');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0538D1');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-component-change-fill-color.png',
      );
    },
  );

  mainTest(
    qase(1445,'PENPOT-1445 Create a component and 2 copies of it, change shadow opacity and color of main'),
    async ({ page }) => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddShadowButton();
      await page.waitForTimeout(200);
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-shadow-default.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment],
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
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await page.waitForTimeout(200);
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-shadow-updated.png', {
        mask: [mainPage.guides, mainPage.guidesFragment],
        maxDiffPixels: 0,
      });
    },
  );

  mainTest(
    qase(1446,'PENPOT-1446 Create a component and 2 copies of it, change blur of main'),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-blur.png', {
        mask: [mainPage.guides, mainPage.guidesFragment],
        maxDiffPixels: 0,
      });
    },
  );

  mainTest(
    qase(1447,'PENPOT-1447 Create a component and 2 copies of it, change grid style and size of main'),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddGridButton();
      await designPanelPage.selectGridType('Rows');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-grid-default.png', {
        mask: [mainPage.guides, mainPage.guidesFragment],
        maxDiffPixels: 0,
      });
      await designPanelPage.changeSizeForGrid('4');
      await designPanelPage.gridTypeField.click();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-grid-updated.png', {
          mask: [mainPage.guides, mainPage.guidesFragment],
          maxDiffPixels: 0,
        }
      );
    },
  );
});

test.describe("Text", () => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultTextLayer(browserName);
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
    qase(1448,'PENPOT-1448 Create a component from text and 2 copies of it, change font, style and size of main'),
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
        mask: [mainPage.guides, mainPage.guidesFragment],
        maxDiffPixels: 0,
      });
    },
  );
});

test.describe(() => {
  test.beforeEach(async ({}, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '500');
  });

  mainTest(
    qase(1404,'PENPOT-1404 Change copy components shadow and update main components color'),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor('#0538D1');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSetComponent('0538d1');
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-shadow.png',
      );
    },
  );

  mainTest(
    qase(1403,'PENPOT-1403 Change copy components color and update main components color'),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setComponentColor('#050E23');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setComponentColor('#C10C43');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSetComponent('050e23');
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-fill.png',
      );
    },
  );

  mainTest(
    qase(1405,'PENPOT-1405 Change copy components blur and update main components color'),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('2');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor('#0538D1');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await mainPage.refreshPage();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-blur.png',
      );
    },
  );

  mainTest(
    qase(1406,'PENPOT-1406 Change copy components grid and update main components color'),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddGridButton();
      await designPanelPage.selectGridType('Rows');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor('#0538D1');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('main-copies-component-change-grid.png', {
        mask: [mainPage.guides, mainPage.guidesFragment],
        maxDiffPixels: 0,
      });
    },
  );

  mainTest(
    qase(1409,'PENPOT-1409 Change copy name and change component name'),
    async () => {
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

mainTest(qase(1478,'PENPOT-1478 Changed direct, not overriden'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor('#093EDC');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1478-component-update-canvas.png'
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    '1478-component-update-asset.png',
  );
});

mainTest(qase(1479,'PENPOT-1479 Changed remote, not overriden'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('200', '500');
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor('#C41ABC');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1479-component-update-canvas.png'
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    '1479-component-update-asset.png',
  );
});

mainTest(qase(1480,'PENPOT-1480 Changed direct, overriden in copy'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.setComponentColor('#DC08D3');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor('#660E62');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1480-component-update-canvas.png'
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    '1480-component-update-asset.png',
  );
});

mainTest(qase(1482,'PENPOT-1482 Changed remote, overriden in copy'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('200', '500');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.setComponentColor('#0F602A');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor('#C41ABC');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1482-component-update-canvas.png'
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    '1482-component-update-asset.png',
  );
});

mainTest(qase(1483,'PENPOT-1483 Changed remote, overriden in near, overriden in copy'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('200', '500');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.setComponentColor('#0F602A');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickNMainComponentOnLayersTab(-2);
  await designPanelPage.setComponentColor('#83B092');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor('#326F46');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1483-component-update-canvas.png'
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    '1483-component-update-asset.png',
  );
});
