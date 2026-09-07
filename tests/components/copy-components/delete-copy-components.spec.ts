import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
});

mainAccountFileTest(qase(1496, 'Undo deleted component'), async ({ mainPage }) => {
  await mainAccountFileTest.step('Create rectangle and copy component', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.duplicateLayerViaRightClick();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
  });

  await mainAccountFileTest.step('Delete copy component', async () => {
    await mainPage.pressDeleteKeyboardButton();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
  });

  await mainAccountFileTest.step('Verify copy component is deleted', async () => {
    await expect(
      mainPage.viewport,
      'Viewport should match screenshot after deleting copy component',
    ).toHaveScreenshot('rectangle-copy-component-delete.png', {
      mask: mainPage.maskViewport(),
    });
  });

  await mainAccountFileTest.step('Undo deletion', async () => {
    await mainPage.clickShortcutCtrlZ();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
  });

  await mainAccountFileTest.step(
    'Verify copy component is restored after undo',
    async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after undoing deletion',
      ).toHaveScreenshot('rectangle-copy-component-delete-undo.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );
});
