import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { LayerSearchComponent } from '@pages/workspace/left-sidebar/layer-search-component';
import { ScrollableListComponent } from '@pages/workspace/left-sidebar/scrollable-list-component';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

// 80 layers ("Layer 01" to "Layer 80"), 80 components and 150 color tokens.
const TEST_FILE = 'documents/sidebar_scroll_tabs.penpot';
const LAYER_SEARCH_TEXT = 'Layer';

let assetsList: ScrollableListComponent;
let assetsPanelPage: AssetsPanelPage;
let layerSearch: LayerSearchComponent;
let layerTree: ScrollableListComponent;
let layersPanelPage: LayersPanelPage;
let tokensList: ScrollableListComponent;
let tokensPage: TokensPage;

demoAccountFileTest.use({ penpotFile: TEST_FILE });

demoAccountFileTest.beforeEach(async ({ page }) => {
  assetsList = ScrollableListComponent.assets(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layerSearch = new LayerSearchComponent(page);
  layerTree = ScrollableListComponent.layerTree(page);
  layersPanelPage = new LayersPanelPage(page);
  tokensList = ScrollableListComponent.tokens(page);
  tokensPage = new TokensPage(page);
});

demoAccountFileTest(
  qase(
    [3796],
    'Keep the scroll position of each left sidebar tab when switching tabs',
  ),
  async () => {
    let layersScroll: number;
    let assetsScroll: number;
    let tokensScroll: number;

    await demoAccountFileTest.step(
      'Scroll the layer tree of the Layers tab',
      async () => {
        layersScroll = await layerTree.scrollToMiddle();
      },
    );

    await demoAccountFileTest.step(
      'Scroll the components list of the Assets tab',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        assetsScroll = await assetsList.scrollToMiddle();
      },
    );

    await demoAccountFileTest.step(
      'Check the Tokens tab is shown from the top',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensList.checkScrolledToTop();
      },
    );

    await demoAccountFileTest.step(
      'Check the Layers tab keeps its scroll position',
      async () => {
        await layersPanelPage.openLayersTab();
        await layerTree.checkScrollTop(layersScroll);
      },
    );

    await demoAccountFileTest.step(
      'Check the Assets tab keeps its scroll position',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsList.checkScrollTop(assetsScroll);
      },
    );

    await demoAccountFileTest.step(
      `Expand the "${TokenClass.Color}" token group and scroll the tokens list`,
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        tokensScroll = await tokensList.scrollToMiddle();
      },
    );

    await demoAccountFileTest.step(
      'Switch tabs and check each one keeps its own scroll position',
      async () => {
        for (let round = 0; round < 2; round++) {
          await layersPanelPage.openLayersTab();
          await layerTree.checkScrollTop(layersScroll);
          await assetsPanelPage.clickAssetsTab();
          await assetsList.checkScrollTop(assetsScroll);
          await tokensPage.clickTokensTab();
          await tokensList.checkScrollTop(tokensScroll);
        }
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [3798],
    'Keep the scroll position of the layer search results when switching tabs',
  ),
  async () => {
    let treeScroll: number;
    let resultsScroll: number;

    await demoAccountFileTest.step(
      'Scroll the layer tree of the Layers tab',
      async () => {
        treeScroll = await layerTree.scrollToMiddle();
      },
    );

    await demoAccountFileTest.step(
      `Search the layers by "${LAYER_SEARCH_TEXT}" and scroll the results`,
      async () => {
        await layerSearch.openLayerSearchBar();
        await layerSearch.searchLayer(LAYER_SEARCH_TEXT);
        resultsScroll = await layerTree.scrollToMiddle();
      },
    );

    await demoAccountFileTest.step(
      'Switch to the Assets tab and back, and check the results keep their scroll',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await layersPanelPage.openLayersTab();
        await expect(
          layerSearch.searchInput,
          'Layer search should still be applied',
        ).toHaveValue(LAYER_SEARCH_TEXT);
        await layerTree.checkScrollTop(resultsScroll);
      },
    );

    await demoAccountFileTest.step(
      'Close the search and check the layer tree keeps its scroll',
      async () => {
        await layerSearch.closeLayerSearch();
        await layerTree.checkScrollTop(treeScroll);
      },
    );
  },
);
