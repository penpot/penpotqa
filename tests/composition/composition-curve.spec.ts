import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let layers: LayersPanelComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layers = new WorkspacePage(page).leftSidebar.layers;
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest(
    qase([483], 'Create curve line (Toolbar)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Click Curve icon in the toolbar (on the left)',
        async () => {
          await mainPage.clickCreateCurveButton();
        },
      );

      await demoAccountFileTest.step('Hover mouse to the canvas', async () => {
        await mainPage.viewport.hover();
      });

      await demoAccountFileTest.step(
        'Hold LMB, move the mouse and release LMB',
        async () => {
          await mainPage.drawCurve(900, 300, 600, 200);
          await mainPage.waitForChangeIsSaved();
          await mainPage.isCreatedLayerVisible();
          await layers.checkLayerRowIsVisible('Path');
          await expect(mainPage.viewport).toHaveScreenshot('curve.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});
