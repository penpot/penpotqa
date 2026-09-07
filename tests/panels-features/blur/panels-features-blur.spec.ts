import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultTextLayerByCoordinates(100, 100);
    await mainPage.createDefaultEllipseByCoordinates(100, 100);
  });

  mainAccountFileTest(
    qase([3056, 3049], 'Create a background blur and add shadow'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('3056 Create a background blur', async () => {
        await mainAccountFileTest.step(
          'Add a background blur to the ellipse',
          async () => {
            await designPanelPage.clickAddBlurButton();
            await designPanelPage.selectTypeForBlurEffects('Background blur');
            await mainPage.waitForChangeIsSaved();
          },
        );

        await mainAccountFileTest.step(
          'Change the opacity fill in the ellipse',
          async () => {
            await designPanelPage.changeOpacityForFill('30');
            await mainPage.waitForChangeIsSaved();
            await mainPage.clickViewportTwice();
          },
        );

        await mainAccountFileTest.step('Check the background blur', async () => {
          await expect(mainPage.viewport).toHaveScreenshot('background-blur.png', {
            mask: mainPage.maskViewport(),
          });
        });
      });

      await mainAccountFileTest.step(
        '3049 Shadow renders correctly with background blur',
        async () => {
          await mainAccountFileTest.step('Add shadow to the ellipse', async () => {
            await layersPanelPage.selectLayerByName('Ellipse');
            await designPanelPage.clickAddShadowButton();
            await mainPage.waitForChangeIsSaved();
            await mainPage.clickViewportTwice();
          });

          await mainAccountFileTest.step(
            'Check the background blur with shadow',
            async () => {
              await expect(mainPage.viewport).toHaveScreenshot(
                'background-blur-with-shadow.png',
                {
                  mask: mainPage.maskViewport(),
                },
              );
            },
          );
        },
      );
    },
  );
});
