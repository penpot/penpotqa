import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

layoutTest.describe('Board with an ellipse and a rectangle', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage }) => {
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  layoutTest(
    qase([607], 'Add flex layout to board from right click'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step('Add flex layout via right click', async () => {
        await mainPage.addFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await layoutTest.step('Verify flex layout is applied', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
        await designPanelPage.isLayoutRemoveButtonExists();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-layout-right-click.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );

  layoutTest(
    qase([608], 'Add flex layout to board from shortcut (SHIFT+A)'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step('Add flex layout via shortcut (SHIFT+A)', async () => {
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await layoutTest.step('Verify flex layout is applied', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
        await designPanelPage.isLayoutRemoveButtonExists();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-layout-shortcut.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );

  layoutTest(
    qase([610], 'Remove flex layout from board from rightclick'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step('Add flex layout and verify it is applied', async () => {
        await mainPage.addFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
        await designPanelPage.isLayoutRemoveButtonExists();
      });
      await layoutTest.step('Remove flex layout via right click', async () => {
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.removeFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await layoutTest.step('Verify flex layout is removed', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
        await designPanelPage.isLayoutRemoveButtonExists(false);
      });
    },
  );

  layoutTest(
    qase([611], 'Remove flex layout from board from shortcut (SHIFT+A)'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step(
        'Add flex layout via shortcut and verify it is applied',
        async () => {
          await mainPage.pressFlexLayoutShortcut();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
          await designPanelPage.isLayoutRemoveButtonExists();
        },
      );
      await layoutTest.step(
        'Remove flex layout via shortcut (SHIFT+A)',
        async () => {
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await mainPage.pressFlexLayoutShortcut();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
        },
      );
      await layoutTest.step('Verify flex layout is removed', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
        await designPanelPage.isLayoutRemoveButtonExists(false);
      });
    },
  );

  layoutTest(
    qase([612], 'Remove flex layout from board from Design panel'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step('Add flex layout and verify it is applied', async () => {
        await mainPage.addFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
        await designPanelPage.isLayoutRemoveButtonExists();
      });
      await layoutTest.step('Remove flex layout from Design panel', async () => {
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await designPanelPage.removeLayoutFromDesignPanel();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await layoutTest.step('Verify flex layout is removed', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
        await designPanelPage.isLayoutRemoveButtonExists(false);
      });
    },
  );
});
