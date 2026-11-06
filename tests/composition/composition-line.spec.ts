import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import {
  StrokeCap,
  type StrokeSectionComponent,
} from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let strokeSection: StrokeSectionComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  strokeSection = new WorkspacePage(page).rightSidebar.design.stroke;
});

demoAccountFileTest(
  qase([3400], 'Draw a line using the toolbar Line tool with press-and-drag'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Select the Line tool', async () => {
      await mainPage.clickCreateLineButton();
      await mainPage.isShapeToolActive('line');
    });

    await demoAccountFileTest.step(
      'Draw a line via toolbar and verify layer created',
      async () => {
        await mainPage.dragOnViewport(400, 400, 600, 600);
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await layersPanelPage.isLayerNameDisplayed('Path');
      },
    );

    await demoAccountFileTest.step(
      'Verify line size, 1px black stroke and no stroke caps',
      async () => {
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
