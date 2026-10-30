import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import {
  STROKE_WIDTH,
  type StrokeSectionComponent,
  StrokeSide,
  type StrokeSideName,
  type StrokeWidthFieldName,
} from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const TEST_FILE = 'documents/tokens/stroke-per-side-test-file.penpot';
const { Top: TOP, Right: RIGHT, Bottom: BOTTOM, Left: LEFT } = StrokeSide;
const SIDES: StrokeSideName[] = Object.values(StrokeSide);
const WIDTH_FIELDS: StrokeWidthFieldName[] = [STROKE_WIDTH, ...SIDES];
const TEST_FILE_WIDTHS: Record<StrokeSideName, string> = {
  [TOP]: '2',
  [RIGHT]: '4',
  [BOTTOM]: '8',
  [LEFT]: '16',
};

let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let strokeSection: StrokeSectionComponent;
let tokensPage: TokensPage;

demoAccountFileTest.use({ penpotFile: TEST_FILE });

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  strokeSection = new WorkspacePage(page).rightSidebar.design.stroke;
  tokensPage = new TokensPage(page);
});

demoAccountFileTest(
  qase(
    [3822],
    'Apply a stroke width token to all sides of a rectangle with different widths per side',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Select "Rectangle" and click "Stroke per side" → sides are 2, 4, 8, 16 and stroke width is "Mixed"',
      async () => {
        await layersPanelPage.selectLayerByExactName('Rectangle');
        await strokeSection.clickStrokePerSideButton();
        await strokeSection.checkStrokeSideWidths(TEST_FILE_WIDTHS);
        await strokeSection.checkStrokeWidthIsMixed();
      },
    );

    await demoAccountFileTest.step(
      'Click the "sw-3" token → stroke width and all four sides show the "sw-3" pill',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandAllTokens();
        await tokensPage.tokensComp.clickOnTokenWithName('sw-3');
        await mainPage.waitForChangeIsSaved();
        for (const label of WIDTH_FIELDS) {
          await strokeSection.checkStrokeWidthTokenPillIsVisible(label, 'sw-3');
        }
      },
    );

    await demoAccountFileTest.step(
      'Detach the token from Left → Left shows 3 and stroke width is "Mixed"',
      async () => {
        await strokeSection.detachStrokeWidthToken(LEFT);
        await strokeSection.checkStrokeSideWidth(LEFT, '3');
        await strokeSection.checkStrokeWidthIsMixed();
      },
    );

    await demoAccountFileTest.step(
      'Type 7 in Left → Left is 7 and the other sides keep the "sw-3" pill',
      async () => {
        await strokeSection.setStrokeSideWidth(LEFT, '7');
        await mainPage.waitForChangeIsSaved();
        await strokeSection.checkStrokeSideWidth(LEFT, '7');
        for (const label of [TOP, RIGHT, BOTTOM]) {
          await strokeSection.checkStrokeWidthTokenPillIsVisible(label, 'sw-3');
        }
      },
    );

    await demoAccountFileTest.step(
      'The viewport draws "Rectangle" with 3 on top, right and bottom, and 7 on the left',
      async () => {
        await mainPage.clickOnESC();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-stroke-sides-3-3-3-7.png',
          { mask: mainPage.maskViewport() },
        );
      },
    );
  },
);

demoAccountFileTest(
  qase([3823], 'Apply a stroke width token to one side from the Tokens tab'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Select "Tokens board" and right-click the "sw-10" token → Stroke Width sides and token actions are listed',
      async () => {
        await layersPanelPage.selectLayerByExactName('Tokens board');
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandAllTokens();
        await tokensPage.tokensComp.rightClickOnTokenWithName('sw-10');
        await tokensPage.tokensComp.areContextMenuItemsVisible([
          'Stroke Width',
          'All',
          'Left',
          'Right',
          'Top',
          'Bottom',
          'Edit token',
          'Duplicate token',
          'Copy token path',
          'Delete token',
        ]);
      },
    );

    await demoAccountFileTest.step(
      'Click "Top" → only Top uses "sw-10", the other sides keep "sw-3" and stroke width is "Mixed"',
      async () => {
        await tokensPage.tokensComp.selectMenuItem('sw-10', 'Top');
        await mainPage.waitForChangeIsSaved();
        await strokeSection.clickStrokePerSideButton();
        await strokeSection.checkStrokeWidthTokenPillIsVisible(TOP, 'sw-10');
        for (const label of [RIGHT, BOTTOM, LEFT]) {
          await strokeSection.checkStrokeWidthTokenPillIsVisible(label, 'sw-3');
        }
        await strokeSection.checkStrokeWidthIsMixed();
      },
    );

    await demoAccountFileTest.step(
      'Hide and show the side inputs → stroke width stays "Mixed" and the side tokens are kept',
      async () => {
        await strokeSection.clickStrokePerSideButton();
        await strokeSection.checkStrokeSideFieldsAreVisible(false);
        await strokeSection.checkStrokeWidthIsMixed();
        await strokeSection.clickStrokePerSideButton();
        await strokeSection.checkStrokeWidthTokenPillIsVisible(TOP, 'sw-10');
        for (const label of [RIGHT, BOTTOM, LEFT]) {
          await strokeSection.checkStrokeWidthTokenPillIsVisible(label, 'sw-3');
        }
      },
    );

    await demoAccountFileTest.step(
      'The viewport draws "Tokens board" with 10 on top and 3 on the other sides',
      async () => {
        await mainPage.clickOnESC();
        await expect(mainPage.viewport).toHaveScreenshot(
          'tokens-board-stroke-top-10.png',
          { mask: mainPage.maskViewport() },
        );
      },
    );
  },
);
