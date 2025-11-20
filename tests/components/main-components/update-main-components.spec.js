const { mainTest } = require('../../../fixtures');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { MainPage } = require('../../../pages/workspace/main-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { SampleData } = require('helpers/sample-data');

const teamName = random().concat('autotest');

let dashboardPage,
  teamPage,
  mainPage,
  layersPanelPage,
  designPanelPage,
  colorPalettePage,
  assetsPanelPage;
mainTest.beforeEach(async ({ page }) => {
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

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1275], 'Update main component'), async () => {
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
  await expect(mainPage.viewport).toHaveScreenshot('component-update-canvas.png', {
    mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
  });
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'component-update-asset.png',
    {
      mask: [assetsPanelPage.librariesOpenModalButton],
    },
  );
});

mainTest(qase([1306], 'Check copy and main component icons'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
  await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Rectangle');
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
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
    qase([1438], 'Create a component and 2 copies of it, change rotation of main'),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeRotationForLayer('20');
      await designPanelPage.waitForChangeIsUnsaved();
      await designPanelPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-rotation.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(
      [1440],
      'Create a component and 2 copies of it, change all corners of main',
    ),
    async () => {
      const cornerValue = '45';
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickIndividualCornersRadiusButton();
      await designPanelPage.changeTopLeftCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeTopRightCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeBottomLeftCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeBottomRightCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-corners.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(
      [1441],
      'Create a component and 2 copies of it, change corners of main separate by using "All corners"',
    ),
    async () => {
      const cornerValue = '45';
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeGeneralCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-corners.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(
      [1408],
      'Create a component and 2 copies of it, change stroke color of main',
    ),
    async () => {
      const sampleData = new SampleData();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddStrokeButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setStrokeColor(sampleData.color.redHexCode);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportByCoordinates(400, 400);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-stroke.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );

  mainTest(
    qase([1444], 'Create a component and 2 copies of it, change fill of main'),
    async () => {
      const sampleData = new SampleData();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.changeHeightAndWidthForLayer('50', '50');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex(sampleData.color.blueHexCode);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-component-change-fill-color.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(
      [1445],
      'Create a component and 2 copies of it, change shadow opacity and color of main',
    ),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.clickViewportByCoordinates(1000, 200, 2);
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-shadow-default.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickShadowActionsButton();
      await designPanelPage.changeOpacityForShadow('70');
      await designPanelPage.clickShadowColorIcon();
      await colorPalettePage.setHex('#09e5ec');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.clickViewportByCoordinates(1000, 200, 2);
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-shadow-updated.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );

  mainTest(
    qase([1446], 'Create a component and 2 copies of it, change blur of main'),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.clickViewportByCoordinates(1000, 200, 2);
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-blur.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );

  mainTest(
    qase(
      [1447],
      'Create a component and 2 copies of it, change grid style and size of main',
    ),
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddGridButton();
      await designPanelPage.selectGridType('Rows');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-grid-default.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
      await designPanelPage.changeSizeForGrid('4');
      await designPanelPage.gridTypeField.click();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-grid-updated.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );
});

mainTest.describe('Text', () => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.backToDashboardFromFileEditor();
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.importFile('documents/text-components-propagation.penpot');
    await dashboardPage.openFileWithName('Propagation of text components I');
  });

  mainTest(
    qase(
      [2261],
      'Propagation of (style and content) changes from a text component to copies (overriding style or content)',
    ),
    async () => {
      const sampleData = new SampleData();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.changeTextFont('Source Serif 4');
      await designPanelPage.changeTextFontStyle('300 Italic');
      await designPanelPage.changeTextFontSize('9');
      await designPanelPage.changeTextLetterSpacing('4');
      await designPanelPage.clickOnTextAlignOptionsButton();
      await designPanelPage.clickOnTextStrikethroughButton();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex(sampleData.color.redHexCode);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await mainPage.editTextLayer('Testing Penpot !!');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-text.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );

  mainTest(
    qase(
      [2263],
      'Propagation of (independent) changes from a text component to (all) copies',
    ),
    async () => {
      const sampleData = new SampleData();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();

      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.changeStrokeSettings(
        sampleData.color.redHexCode,
        '60',
        '10',
        'Inside',
      );
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await designPanelPage.changeRotationForLayer('40');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await designPanelPage.changeWidthForLayer('40');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-text-independent-changes.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );
});

mainTest.describe(() => {
  const sampleData = new SampleData();

  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '500');
  });

  mainTest(
    qase([1404], 'Change copy components shadow and update main components color'),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddShadowButton();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.isFillHexCodeSetComponent(sampleData.color.blueHexCode);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-shadow.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );

  mainTest(
    qase([1403], 'Change copy components color and update main components color'),
    async ({ browserName }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setComponentColor(sampleData.color.blackHexCode);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setComponentColor(sampleData.color.redHexCode);
      await mainPage.clickViewportTwice();
      browserName === 'chromium' ? await mainPage.waitForChangeIsUnsaved() : null;
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.isFillHexCodeSetComponent(sampleData.color.blackHexCode);
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-fill.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase([1405], 'Change copy components blur and update main components color'),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('2');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForViewportVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-blur.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase([1406], 'Change copy components grid and update main components color'),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddGridButton();
      await designPanelPage.selectGridType('Rows');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-grid.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          maxDiffPixels: 0,
        },
      );
    },
  );

  mainTest(qase([1409], 'Change copy name and change component name'), async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();

    await layersPanelPage.doubleClickCopyComponentOnLayersTab();
    await layersPanelPage.typeNameCreatedLayerAndEnter('test');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isCopyComponentNameDisplayed('test');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.doubleClickMainComponentOnLayersTab();
    await layersPanelPage.typeNameCreatedLayerAndEnter('dfsfs');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isCopyComponentNameDisplayed('test');
    await layersPanelPage.clickMainComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-copies-component-change-name.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
  });
});

mainTest(qase([1478], 'Changed direct, not overriden'), async () => {
  const sampleData = new SampleData();
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1478-component-update-canvas.png',
    {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    },
  );
});

mainTest(qase([1479], 'Changed remote, not overriden'), async () => {
  const sampleData = new SampleData();
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
  await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1479-component-update-canvas.png',
    {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    },
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    '1479-component-update-asset.png',
    {
      mask: [assetsPanelPage.librariesOpenModalButton],
    },
  );
});

mainTest(qase([1480], 'Changed direct, overriden in copy'), async () => {
  const sampleData = new SampleData();
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor(sampleData.color.purpleHexCode);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1480-component-update-canvas.png',
    {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    },
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    '1480-component-update-asset.png',
    {
      mask: [assetsPanelPage.librariesOpenModalButton],
    },
  );
});

mainTest(qase([1482], 'Changed remote, overriden in copy'), async () => {
  const sampleData = new SampleData();
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
  await designPanelPage.setComponentColor(sampleData.color.greenHexCode);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickMainComponentOnLayersTab();
  await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    '1482-component-update-canvas.png',
    {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    },
  );
});

mainTest(
  qase([1483], 'Changed remote, overriden in near, overriden in copy'),
  async () => {
    const sampleData = new SampleData();
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
    await designPanelPage.setComponentColor(sampleData.color.greenHexCode1);
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickNMainComponentOnLayersTab(-2);
    await designPanelPage.setComponentColor(sampleData.color.greenHexCode2);
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickMainComponentOnLayersTab();
    await designPanelPage.setComponentColor(sampleData.color.greenHexCode3);
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      '1483-component-update-canvas.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
  },
);
