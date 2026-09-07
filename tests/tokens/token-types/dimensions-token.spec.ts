import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  await mainPage.clickMoveButton();
});
