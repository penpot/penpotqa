import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountApiFixture } from 'fixtures';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';

const TEST_FILE = 'documents/tokens/stroke-per-side-test-file.penpot';
const STROKE_WIDTH = 'Stroke width';
const TOP = 'Top (block start)';
const RIGHT = 'Right (inline end)';
const BOTTOM = 'Bottom (block end)';
const LEFT = 'Left (inline start)';
const SIDES = [TOP, RIGHT, BOTTOM, LEFT];

let mainPage: MainPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let tokensPage: TokensPage;

demoAccountApiFixture.beforeEach(
  'Import and open the stroke per side test file',
  async ({ page }) => {
    mainPage = new MainPage(page);
    layersPanelPage = new LayersPanelPage(page);
    designPanelPage = new DesignPanelPage(page);
    tokensPage = new TokensPage(page);

    await new DashboardPage(page).importAndOpenFile(TEST_FILE);
    await mainPage.isMainPageLoaded();
  },
);

demoAccountApiFixture(
  qase(
    [3822],
    'Apply a stroke width token to all sides of a rectangle with different widths per side',
  ),
  async () => {
    await demoAccountApiFixture.step(
      'Select "Rectangle" and click "Stroke per side" → sides are 2, 4, 8, 16 and stroke width is "Mixed"',
      async () => {
        await layersPanelPage.selectLayerByExactName('Rectangle');
        await designPanelPage.clickStrokePerSideButton();
        await designPanelPage.checkStrokeSideWidth(TOP, '2');
        await designPanelPage.checkStrokeSideWidth(RIGHT, '4');
        await designPanelPage.checkStrokeSideWidth(BOTTOM, '8');
        await designPanelPage.checkStrokeSideWidth(LEFT, '16');
        await designPanelPage.isStrokeWidthMixed();
      },
    );

    await demoAccountApiFixture.step(
      'Click the "sw-3" token → stroke width and all four sides show the "sw-3" pill',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandAllTokens();
        await tokensPage.tokensComp.clickOnTokenWithName('sw-3');
        await mainPage.waitForChangeIsSaved();
        for (const label of [STROKE_WIDTH, ...SIDES]) {
          await designPanelPage.isStrokeWidthTokenPillVisible(label, 'sw-3');
        }
      },
    );

    await demoAccountApiFixture.step(
      'Detach the token from Left → Left shows 3 and stroke width is "Mixed"',
      async () => {
        await designPanelPage.detachStrokeWidthToken(LEFT);
        await designPanelPage.checkStrokeSideWidth(LEFT, '3');
        await designPanelPage.isStrokeWidthMixed();
      },
    );

    await demoAccountApiFixture.step(
      'Type 7 in Left → Left is 7 and the other sides keep the "sw-3" pill',
      async () => {
        await designPanelPage.setStrokeSideWidth(LEFT, '7');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkStrokeSideWidth(LEFT, '7');
        for (const label of [TOP, RIGHT, BOTTOM]) {
          await designPanelPage.isStrokeWidthTokenPillVisible(label, 'sw-3');
        }
      },
    );

    await demoAccountApiFixture.step(
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

demoAccountApiFixture(
  qase([3823], 'Apply a stroke width token to one side from the Tokens tab'),
  async () => {
    await demoAccountApiFixture.step(
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

    await demoAccountApiFixture.step(
      'Click "Top" → only Top uses "sw-10", the other sides keep "sw-3" and stroke width is "Mixed"',
      async () => {
        await tokensPage.tokensComp.selectMenuItem('sw-10', 'Top');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickStrokePerSideButton();
        await designPanelPage.isStrokeWidthTokenPillVisible(TOP, 'sw-10');
        for (const label of [RIGHT, BOTTOM, LEFT]) {
          await designPanelPage.isStrokeWidthTokenPillVisible(label, 'sw-3');
        }
        await designPanelPage.isStrokeWidthMixed();
      },
    );

    await demoAccountApiFixture.step(
      'Hide and show the side inputs → stroke width stays "Mixed" and the side tokens are kept',
      async () => {
        await designPanelPage.clickStrokePerSideButton();
        await designPanelPage.areStrokeSideFieldsVisible(false);
        await designPanelPage.isStrokeWidthMixed();
        await designPanelPage.clickStrokePerSideButton();
        await designPanelPage.isStrokeWidthTokenPillVisible(TOP, 'sw-10');
        for (const label of [RIGHT, BOTTOM, LEFT]) {
          await designPanelPage.isStrokeWidthTokenPillVisible(label, 'sw-3');
        }
      },
    );

    await demoAccountApiFixture.step(
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
