import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import {
  AlignSelf,
  ElementMargin,
} from '@pages/workspace/right-sidebar/design-tab/layout-item-section-component';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

layoutTest.describe('Rectangle selected inside a flex board', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage, layersPanelPage }) => {
    layoutTest.slow();
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await layersPanelPage.selectBoardChildLayer('Rectangle');
    await designPanelPage.isFlexElementSectionOpened();
  });

  layoutTest(
    qase([627], 'Flex elements change - alignment'),
    async ({ mainPage, layoutItem }) => {
      await layoutTest.step('Change flex element alignment to Center', async () => {
        await layoutItem.changeAlignSelf(AlignSelf.Center);
        await mainPage.waitForChangeIsSaved();
        await layoutItem.checkAlignSelf(AlignSelf.Center);
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-align-center.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change flex element alignment to End', async () => {
        await layoutItem.changeAlignSelf(AlignSelf.End);
        await mainPage.waitForChangeIsSaved();
        await layoutItem.checkAlignSelf(AlignSelf.End);
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-align-end.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
      await layoutTest.step('Change flex element alignment to Start', async () => {
        await layoutItem.changeAlignSelf(AlignSelf.Start);
        await mainPage.waitForChangeIsSaved();
        await layoutItem.checkAlignSelf(AlignSelf.Start);
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-align-start.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );

  layoutTest(
    qase([628], 'Flex elements - change margin (single)'),
    async ({ mainPage, layoutItem }) => {
      await layoutTest.step('Set flex element margin Vertical to 10', async () => {
        await layoutItem.changeMargin(ElementMargin.Vertical, '10');
        await mainPage.waitForChangeIsSaved();
        await layoutItem.checkMargin(ElementMargin.Vertical, '10');
      });
      await layoutTest.step('Set flex element margin Horizontal to 25', async () => {
        await layoutItem.changeMargin(ElementMargin.Horizontal, '25');
        await mainPage.waitForChangeIsSaved();
        await layoutItem.checkMargin(ElementMargin.Horizontal, '25');
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-margin-10-25.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Set flex element margin Vertical to 0', async () => {
        await layoutItem.changeMargin(ElementMargin.Vertical, '0');
        await mainPage.waitForChangeIsSaved();
        await layoutItem.checkMargin(ElementMargin.Vertical, '0');
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-margin-vert-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Set flex element margin Horizontal to 0', async () => {
        await layoutItem.changeMargin(ElementMargin.Horizontal, '0');
        await mainPage.waitForChangeIsSaved();
        await layoutItem.checkMargin(ElementMargin.Horizontal, '0');
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-margin-horizontal-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );
});

layoutTest.describe('Empty flex board added from the Design panel', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage, layersPanelPage }) => {
    await mainPage.isMainPageLoaded();
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.addLayoutFromDesignPanel('flex');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
  });

  layoutTest(
    qase([630], 'Flex elements - set minimum width'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step('Draw the rectangle in the board', async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step(
        'Select the rectangle → "Flex element" section appears',
        async () => {
          await layersPanelPage.selectBoardChildLayer('Rectangle');
          await designPanelPage.isFlexElementSectionOpened();
        },
      );
      await layoutTest.step(
        'Click "Width 100%" → rectangle fills the board width and Min/Max width fields appear',
        async () => {
          await designPanelPage.clickOnFlexElementWidth100Btn();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isWidthValue(100);
          await designPanelPage.isFlexElementMinMaxVisible('Width');
        },
      );
      await layoutTest.step(
        'Type 50 in "Min width" → the value is saved',
        async () => {
          await designPanelPage.changeFlexElementMinMax('Width', true, '50');
          await designPanelPage.checkFlexElementMinMax('Width', true, '50');
        },
      );
      await layoutTest.step(
        'Change the board width to 30 → board is 30 wide, rectangle is 50 wide',
        async () => {
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeWidthForLayer('30');
          await designPanelPage.isWidthValue(30);
          await layersPanelPage.selectBoardChildLayer('Rectangle');
          await designPanelPage.isWidthValue(50);
        },
      );
      await layoutTest.step(
        'Type 0 in "Min width" → rectangle fits the board width',
        async () => {
          await designPanelPage.changeFlexElementMinMax('Width', true, '0');
          await designPanelPage.isWidthValue(30);
        },
      );
    },
  );

  layoutTest(
    qase([633], 'Flex elements - set maximum height'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step('Draw the ellipse in the board', async () => {
        await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
        await mainPage.waitForChangeIsSaved();
      });

      await layoutTest.step(
        'Select the ellipse → "Flex element" section appears',
        async () => {
          await layersPanelPage.selectBoardChildLayer('Ellipse');
          await designPanelPage.isFlexElementSectionOpened();
        },
      );
      await layoutTest.step(
        'Click "Height 100%" → ellipse fills the board height and Min/Max height fields appear',
        async () => {
          await designPanelPage.clickOnFlexElementHeight100Btn();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isHeightValue(100);
          await designPanelPage.isFlexElementMinMaxVisible('Height');
        },
      );
      await layoutTest.step(
        'Type 150 in "Max height" → the value is saved',
        async () => {
          await designPanelPage.changeFlexElementMinMax('Height', false, '150');
          await designPanelPage.checkFlexElementMinMax('Height', false, '150');
        },
      );
      await layoutTest.step(
        'Change the board height to 200 → board is 200 high, ellipse is 150 high',
        async () => {
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeHeightForLayer('200');
          await designPanelPage.isHeightValue(200);
          await layersPanelPage.selectBoardChildLayer('Ellipse');
          await designPanelPage.isHeightValue(150);
        },
      );
      await layoutTest.step(
        'Clear "Max height" → ellipse fits the board height',
        async () => {
          await designPanelPage.changeFlexElementMinMax('Height', false, '');
          await designPanelPage.isHeightValue(200);
        },
      );
    },
  );
});
