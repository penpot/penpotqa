import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let tokensPage: TokensPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  layersPanelPage = new LayersPanelPage(page);

  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
  await tokensPage.toolsComp.importTokens('documents/tokens-for-each-category.json');
  await tokensPage.setsComp.isSetNameVisible('Global');
  await tokensPage.tokensComp.expandAllTokens();
});

mainAccountFileTest(
  qase([2374], 'Rectangle: Check active tokens in token list'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create rectangle and verify active/disabled tokens',
      async () => {
        await tokensPage.createDefaultRectangleByCoordinates(100, 200);
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'BORDER-RADIUS-1',
          false,
        );
        await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
        await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'STROKE-WIDTH-10',
          false,
        );
      },
    );

    await mainAccountFileTest.step(
      'Verify Fill and Stroke menu items are visible for COLOR-1',
      async () => {
        await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Fill');
        await layersPanelPage.openLayersTab();
        await mainPage.clickOnLayerOnCanvas();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Stroke');
      },
    );
  },
);

mainAccountFileTest(
  qase([2382], 'Text layer: Check active tokens in token list'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create text layer and verify active/disabled tokens',
      async () => {
        await tokensPage.createDefaultTextLayerByCoordinates(100, 200);
        await tokensPage.tokensComp.isTokenDisabledWithName('BORDER-RADIUS-1', true);
        await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'STROKE-WIDTH-10',
          false,
        );
      },
    );

    await mainAccountFileTest.step(
      'Verify Fill and Stroke menu items are visible for COLOR-1',
      async () => {
        await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Fill');
        await layersPanelPage.openLayersTab();
        await mainPage.clickOnLayerOnCanvas();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Stroke');
      },
    );
  },
);

mainAccountFileTest(
  qase([2383], 'Board (in root): Check active tokens in token list'),
  async () => {
    await mainAccountFileTest.step(
      'Create board and verify active/disabled tokens',
      async () => {
        await tokensPage.createDefaultBoardByCoordinates(100, 200);
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'BORDER-RADIUS-1',
          false,
        );
        await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
        await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'STROKE-WIDTH-10',
          false,
        );
      },
    );
  },
);

mainAccountFileTest(
  qase([2385], 'Path: Check active tokens in token list'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create path and verify active/disabled tokens',
      async () => {
        await mainPage.createDefaultOpenPath();
        await tokensPage.tokensComp.isTokenDisabledWithName('BORDER-RADIUS-1', true);
        await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
        await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'STROKE-WIDTH-10',
          false,
        );
      },
    );
  },
);

mainAccountFileTest(
  qase([2386], 'Image: Check active tokens in token list'),
  async () => {
    await mainAccountFileTest.step(
      'Upload image and verify active/disabled tokens',
      async () => {
        await tokensPage.uploadImage('images/images.png');
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'BORDER-RADIUS-1',
          false,
        );
        await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
        await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
        await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
        await tokensPage.tokensComp.isTokenDisabledWithName(
          'STROKE-WIDTH-10',
          false,
        );
      },
    );
  },
);
