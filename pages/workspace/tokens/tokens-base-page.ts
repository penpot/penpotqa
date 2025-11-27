import { type Locator, type Page, expect } from '@playwright/test';
import { MainPage } from '@pages/workspace/main-page';
import { SetsComponent } from '@pages/workspace/tokens/sets-component';
import { ThemesComponent } from '@pages/workspace/tokens/themes-component';
import { ToolsComponent } from '@pages/workspace/tokens/tools-component';
import { TokensComponent } from './token-components/tokens-base-component';
import { MainTokensComponent } from './token-components/main-tokens-component';
import { TypographyTokensComponent } from './token-components/typography-tokens-component';

export interface BasicTokenData {
  name: string;
  description?: string;
}

export class TokensPage extends MainPage {
  // components
  readonly setsComp: SetsComponent;
  readonly themesComp: ThemesComponent;
  readonly toolsComp: ToolsComponent;
  readonly tokensComp: TokensComponent;
  readonly typoTokensComp: TypographyTokensComponent;
  readonly mainTokensComp: MainTokensComponent;

  // locators
  readonly tokensTab: Locator;

  constructor(page: Page) {
    super(page);

    // components
    this.setsComp = new SetsComponent(page);
    this.themesComp = new ThemesComponent(page);
    this.toolsComp = new ToolsComponent(page);
    this.tokensComp = new TokensComponent(page, this);
    this.typoTokensComp = new TypographyTokensComponent(page);
    this.mainTokensComp = new MainTokensComponent(page, this);

    // locators
    this.tokensTab = page.getByRole('tab', { name: 'Tokens' });
  }

  async clickTokensTab() {
    await this.tokensTab.click();
  }
}
