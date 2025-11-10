import { type Locator, type Page, expect } from '@playwright/test';
import { BaseComponent } from '@pages/base-component';
import { MainPage } from '@pages/workspace/main-page';
import { SetsComponent } from '@pages/workspace/tokens/sets-component';
import { ThemesComponent } from '@pages/workspace/tokens/themes-component';
import { ToolsComponent } from '@pages/workspace/tokens/tools-component';
import {
  TokensComponent,
  TokenClass,
  MainToken,
} from '@pages/workspace/tokens/tokens-component';
import {
  TypographyToken as TypographyToken,
  TypographyTokensComponent,
} from '@pages/workspace/tokens/typography-tokens-component';

export interface BasicTokenData {
  name: string;
  description?: string;
}

export class TokensPage extends MainPage {
  // components
  readonly basePageComponent: BaseComponent;
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
    this.basePageComponent = new BaseComponent(page);
    this.setsComp = new SetsComponent(page);
    this.themesComp = new ThemesComponent(page);
    this.tokensComp = new TokensComponent(page, this);
    this.toolsComp = new ToolsComponent(page);
    this.typoTokensComp = new TypographyTokensComponent(page);

    // locators
    this.tokensTab = page.getByRole('tab', { name: 'Tokens' });
  }

  async clickTokensTab() {
    await this.tokensTab.click();
  }

  private async getAddTokenButton(tokenClass: TokenClass): Promise<Locator> {
    return this.page.getByRole('button', { name: `Add token: ${tokenClass}` });
  }

  private async createTokenViaAddButton(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    const addTokenButton = await this.getAddTokenButton(token.class);
    await addTokenButton.click();
    await this.tokensComp.tokenNameInput.fill(token.name);
    await this.tokensComp.tokenDescriptionInput.fill(token.description ?? '');

    if (token.class === TokenClass.Typography) {
      await this.typoTokensComp.fillTokenData(token);
    } else {
      await this.tokensComp.fillTokenData(token);
    }
  }

  public async createTokenViaAddButtonAndSave(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.createTokenViaAddButton(token);
    await this.basePageComponent.modalSaveButton.click();
  }

  public async createTokenViaAddButtonAndEnter(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.createTokenViaAddButton(token);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.clickOnEnter();
  }
}
