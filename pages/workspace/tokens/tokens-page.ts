import { type Locator, type Page, expect } from '@playwright/test';
import { MainPage } from '../main-page';
import { SetsComponent } from './sets-component';
import { ThemesComponent } from './themes-component';
import { TokensComponent } from './tokens-component';
import { ToolsComponent } from './tools-component';

export type TokenType = {
  name: string;
  description?: string;
};
export class TokensPage extends MainPage {
  // components
  readonly setsComp: SetsComponent;
  readonly themesComp: ThemesComponent;
  readonly tokensComp: TokensComponent;
  readonly toolsComp: ToolsComponent;

  // locators
  readonly tokensTab: Locator;
  constructor(page: Page) {
    super(page);

    // components
    this.setsComp = new SetsComponent(page);
    this.themesComp = new ThemesComponent(page);
    this.tokensComp = new TokensComponent(page, this);
    this.toolsComp = new ToolsComponent(page);

    // locators
    this.tokensTab = page.getByRole('tab', { name: 'Tokens' });
  }

  async clickTokensTab() {
    await this.tokensTab.click();
  }
}
