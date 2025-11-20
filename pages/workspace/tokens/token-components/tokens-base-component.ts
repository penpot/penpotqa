import { type Locator, type Page, expect } from '@playwright/test';
import { BaseComponent } from '@pages/base-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import {
  MainToken,
  MainTokensComponent,
} from '@pages/workspace/tokens/token-components/main-tokens-component';
import {
  TypographyTokensComponent,
  TypographyToken,
} from '@pages/workspace/tokens/token-components/typography-tokens-component';

export enum TokenClass {
  Color = 'Color',
  BorderRadius = 'Border Radius',
  Dimension = 'Dimensions',
  FontFamily = 'Font Family',
  FontSize = 'Font Size',
  FontWeight = 'Font Weight',
  LetterSpacing = 'Letter Spacing',
  Number = 'Number',
  Opacity = 'Opacity',
  Rotation = 'Rotation',
  Sizing = 'Sizing',
  Spacing = 'Spacing',
  StrokeWidth = 'Stroke Width',
  TextCase = 'Text Case',
  TextDecoration = 'Text Decoration',
  Typography = 'Typography',
}

export interface BasicTokenData {
  name: string;
  description?: string;
}

export class TokensComponent {
  readonly page: Page;
  readonly baseComp: BaseComponent;
  readonly mainTokensComp: MainTokensComponent;
  readonly typoTokensComp: TypographyTokensComponent;

  constructor(page: Page, tokensPage: TokensPage) {
    this.page = page;
    this.baseComp = new BaseComponent(page);
    this.typoTokensComp = new TypographyTokensComponent(page);
    this.mainTokensComp = new MainTokensComponent(page, tokensPage);
  }

  private async getAddTokenButton(tokenClass: TokenClass): Promise<Locator> {
    return this.page.getByRole('button', { name: `Add token: ${tokenClass}` });
  }

  private async createTokenViaAddButton(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    const addTokenButton = await this.getAddTokenButton(token.class);
    await addTokenButton.click();
    await this.mainTokensComp.tokenNameInput.fill(token.name);
    await this.mainTokensComp.tokenDescriptionInput.fill(token.description ?? '');

    if (token.class === TokenClass.Typography) {
      await this.typoTokensComp.fillTokenData(token);
    } else {
      await this.mainTokensComp.fillTokenData(token);
    }
  }

  async createTokenViaAddButtonAndSave(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.createTokenViaAddButton(token);
    await this.baseComp.modalSaveButton.click();
  }

  async createTokenViaAddButtonAndEnter(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.createTokenViaAddButton(token);
    await expect(this.baseComp.modalSaveButton).toBeEnabled();
    await this.baseComp.clickOnEnter();
  }
}
