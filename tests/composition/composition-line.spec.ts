import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import {
  StrokeCap,
  type StrokeSectionComponent,
} from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layers: LayersPanelComponent;
let strokeSection: StrokeSectionComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  const workspacePage = new WorkspacePage(page);
  layers = workspacePage.leftSidebar.layers;
  strokeSection = workspacePage.rightSidebar.design.stroke;
});

demoAccountFileTest(
  qase([3400], 'Draw a line using the toolbar Line tool with press-and-drag'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Click the Line tool icon in the toolbar.',
      async () => {
        await mainPage.clickCreateLineButton();
        await mainPage.isShapeToolActive('line');
      },
    );

    await demoAccountFileTest.step(
      'Press and drag from a starting point to an ending point on the canvas, then release.',
      async () => {
        await mainPage.dragOnViewport(400, 400, 600, 600);
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await layers.checkLayerRowIsVisible('Path');
        await mainPage.clickOnDesignTab();
        await designPanelPage.checkSizeWidth('200');
        await designPanelPage.checkSizeHeight('200');
        await designPanelPage.checkStrokeWidth('1');
        await strokeSection.checkStrokeHexCode('#000000');
        await strokeSection.checkStrokeCaps(StrokeCap.None, StrokeCap.None);
        await expect(mainPage.viewport).toHaveScreenshot('line.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);
