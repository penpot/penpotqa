import { type Locator, type Page, expect } from '@playwright/test';
import { MainPage } from '../main-page';
import { SetsComponent } from './sets-component';
import { ThemesComponent } from './themes-component';
import { TokensComponent } from './tokens-component';
import { ToolsComponent } from './tools-component';
import { TypographyTokensComponent } from './typography-tokens-component';

export type TokenType = {
  name: string;
  description?: string;
};
export class TokensPage extends MainPage {
  // components
  readonly setsComp: SetsComponent;
  readonly themesComp: ThemesComponent;
  readonly tokensComp: TokensComponent;
  readonly typoTokensComp: TypographyTokensComponent;
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
    this.typoTokensComp = new TypographyTokensComponent(page);

    // locators
    this.tokensTab = page.getByRole('tab', { name: 'Tokens' });
  }

  private async clickTokensTab() {
    await this.tokensTab.click();
  }

  private async getAddTokenButton(tokenType: string): Promise<Locator> {
    return this.page.getByRole('button', { name: `Add token: ${tokenType}` });
  }

  public async addToken(tokenType: string, tokenName: string) {
    await this.tokensComp.tokenNameInput.fill(tokenName);
    if (tokenType === 'Typography') {
      await this.getAddTokenButton(tokenType);
      await this.typoTokensComp.fillTypographyDetails(
        'My Typography Token',
        'Arial',
      );
    }
    await this.modalSaveButton.click();
  }
}
