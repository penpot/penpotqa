import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([275], 'Create Rectangle (Shortcut R)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Press R shortcut and verify rectangle tool is active',
      async () => {
        await mainPage.pressKeyboardShortcut('R');
      },
    );

    await demoAccountFileTest.step(
      'Click on canvas and verify rectangle with default size is created',
      async () => {
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await designPanelPage.checkSizeWidth('100');
        await designPanelPage.checkSizeHeight('100');
      },
    );
  },
);

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([274], 'Create Rectangle (Toolbar)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Verify rectangle layer is created',
        async () => {
          await mainPage.isCreatedLayerVisible();
          await expect(mainPage.viewport).toHaveScreenshot('rectangle.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([278], 'Change border radius multiple values (Design page in the right)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Set independent corner radii and verify',
        async () => {
          await designPanelPage.clickIndividualCornersRadiusButton();
          await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-changed-corners.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );

      await demoAccountFileTest.step(
        'Reset corner radii and verify default',
        async () => {
          await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot('rectangle.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([319], 'Transform Rectangle to Path'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Transform rectangle to path via right click',
        async () => {
          await mainPage.transformToPathViaRightClick();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify path component is visible on layers tab',
        async () => {
          await layersPanelPage.isPathComponentOnLayersTabVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [324],
      'Create component and detach instance (Right click and shortcut Ctrl+Shift+K)',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create component from rectangle via right click',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify component appears with included rectangle',
        async () => {
          await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
            'Rectangle',
          );
        },
      );

      await demoAccountFileTest.step(
        'Copy created rectangle component twice',
        async () => {
          await mainPage.duplicateLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.checkCopyComponentLayerCount(1);
          await mainPage.duplicateLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.checkCopyComponentLayerCount(2);
        },
      );

      await demoAccountFileTest.step(
        'Detach a rectangle copy instance via right click',
        async () => {
          await layersPanelPage.detachInstanceFirstCopyComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify one copy instance was detached (copy count is 1)',
        async () => {
          await layersPanelPage.checkCopyComponentLayerCount(1);
        },
      );

      await demoAccountFileTest.step(
        'Select remaining rectangle copy and detach instance via shortcut',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await mainPage.detachInstanceViaShortcut();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify all copy instances were detached (copy count is 0)',
        async () => {
          await layersPanelPage.checkCopyComponentLayerCount(0);
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([2255], 'Select and deselect rectangles'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Create four rectangles on canvas', async () => {
      await mainPage.createDefaultRectangleByCoordinates(400, 800);
      await mainPage.createDefaultRectangleByCoordinates(400, 200, true);
      await mainPage.createDefaultRectangleByCoordinates(100, 600, true);
      await mainPage.createDefaultRectangleByCoordinates(700, 600, true);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
      'Select all and deselect one, verify three selected',
      async () => {
        await mainPage.pressSelectAllShortcut();
        await mainPage.deselectElement();
        await expect(mainPage.viewport).toHaveScreenshot(
          'three-rectangle-selected.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );

    await demoAccountFileTest.step(
      'Deselect further and verify one selected',
      async () => {
        await mainPage.deselectElement();
        await mainPage.deselectElement();
        await expect(mainPage.viewport).toHaveScreenshot(
          'one-rectangle-selected.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);
