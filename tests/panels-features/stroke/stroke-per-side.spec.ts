import {
  StrokePerSidePage,
  StrokeSide,
  type StrokeSideName,
} from '@pages/workspace/design-panel/stroke-per-side-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const TEST_FILE = 'documents/tokens/stroke-per-side-test-file.penpot';
const { Top: TOP, Right: RIGHT, Bottom: BOTTOM, Left: LEFT } = StrokeSide;
const SIDES: StrokeSideName[] = Object.values(StrokeSide);
const TEST_FILE_WIDTHS: Record<StrokeSideName, string> = {
  [TOP]: '2',
  [RIGHT]: '4',
  [BOTTOM]: '8',
  [LEFT]: '16',
};

let layersPanelPage: LayersPanelPage;
let strokePerSidePage: StrokePerSidePage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  strokePerSidePage = new StrokePerSidePage(page);
});

demoAccountFileTest(
  qase([3808], 'Set a different stroke width on each side of a rectangle'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Create a rectangle, add a stroke and check the row and the "Stroke per side" tooltip',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.isCreatedLayerVisible();
        await strokePerSidePage.clickAddStrokeButton();
        await mainPage.waitForChangeIsSaved();
        await strokePerSidePage.checkStrokeWidth('1');
        await expect(
          strokePerSidePage.strokeColorBullet,
          'Stroke color is visible',
        ).toBeVisible();
        await expect(
          strokePerSidePage.strokeOpacityInput,
          'Stroke opacity is visible',
        ).toBeVisible();
        await expect(
          strokePerSidePage.strokeAlignmentField,
          'Stroke position is visible',
        ).toBeVisible();
        await expect(
          strokePerSidePage.strokeTypeField,
          'Stroke style is visible',
        ).toBeVisible();
        await strokePerSidePage.checkStrokePerSideTooltip();
      },
    );

    await demoAccountFileTest.step(
      'Click "Stroke per side" → the four inputs equal the stroke width and show their tooltips',
      async () => {
        await strokePerSidePage.clickStrokePerSideButton();
        await strokePerSidePage.checkStrokePerSideButtonPressed();
        for (const side of SIDES) {
          await strokePerSidePage.checkStrokeSideTooltip(side);
          await strokePerSidePage.checkStrokeSideWidth(side, '1');
        }
      },
    );

    await demoAccountFileTest.step(
      'Type 2 in Top → Top is 2, the other sides keep 1 and the stroke width shows "Mixed"',
      async () => {
        await strokePerSidePage.setStrokeSideWidth(TOP, '2');
        await mainPage.waitForChangeIsSaved();
        await strokePerSidePage.checkStrokeSideWidth(TOP, '2');
        for (const side of [RIGHT, BOTTOM, LEFT]) {
          await strokePerSidePage.checkStrokeSideWidth(side, '1');
        }
        await strokePerSidePage.isStrokeWidthMixed();
      },
    );

    await demoAccountFileTest.step(
      'Type 4 in Right, 8 in Bottom and 16 in Left → every side keeps its own width',
      async () => {
        const sideWidths: [StrokeSideName, string][] = [
          [RIGHT, '4'],
          [BOTTOM, '8'],
          [LEFT, '16'],
        ];
        for (const [side, width] of sideWidths) {
          await strokePerSidePage.setStrokeSideWidth(side, width);
          await mainPage.waitForChangeIsSaved();
        }
        await strokePerSidePage.isStrokeWidthMixed();
        await mainPage.zoomToFitSelected();
        await mainPage.clickOnESC();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-stroke-sides-2-4-8-16.png',
          { mask: mainPage.maskViewport() },
        );
      },
    );
  },
);

demoAccountFileTest.describe(
  'With a rectangle that already has different stroke widths per side',
  () => {
    demoAccountFileTest.use({ penpotFile: TEST_FILE });

    demoAccountFileTest(
      qase([3812], 'Keep the side values when switching Stroke per side off and on'),
      async () => {
        await demoAccountFileTest.step(
          'Select "Rectangle" and open "Stroke per side" → sides are 2, 4, 8, 16 and stroke width is "Mixed"',
          async () => {
            await layersPanelPage.selectLayerByExactName('Rectangle');
            await strokePerSidePage.clickStrokePerSideButton();
            await strokePerSidePage.checkStrokePerSideButtonPressed();
            await strokePerSidePage.checkStrokeSideWidths(TEST_FILE_WIDTHS);
            await strokePerSidePage.isStrokeWidthMixed();
          },
        );

        await demoAccountFileTest.step(
          'Click "Stroke per side" again → side inputs hide, stroke width stays "Mixed" and the rectangle keeps its widths',
          async () => {
            await strokePerSidePage.clickStrokePerSideButton();
            await strokePerSidePage.checkStrokePerSideButtonPressed(false);
            await strokePerSidePage.areStrokeSideFieldsVisible(false);
            await strokePerSidePage.isStrokeWidthMixed();
          },
        );

        await demoAccountFileTest.step(
          'Click "Stroke per side" again → sides are 2, 4, 8 and 16 again',
          async () => {
            await strokePerSidePage.clickStrokePerSideButton();
            await strokePerSidePage.checkStrokePerSideButtonPressed();
            await strokePerSidePage.checkStrokeSideWidths(TEST_FILE_WIDTHS);
          },
        );

        await demoAccountFileTest.step(
          'Type 5 in every side → stroke width shows 5 and the side inputs stay visible',
          async () => {
            for (const side of SIDES) {
              await strokePerSidePage.setStrokeSideWidth(side, '5');
            }
            await strokePerSidePage.waitForChangeIsSaved();
            await strokePerSidePage.checkStrokeWidth('5');
            await strokePerSidePage.checkStrokePerSideButtonPressed();
            await strokePerSidePage.areStrokeSideFieldsVisible();
            for (const side of SIDES) {
              await strokePerSidePage.checkStrokeSideWidth(side, '5');
            }
          },
        );
      },
    );

    demoAccountFileTest(
      qase([3815], 'Keep the stroke widths per side after reloading the file'),
      async ({ mainPage }) => {
        await demoAccountFileTest.step(
          'Select "Rectangle" and open "Stroke per side" → sides are 2, 4, 8 and 16',
          async () => {
            await layersPanelPage.selectLayerByExactName('Rectangle');
            await strokePerSidePage.clickStrokePerSideButton();
            await strokePerSidePage.checkStrokePerSideButtonPressed();
            await strokePerSidePage.checkStrokeSideWidths(TEST_FILE_WIDTHS);
          },
        );

        await demoAccountFileTest.step(
          'Reload the page (F5) → the file opens again',
          async () => {
            await mainPage.reloadPage();
            await mainPage.isMainPageLoaded();
          },
        );

        await demoAccountFileTest.step(
          'Select "Rectangle" again → button is not pressed, side inputs are hidden and stroke width is "Mixed"',
          async () => {
            await layersPanelPage.selectLayerByExactName('Rectangle');
            await strokePerSidePage.checkStrokePerSideButtonPressed(false);
            await strokePerSidePage.areStrokeSideFieldsVisible(false);
            await strokePerSidePage.isStrokeWidthMixed();
          },
        );

        await demoAccountFileTest.step(
          'Click "Stroke per side" → sides are 2, 4, 8 and 16 again',
          async () => {
            await strokePerSidePage.clickStrokePerSideButton();
            await strokePerSidePage.checkStrokeSideWidths(TEST_FILE_WIDTHS);
          },
        );
      },
    );
  },
);
