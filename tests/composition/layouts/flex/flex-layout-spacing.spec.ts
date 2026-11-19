import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

layoutTest.describe('Flex board with three ellipses', () => {
  layoutTest.beforeEach(async ({ mainPage, designPanelPage }) => {
    layoutTest.slow();
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '500');
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  layoutTest(
    qase([640, 641], 'Use different numbers of paddings on all sides'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('(640) Switch to independent paddings', async () => {
        await designPanelPage.switchToIndependentPadding();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-layout-independent-paddings.png',
          { mask: mainPage.maskViewport() },
        );
      });

      await layoutTest.step('(641) Set Top padding to 20', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Top', '20');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue('Top', '20');
      });

      await layoutTest.step(
        '(641) Set Bottom padding to -20, expects 0',
        async () => {
          await designPanelPage.changeLayoutIndependentPadding('Bottom', '-20');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.verifyLayoutIndependentPaddingValue('Bottom', '0');
        },
      );

      await layoutTest.step('(641) Set Right padding to 200000000', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Right', '200000000');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue(
          'Right',
          '200000000',
        );
      });

      await layoutTest.step(
        '(641) Set Left padding to invalid text, expects value unchanged',
        async () => {
          await designPanelPage.changeLayoutIndependentPadding('Left', 'Test');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.verifyLayoutIndependentPaddingValue('Left', '0');
        },
      );
    },
  );

  layoutTest(
    qase([643], 'Set margins and padding to 0'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step(
        'Set Vertical padding, Horizontal padding and column gap to 0',
        async () => {
          await designPanelPage.changeLayoutPadding('Vertical', '0');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutPadding('Horizontal', '0');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutColumnGap('0');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkLayoutPadding('Vertical', '0');
          await designPanelPage.checkLayoutPadding('Horizontal', '0');
          await designPanelPage.checkColumnGap('0');
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-padding-gap-0.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
      await layoutTest.step(
        'Click Vertical padding field and verify highlight',
        async () => {
          await designPanelPage.clickLayoutVerticalPaddingField();
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-padding-gap-0.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
      await layoutTest.step(
        'Click Horizontal padding field and verify highlight',
        async () => {
          await designPanelPage.clickLayoutHorizontalPaddingField();
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-padding-gap-0.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
      await layoutTest.step(
        'Click column gap field and verify highlight',
        async () => {
          await designPanelPage.clickLayoutColumnGapField();
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-padding-gap-0.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  layoutTest(
    qase([645], 'Gap click highlight'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('Set column gap to 20', async () => {
        await designPanelPage.changeLayoutColumnGap('20');
        await mainPage.waitForChangeIsSaved();
      });
      await layoutTest.step(
        'Click column gap field and verify highlight',
        async () => {
          await designPanelPage.clickLayoutColumnGapField();
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-column-gap-highlighted.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
    },
  );

  layoutTest(
    qase([647], 'Use absolute position and look if element still inside a board'),
    async ({ mainPage, designPanelPage, layersPanelPage }) => {
      await layoutTest.step(
        'Select Ellipse layer and verify flex element section is opened',
        async () => {
          await layersPanelPage.selectBoardChildLayer('Ellipse');
          await designPanelPage.isFlexElementSectionOpened();
        },
      );
      await layoutTest.step('Set flex element position to absolute', async () => {
        await designPanelPage.setFlexElementPositionAbsolute();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isFlexElementPositionAbsoluteChecked();
      });
      await layoutTest.step('Verify element is still inside the board', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-position-absolute.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );
});
