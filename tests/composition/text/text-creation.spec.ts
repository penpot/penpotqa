import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';

mainAccountFileTest(qase([377], 'Create Text(Toolbar)'), async ({ mainPage }) => {
  await mainPage.createDefaultTextLayer();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('text-creation-toolbar.png', {
    mask: mainPage.maskViewport(),
  });
});

mainAccountFileTest(
  qase([378], 'Create Text (Shortcut T)'),
  async ({ mainPage }) => {
    await mainPage.createDefaultTextLayerViaShortcut();
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('text-creation-shortcut.png', {
      mask: mainPage.maskViewport(),
    });
  },
);
