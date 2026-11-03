import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;
let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
});

demoAccountFileTest(qase([1275], 'Update main component'), async ({ mainPage }) => {
  await demoAccountFileTest.step(
    'Create rectangle component and duplicate it',
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await demoAccountFileTest.step(
    'Move copy component and change its fill color',
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXAndYForLayer('400', '500');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickComponentFillColorIcon();
      await colorPalettePage.modalSetHex('#304d6a');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await demoAccountFileTest.step(
    'Update main component from copy and verify updated component on canvas and assets tab',
    async () => {
      await layersPanelPage.updateMainComponentViaRightClick();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-update-canvas.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
        'component-update-asset.png',
        {
          mask: [assetsPanelPage.librariesOpenModalButton],
        },
      );
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClickFromLayerByName('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickOnClipContentButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '500');
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.checkCopyComponentLayerCount(2);
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('50', '400');

    // These tests verify propagation of changes from the main component to its
    // component copies and they all start by selecting the main component.
    // But selecting it by a direct click from the layers panel isn't enough to
    // retarget Penpot's edit state after the last edit operation on the copy.
    // Clicking on "Clip content" twice is a harmless no-op edit (no children,
    // no visual effect) to force that edit state onto the main component.
    await layersPanelPage.clickMainComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickOnClipContentButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickOnClipContentButton();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([1438], 'Create a component and 2 copies of it, change rotation of main'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Change rotation of main component and verify rotation change propagated to copies',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.changeRotationForLayer('20');
          await designPanelPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-change-rotation.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [1445],
      'Create a component and 2 copies of it, change shadow opacity and color of main',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Add default shadow to main component and verify default shadow on canvas',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickAddShadowButton();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.clickViewportByCoordinates(1000, 200, 2);
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-shadow-default.png',
            {
              mask: mainPage.maskViewport(),
              maxDiffPixels: 0,
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Change shadow opacity and color of main component and verify updated shadow propagated to copies',
        async () => {
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
              mask: mainPage.maskViewport(),
              maxDiffPixels: 0,
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1446], 'Create a component and 2 copies of it, change blur of main'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Add blur to main component and verify blur change propagated to copies',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickAddBlurButton();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickViewportByCoordinates(1000, 200, 2);
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-blur.png',
            {
              mask: mainPage.maskViewport(),
              maxDiffPixels: 0,
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [3256],
      'Create a component and 2 copies of it, change grid style and size of main',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Add guides with rows type to main component and verify default grid propagated to copies',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.clickAddGuidesButton();
          await designPanelPage.selectGuidesType('Rows');
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-grid-default.png',
            {
              mask: mainPage.maskViewport(),
              maxDiffPixels: 0,
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Change guides size and verify updated grid size propagated to copies',
        async () => {
          await designPanelPage.changeSizeForGuides('4');
          await designPanelPage.guidesTypeField.click();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-grid-updated.png',
            {
              mask: mainPage.maskViewport(),
              maxDiffPixels: 0,
            },
          );
        },
      );
    },
  );
});

demoAccountFileTest.describe('Text', () => {
  demoAccountFileTest.beforeEach(async ({ dashboardPage, mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.backToDashboardFromFileEditor('Personal Projects');
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.importFile('documents/text-components-propagation.penpot');
    await dashboardPage.openFileWithName('Propagation of text components I');
  });

  demoAccountFileTest(
    qase(
      [2261],
      'Propagation of (style and content) changes from a text component to copies (overriding style or content)',
    ),
    async ({ mainPage }) => {
      const sampleData = new SampleData();

      await demoAccountFileTest.step(
        'Change text style properties of main component child layer',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.selectMainComponentChildLayer();
          await designPanelPage.changeTextFont('Source Serif 4');
          await designPanelPage.changeTextFontStyle('300 Italic');
          await designPanelPage.changeTextFontSize('9');
          await designPanelPage.changeTextLetterSpacing('4');
          await designPanelPage.changeTextOption('Strikethrough');
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex(sampleData.color.redHexCode);
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Edit text content of main component child layer and verify style and content propagation to copies',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.selectMainComponentChildLayer();
          await mainPage.editTextLayer('Testing Penpot !!');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-text.png',
            {
              mask: mainPage.maskViewport(),
              maxDiffPixels: 0,
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [2263],
      'Propagation of (independent) changes from a text component to (all) copies',
    ),
    async ({ mainPage }) => {
      const sampleData = new SampleData();

      await demoAccountFileTest.step(
        'Apply stroke, rotation and width changes to main component child layer and verify independent changes propagated to all copies',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.expandMainComponentOnLayersTab();
          await layersPanelPage.selectLayerByExactName('Click me');
          await designPanelPage.checkSectionIsVisible('Text');
          await designPanelPage.clickAddStrokeButton();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkStrokeIsAdded();
          await designPanelPage.changeStrokeSettings(
            sampleData.color.redHexCode,
            '60',
            '10',
            'Inside',
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeRotationForLayer('40');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await designPanelPage.changeWidthForLayer('40');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-text-independent-changes.png',
            {
              mask: mainPage.maskViewport(),
              maxDiffPixels: 0,
            },
          );
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([1478], 'Changed direct, not overriden'),
  async ({ mainPage }) => {
    const sampleData = new SampleData();

    await demoAccountFileTest.step(
      'Create rectangle component and duplicate it',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('400', '500');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      `Set main component fill color to "${sampleData.color.blueHexCode}" and verify direct color change on canvas`,
      async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          '1478-component-update-canvas.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);

demoAccountFileTest(
  qase([1479], 'Changed remote, not overriden'),
  async ({ mainPage }) => {
    const sampleData = new SampleData();

    await demoAccountFileTest.step(
      'Create component with copy and create a second nested component',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('400', '500');
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClick();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('200', '500');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      `Set main component fill color to "${sampleData.color.pinkHexCode}" and verify remote color change on canvas and assets panel`,
      async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          '1479-component-update-canvas.png',
          {
            mask: mainPage.maskViewport(),
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
      },
    );
  },
);

demoAccountFileTest(
  qase([1480], 'Changed direct, overriden in copy'),
  async ({ mainPage }) => {
    const sampleData = new SampleData();

    await demoAccountFileTest.step(
      'Create component with copy and override copy color',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('400', '500');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      `Set main component fill color to "${sampleData.color.purpleHexCode}" and verify copy color override is preserved while main color is updated`,
      async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.setComponentColor(sampleData.color.purpleHexCode);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          '1480-component-update-canvas.png',
          {
            mask: mainPage.maskViewport(),
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
      },
    );
  },
);

demoAccountFileTest(
  qase([1482], 'Changed remote, overriden in copy'),
  async ({ mainPage }) => {
    const sampleData = new SampleData();

    await demoAccountFileTest.step(
      'Create component with copy, create nested component and override copy color',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('400', '500');
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClick();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('200', '500');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.setComponentColor(sampleData.color.greenHexCode1);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      `Set main component fill color to "${sampleData.color.pinkHexCode}" and verify copy color override is preserved while remote change is applied`,
      async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          '1482-component-update-canvas.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);
