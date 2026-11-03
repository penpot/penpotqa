import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import {
  type StrokeSectionComponent,
  StrokeSide,
  type StrokeSideName,
} from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
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
let designPanelPage: DesignPanelPage;
let strokeSection: StrokeSectionComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  strokeSection = new WorkspacePage(page).rightSidebar.design.stroke;
});

demoAccountFileTest(
  qase([3808], 'Set a different stroke width on each side of a rectangle'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Create a rectangle, add a stroke and check the row and the "Stroke per side" tooltip',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.isCreatedLayerVisible();
        await designPanelPage.clickAddStrokeButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkStrokeWidth('1');
        await strokeSection.checkStrokeRowFieldsAreVisible();
        await strokeSection.checkStrokePerSideTooltip();
      },
    );

    await demoAccountFileTest.step(
      'Click "Stroke per side" → the four inputs equal the stroke width and show their tooltips',
      async () => {
        await strokeSection.clickStrokePerSideButton();
        await strokeSection.checkStrokePerSideButtonPressed();
        for (const side of SIDES) {
          await strokeSection.checkStrokeSideTooltip(side);
          await strokeSection.checkStrokeSideWidth(side, '1');
        }
      },
    );

    await demoAccountFileTest.step(
      'Type 2 in Top → Top is 2, the other sides keep 1 and the stroke width shows "Mixed"',
      async () => {
        await strokeSection.setStrokeSideWidth(TOP, '2');
        await mainPage.waitForChangeIsSaved();
        await strokeSection.checkStrokeSideWidth(TOP, '2');
        for (const side of [RIGHT, BOTTOM, LEFT]) {
          await strokeSection.checkStrokeSideWidth(side, '1');
        }
        await strokeSection.checkStrokeWidthIsMixed();
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
          await strokeSection.setStrokeSideWidth(side, width);
          await mainPage.waitForChangeIsSaved();
        }
        await strokeSection.checkStrokeWidthIsMixed();
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
            await strokeSection.clickStrokePerSideButton();
            await strokeSection.checkStrokePerSideButtonPressed();
            await strokeSection.checkStrokeSideWidths(TEST_FILE_WIDTHS);
            await strokeSection.checkStrokeWidthIsMixed();
          },
        );

        await demoAccountFileTest.step(
          'Click "Stroke per side" again → side inputs hide, stroke width stays "Mixed" and the rectangle keeps its widths',
          async () => {
            await strokeSection.clickStrokePerSideButton();
            await strokeSection.checkStrokePerSideButtonPressed(false);
            await strokeSection.checkStrokeSideFieldsAreVisible(false);
            await strokeSection.checkStrokeWidthIsMixed();
          },
        );

        await demoAccountFileTest.step(
          'Click "Stroke per side" again → sides are 2, 4, 8 and 16 again',
          async () => {
            await strokeSection.clickStrokePerSideButton();
            await strokeSection.checkStrokePerSideButtonPressed();
            await strokeSection.checkStrokeSideWidths(TEST_FILE_WIDTHS);
          },
        );

        await demoAccountFileTest.step(
          'Type 5 in every side → stroke width shows 5 and the side inputs stay visible',
          async () => {
            for (const side of SIDES) {
              await strokeSection.setStrokeSideWidth(side, '5');
            }
            await designPanelPage.waitForChangeIsSaved();
            await designPanelPage.checkStrokeWidth('5');
            await strokeSection.checkStrokePerSideButtonPressed();
            await strokeSection.checkStrokeSideFieldsAreVisible();
            for (const side of SIDES) {
              await strokeSection.checkStrokeSideWidth(side, '5');
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
            await strokeSection.clickStrokePerSideButton();
            await strokeSection.checkStrokePerSideButtonPressed();
            await strokeSection.checkStrokeSideWidths(TEST_FILE_WIDTHS);
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
            await strokeSection.checkStrokePerSideButtonPressed(false);
            await strokeSection.checkStrokeSideFieldsAreVisible(false);
            await strokeSection.checkStrokeWidthIsMixed();
          },
        );

        await demoAccountFileTest.step(
          'Click "Stroke per side" → sides are 2, 4, 8 and 16 again',
          async () => {
            await strokeSection.clickStrokePerSideButton();
            await strokeSection.checkStrokeSideWidths(TEST_FILE_WIDTHS);
          },
        );
      },
    );
  },
);
