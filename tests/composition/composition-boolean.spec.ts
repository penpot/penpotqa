import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let workspacePage: WorkspacePage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  workspacePage = new WorkspacePage(page);
});

demoAccountFileTest(
  qase(
    [879],
    'Union of 2 shapes (enable/disable) - via design panel and shortcut CTRL ALT U',
  ),
  async ({ mainPage }) => {
    const { layers } = workspacePage.leftSidebar;
    const { boolean } = workspacePage.rightSidebar.design;
    const ellipseColor = '#B1B2B5';

    await demoAccountFileTest.step('Create a rectangle and an ellipse', async () => {
      await mainPage.createDefaultRectangleByCoordinates(300, 300);
      await mainPage.createDefaultEllipseByCoordinates(500, 300);
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Rectangle');
      await layers.checkLayerRowIsVisible('Ellipse');
      await designPanelPage.isFillHexCodeSet(ellipseColor);
    });

    await demoAccountFileTest.step(
      'Fill the rectangle to another color',
      async () => {
        await layers.selectLayer('Rectangle');
        await designPanelPage.typeFillHexCode('FF0000');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isFillHexCodeSet('#ff0000');
      },
    );

    await demoAccountFileTest.step(
      'Drag the rectangle to partially overlap ellipse (ellipse on top)',
      async () => {
        await workspacePage.canvas.dragShape({ x: 300, y: 300 }, { x: 440, y: 300 });
        await mainPage.waitForChangeIsSaved();
        // Shapes are 100x100 centered on the click: rectangle 390-490, ellipse 450-550
        await workspacePage.checkLayerPositions({ Rectangle: { x: 390, y: 250 } });
        await layers.checkLayerOrder(['Ellipse', 'Rectangle']);
        await mainPage.clickViewportTwice();
      },
    );

    await demoAccountFileTest.step('Select created shapes', async () => {
      await mainPage.pressSelectAllShortcut();
      await layers.checkSelectedLayersCount(2);
    });

    await demoAccountFileTest.step('Click CTRL+ALT+U combination', async () => {
      await mainPage.pressKeyboardShortcut('Control+Alt+U');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isNumLayerNameVisible('Union', 1);
      await layers.checkLayerIsChildOf('Ellipse', 'Union');
      await layers.checkLayerIsChildOf('Rectangle', 'Union');
      await designPanelPage.isFillHexCodeSet(ellipseColor);
      // Deselect, so the handles aren't in the snapshot
      await mainPage.clickViewportTwice();
      await expect(mainPage.viewport).toHaveScreenshot(
        'union-rectangle-ellipse.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await demoAccountFileTest.step(
      'Select the Union and press SHIFT+G (Ungroup)',
      async () => {
        await layers.selectLayer('Union');
        await mainPage.pressKeyboardShortcut('Shift+G');
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isNumLayerNameVisible('Union', 0);
        await layers.checkLayerOrder(['Ellipse', 'Rectangle']);
      },
    );

    await demoAccountFileTest.step(
      'Select both shapes and click the Union button at the top of the Design tab',
      async () => {
        await mainPage.pressSelectAllShortcut();
        await layers.checkSelectedLayersCount(2);
        await boolean.applyOperation('Union');
        await mainPage.waitForChangeIsSaved();
        await boolean.checkOperationSelected('Union');
        await layersPanelPage.isNumLayerNameVisible('Union', 1);
        await layers.checkLayerIsChildOf('Ellipse', 'Union');
        await layers.checkLayerIsChildOf('Rectangle', 'Union');
        await designPanelPage.isFillHexCodeSet(ellipseColor);
      },
    );
  },
);
