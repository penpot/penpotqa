import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import {
  StrokeCap,
  type StrokeSectionComponent,
} from '@pages/workspace/right-sidebar/design-tab/stroke/stroke-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let layers: LayersPanelComponent;
let strokeSection: StrokeSectionComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  const workspacePage = new WorkspacePage(page);
  layers = workspacePage.leftSidebar.layers;
  strokeSection = workspacePage.rightSidebar.design.stroke;
});

demoAccountFileTest(
  qase([3403], 'Draw an arrow using the toolbar Arrow tool with press-and-drag'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Click the Arrow tool icon in the toolbar.',
      async () => {
        await mainPage.clickCreateArrowButton();
        await mainPage.isShapeToolActive('arrow');
      },
    );

    await demoAccountFileTest.step(
      'Press and drag from a starting point to an ending point on the canvas, then release.',
      async () => {
        await mainPage.dragOnViewport(400, 400, 400, 600);
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await layers.checkLayerRowIsVisible('Path');
        await mainPage.clickOnDesignTab();
        await designPanelPage.checkSizeWidth('0.01');
        await designPanelPage.checkSizeHeight('200');
        await strokeSection.checkStrokeCaps(StrokeCap.None, StrokeCap.Triangle);
        await expect(mainPage.viewport).toHaveScreenshot('arrow-line.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [3412],
    'Draw an arrow with a single click and no drag creates a default arrow',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Select the Arrow tool from the toolbar.',
      async () => {
        await mainPage.clickCreateArrowButton();
        await mainPage.isShapeToolActive('arrow');
      },
    );

    await demoAccountFileTest.step(
      'Click once on the canvas without dragging and release immediately at the same point.',
      async () => {
        await mainPage.clickViewportByCoordinates(400, 400);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Observe the canvas for any shape creation.',
      async () => {
        await layersPanelPage.isVisibleLayersCount(1);
        await layers.checkLayerRowIsVisible('Path');
        await mainPage.clickOnDesignTab();
        await designPanelPage.checkSizeWidth('100');
        await designPanelPage.checkSizeHeight('0.01');
        await designPanelPage.checkStrokeWidth('1');
        await strokeSection.checkStrokeCaps(StrokeCap.None, StrokeCap.Triangle);
      },
    );
  },
);
