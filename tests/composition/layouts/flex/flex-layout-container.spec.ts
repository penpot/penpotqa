import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import {
  AlignContent,
  LayoutDirection,
} from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

layoutTest.describe('Flex board with an ellipse and a rectangle', () => {
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
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  layoutTest(
    qase([613], 'Change direction'),
    async ({ mainPage, layoutContainer }) => {
      await layoutTest.step('Change direction to Row reverse', async () => {
        await layoutContainer.changeDirection(LayoutDirection.RowReverse);
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkDirection(LayoutDirection.RowReverse);
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-row-reverse-direction.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change direction to Column', async () => {
        await layoutContainer.changeDirection(LayoutDirection.Column);
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkDirection(LayoutDirection.Column);
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-column-direction.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change direction to Column reverse', async () => {
        await layoutContainer.changeDirection(LayoutDirection.ColumnReverse);
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkDirection(LayoutDirection.ColumnReverse);
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-column-reverse-direction.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change direction to Row', async () => {
        await layoutContainer.changeDirection(LayoutDirection.Row);
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkDirection(LayoutDirection.Row);
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-row-direction.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  layoutTest(
    qase([623], 'Change content alignment'),
    async ({
      mainPage,
      workspacePage,
      layoutContainer,
      designPanelPage,
      layersPanelPage,
    }) => {
      // X/Y are relative to the 300x300 board; the rectangle is 100x100, the ellipse 50x50
      const oneRow = [
        {
          alignment: AlignContent.Center,
          rectangle: { x: 0, y: 100 },
          ellipse: { x: 100, y: 100 },
        },
        {
          alignment: AlignContent.End,
          rectangle: { x: 0, y: 200 },
          ellipse: { x: 100, y: 200 },
        },
      ];
      // Two wrapped rows (100 + 50 high) share 150px of free space
      const twoRows = [
        {
          alignment: AlignContent.SpaceBetween,
          rectangle: { x: 0, y: 0 },
          ellipse: { x: 0, y: 250 },
        },
        {
          alignment: AlignContent.SpaceAround,
          rectangle: { x: 0, y: 37.5 },
          ellipse: { x: 0, y: 212.5 },
        },
        {
          alignment: AlignContent.SpaceEvenly,
          rectangle: { x: 0, y: 50 },
          ellipse: { x: 0, y: 200 },
        },
        {
          alignment: AlignContent.Start,
          rectangle: { x: 0, y: 0 },
          ellipse: { x: 0, y: 100 },
        },
      ];

      await layoutTest.step(
        'Make the ellipse 50x50 (rectangle 100x100): both stay at the top left',
        async () => {
          await layersPanelPage.selectBoardChildLayer('Ellipse');
          await designPanelPage.changeHeightAndWidthForLayer('50', '50');
          await mainPage.waitForChangeIsSaved();
          await workspacePage.checkLayerPositions({
            Rectangle: { x: 0, y: 0 },
            Ellipse: { x: 100, y: 0 },
          });
        },
      );

      await layoutTest.step(
        'Turn on Wrap: the "Content" subsection appears',
        async () => {
          await layersPanelPage.selectLayerByExactName('Board');
          await layoutContainer.expand();
          await designPanelPage.changeLayoutWrap('Wrap');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isLayoutContentSectionVisible();
        },
      );

      for (const { alignment, rectangle, ellipse } of oneRow) {
        await layoutTest.step(`${alignment}: the row moves`, async () => {
          await layersPanelPage.selectLayerByExactName('Board');
          await layoutContainer.changeAlignContent(alignment);
          await mainPage.waitForChangeIsSaved();
          await layoutContainer.checkAlignContent(alignment);
          await workspacePage.checkLayerPositions({
            Rectangle: rectangle,
            Ellipse: ellipse,
          });
        });
      }

      await layoutTest.step(
        'Make the board narrower: the shapes wrap into a column',
        async () => {
          await layersPanelPage.selectLayerByExactName('Board');
          // Wait for the Design tab to show the board, or the width goes to the ellipse
          await designPanelPage.isWidthValue(300);
          await designPanelPage.changeWidthForLayer('120');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isWidthValue(120);
          await workspacePage.checkLayerPositions({
            Rectangle: { x: 0, y: 150 },
            Ellipse: { x: 0, y: 250 },
          });
        },
      );

      for (const { alignment, rectangle, ellipse } of twoRows) {
        await layoutTest.step(`${alignment}: the rows move`, async () => {
          await layersPanelPage.selectLayerByExactName('Board');
          await layoutContainer.changeAlignContent(alignment);
          await mainPage.waitForChangeIsSaved();
          await layoutContainer.checkAlignContent(alignment);
          await workspacePage.checkLayerPositions({
            Rectangle: rectangle,
            Ellipse: ellipse,
          });
        });
      }
    },
  );

  layoutTest(
    qase([615], 'Change alignment'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('Change alignment to Center', async () => {
        await designPanelPage.changeLayoutAlignment('Center');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isLayoutAlignmentSelected('Center');
        await expect(mainPage.viewport).toHaveScreenshot('layout-align-center.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await layoutTest.step('Change alignment to End', async () => {
        await designPanelPage.changeLayoutAlignment('End');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isLayoutAlignmentSelected('End');
        await expect(mainPage.viewport).toHaveScreenshot('layout-align-end.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await layoutTest.step('Change alignment to Start', async () => {
        await designPanelPage.changeLayoutAlignment('Start');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isLayoutAlignmentSelected('Start');
        await expect(mainPage.viewport).toHaveScreenshot('layout-align-start.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  layoutTest(
    qase([616], 'Change justification'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('Change justification to Center', async () => {
        await designPanelPage.changeLayoutJustification('Center');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutJustification('Center');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-center.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
      await layoutTest.step('Change justification to End', async () => {
        await designPanelPage.changeLayoutJustification('End');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutJustification('End');
        await expect(mainPage.viewport).toHaveScreenshot('layout-justify-end.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await layoutTest.step('Change justification to Space between', async () => {
        await designPanelPage.changeLayoutJustification('Space between');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutJustification('Space between');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-space-between.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change justification to Space around', async () => {
        await designPanelPage.changeLayoutJustification('Space around');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutJustification('Space around');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-space-around.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change justification to Space evenly', async () => {
        await designPanelPage.changeLayoutJustification('Space evenly');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutJustification('Space evenly');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-space-evenly.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change justification to Start', async () => {
        await designPanelPage.changeLayoutJustification('Start');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutJustification('Start');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-start.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  layoutTest(
    qase([614], 'Change wrapping'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step(
        'Click "Wrap" → the "Content" subsection appears',
        async () => {
          await designPanelPage.changeLayoutWrap('Wrap');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isLayoutContentSectionVisible();
        },
      );
      await layoutTest.step(
        'Click "No wrap" → the "Content" subsection is hidden',
        async () => {
          await designPanelPage.changeLayoutWrap('No wrap');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isLayoutContentSectionVisible(false);
        },
      );
    },
  );

  layoutTest(
    qase([617], 'Change alignment & justification'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step(
        'Click "Align items center" → "Center" alignment is selected',
        async () => {
          await designPanelPage.changeLayoutAlignment('Center');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isLayoutAlignmentSelected('Center');
        },
      );
      await layoutTest.step(
        'Click "Justify content center" → shapes aligned & justified center',
        async () => {
          await designPanelPage.changeLayoutJustification('Center');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkLayoutJustification('Center');
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-align-center-justify-center.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
      await layoutTest.step(
        'Click "Align items end" → shapes aligned bottom, justified center',
        async () => {
          await designPanelPage.changeLayoutAlignment('End');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isLayoutAlignmentSelected('End');
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-align-end-justify-center.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
      await layoutTest.step(
        'Click "Justify content space-around" → shapes justified space-around, aligned bottom',
        async () => {
          await designPanelPage.changeLayoutJustification('Space around');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkLayoutJustification('Space around');
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-align-end-justify-space-around.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
    },
  );

  layoutTest(
    qase([618], 'Change column gap'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('Set column gap to 5', async () => {
        await designPanelPage.changeLayoutColumnGap('5');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkColumnGap('5');
        await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-5.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await layoutTest.step('Set column gap to 15', async () => {
        await designPanelPage.changeLayoutColumnGap('15');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkColumnGap('15');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-column-gap-15.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
      await layoutTest.step('Set column gap to 0', async () => {
        await designPanelPage.changeLayoutColumnGap('0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkColumnGap('0');
        await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-0.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  layoutTest(
    qase([619], 'Change row gap'),
    async ({ mainPage, layoutContainer, designPanelPage }) => {
      await layoutTest.step('Change direction to Column', async () => {
        await layoutContainer.changeDirection(LayoutDirection.Column);
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkDirection(LayoutDirection.Column);
      });
      await layoutTest.step('Set row gap to 5', async () => {
        await designPanelPage.changeLayoutRowGap('5');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkRowGap('5');
        await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-5.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await layoutTest.step('Set row gap to 15', async () => {
        await designPanelPage.changeLayoutRowGap('15');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkRowGap('15');
        await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-15.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await layoutTest.step('Set row gap to 0', async () => {
        await designPanelPage.changeLayoutRowGap('0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkRowGap('0');
        await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-0.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  layoutTest(
    qase([620], 'Change padding (single)'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('Set Vertical padding to 5', async () => {
        await designPanelPage.changeLayoutPadding('Vertical', '5');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutPadding('Vertical', '5');
      });
      await layoutTest.step('Set Horizontal padding to 15', async () => {
        await designPanelPage.changeLayoutPadding('Horizontal', '15');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutPadding('Horizontal', '15');
        await expect(mainPage.viewport).toHaveScreenshot('layout-padding-5-15.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await layoutTest.step('Set Vertical padding to 0', async () => {
        await designPanelPage.changeLayoutPadding('Vertical', '0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutPadding('Vertical', '0');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-vertical-padding-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Set Horizontal padding to 0', async () => {
        await designPanelPage.changeLayoutPadding('Horizontal', '0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutPadding('Horizontal', '0');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-horizontal-padding-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );

  layoutTest(
    qase([621], 'Change padding (multiple)'),
    async ({ mainPage, designPanelPage }) => {
      await layoutTest.step('Switch to independent padding', async () => {
        await designPanelPage.switchToIndependentPadding();
        await mainPage.waitForChangeIsSaved();
      });
      await layoutTest.step('Set Top padding to 10', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Top', '10');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue('Top', '10');
      });
      await layoutTest.step('Set Left padding to 15', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Left', '15');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue('Left', '15');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-top-left-padding-10-15.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Change justification to End', async () => {
        await designPanelPage.changeLayoutJustification('End');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkLayoutJustification('End');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-top-left-padding-10-15-justify.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Set Right padding to 20', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Right', '20');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue('Right', '20');
      });
      await layoutTest.step('Change alignment to End', async () => {
        await designPanelPage.changeLayoutAlignment('End');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isLayoutAlignmentSelected('End');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-top-left-right-padding-justify-align.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await layoutTest.step('Set Bottom padding to 25', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Bottom', '25');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue('Bottom', '25');
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-top-left-right-bottom-padding.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );
});
