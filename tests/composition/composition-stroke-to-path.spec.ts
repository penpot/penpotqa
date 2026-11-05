import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect } from 'playwright/test';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([3472], 'Stroke to path on a basic rectangle with a single solid stroke'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Create a rectangle', async () => {
      await mainPage.pressKeyboardShortcut('R');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
    });

    await demoAccountFileTest.step('Add a stroke', async () => {
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.setStrokeWidth('4');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkStrokeWidth('4');
    });

    await demoAccountFileTest.step(
      'Right-click the shape to open the contextual menu and click Stroke to path',
      async () => {
        await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
          'Rectangle',
          'Stroke to path',
        );
        await mainPage.waitForChangeIsSaved();
        await mainPage.pressHideShowRulersShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'stroke-to-path-rectangle-added.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );

    await demoAccountFileTest.step(
      'Check the stroke is now a separate path in the Layers panel',
      async () => {
        await layersPanelPage.isLayerNameDisplayed('Rectangle (stroke)');
        await layersPanelPage.isLayerWithNameSelected('Rectangle (stroke)');
      },
    );

    await demoAccountFileTest.step(
      'Check the rectangle keeps its fill and has no stroke',
      async () => {
        await layersPanelPage.selectLayerByExactName('Rectangle');
        await designPanelPage.isFillHexCodeSet('#B1B2B5');
        await designPanelPage.checkStrokeIsAdded(false);
      },
    );

    await demoAccountFileTest.step(
      'Click the stroke on the canvas → the stroke path is selected',
      async () => {
        const viewportBox = await mainPage.viewport.boundingBox();
        if (!viewportBox) throw new Error('Could not get bounding box for viewport');
        // The stroke path is on top of the rectangle, so a click on the shape selects it
        const rectangle = await mainPage.getSelectionBox();
        await mainPage.clickOnESC();
        await mainPage.clickViewportByCoordinates(
          rectangle.x - viewportBox.x + 1,
          rectangle.y - viewportBox.y + rectangle.height / 2,
        );
        await layersPanelPage.isLayerWithNameSelected('Rectangle (stroke)');
        await layersPanelPage.isLayerWithNameSelected('Rectangle', false);
      },
    );
  },
);
