import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect } from 'playwright/test';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let layers: LayersPanelComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  layers = new WorkspacePage(page).leftSidebar.layers;
});

demoAccountFileTest(
  qase([3472], 'Stroke to path on a basic rectangle with a single solid stroke'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Create a rectangle on the canvas.', async () => {
      await mainPage.pressKeyboardShortcut('R');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layers.checkLayerRowIsVisible('Rectangle');
    });

    await demoAccountFileTest.step(
      'Add a stroke to the rectangle (e.g. 4px solid, any color) via the design panel.',
      async () => {
        await designPanelPage.clickAddStrokeButton();
        await designPanelPage.setStrokeWidth('4');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkStrokeWidth('4');
      },
    );

    await demoAccountFileTest.step(
      'Right-click the shape to open the contextual menu and click Stroke to path.',
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
        // The stroke is converted into a separate path visible in the Layers panel
        await layers.checkLayerRowIsVisible('Rectangle (stroke)');
        await layersPanelPage.isLayerWithNameSelected('Rectangle (stroke)');
        // The rectangle keeps its fill and loses the stroke
        await layersPanelPage.selectLayerByExactName('Rectangle');
        await designPanelPage.isFillHexCodeSet('#B1B2B5');
        await designPanelPage.checkStrokeIsAdded(false);
        // The stroke path is selectable on the canvas
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
