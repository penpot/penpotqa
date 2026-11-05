import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { type StrokeSectionComponent } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
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
  qase([3403], 'Draw an arrow using the toolbar Arrow tool with press-and-drag'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Select the Arrow tool', async () => {
      await mainPage.clickCreateArrowButton();
      await mainPage.isShapeToolActive('arrow');
    });

    await demoAccountFileTest.step(
      'Draw an arrow line via toolbar and verify layer created',
      async () => {
        await mainPage.dragOnViewport(400, 400, 400, 600);
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await layersPanelPage.isLayerNameDisplayed('Path');
      },
    );

    await demoAccountFileTest.step(
      'Verify arrow size and default triangle end cap',
      async () => {
        await mainPage.clickOnDesignTab();
        await designPanelPage.checkSizeWidth('0.01');
        await designPanelPage.checkSizeHeight('200');
        await strokeSection.checkStrokeCaps('None', 'Triangle');
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
    await demoAccountFileTest.step('Select the Arrow tool', async () => {
      await mainPage.clickCreateArrowButton();
      await mainPage.isShapeToolActive('arrow');
    });

    await demoAccountFileTest.step(
      'Click once on the canvas without dragging',
      async () => {
        await mainPage.clickViewportByCoordinates(400, 400);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Verify a default 100px horizontal arrow is created',
      async () => {
        await layersPanelPage.isVisibleLayersCount(1);
        await layersPanelPage.isLayerNameDisplayed('Path');
        await mainPage.clickOnDesignTab();
        await designPanelPage.checkSizeWidth('100');
        await designPanelPage.checkSizeHeight('0.01');
        await designPanelPage.checkStrokeWidth('1');
        await strokeSection.checkStrokeCaps('None', 'Triangle');
      },
    );
  },
);
