import { type Locator, type Page, expect } from '@playwright/test';
import { SampleData } from 'helpers/sample-data';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import {
  TokenClass,
  BasicTokenData,
} from '@pages/workspace/tokens/token-components/tokens-base-component';

export interface MainToken<TokenClass> extends BasicTokenData {
  class: TokenClass;
  value?: string;
}

const sampleData = new SampleData();

export class MainTokensComponent {
  readonly page: Page;
  readonly tokensPage: TokensPage;

  // locators
  readonly addRadiusTokenButton: Locator;
  readonly addColorTokenButton: Locator;
  readonly addDimensionsTokenButton: Locator;
  readonly addOpacityTokenButton: Locator;
  readonly addRotationTokenButton: Locator;
  readonly addSizingTokenButton: Locator;
  readonly addSpacingTokenButton: Locator;
  readonly addStrokeWidthTokenButton: Locator;
  readonly addFontSizeTokenButton: Locator;
  readonly addFontFamilyTokenButton: Locator;
  readonly addFontWeightTokenButton: Locator;
  readonly addLetterSpacingTokenButton: Locator;
  readonly addNumberTokenButton: Locator;
  readonly addTextCaseTokenButton: Locator;
  readonly addTextDecorationTokenButton: Locator;
  readonly tokenValueInput: Locator;

  constructor(page: Page, tokensPage: TokensPage) {
    this.page = page;
    this.tokensPage = tokensPage;

    // Tokens locators
    this.tokenValueInput = page.getByPlaceholder('{alias}');

    this.addRadiusTokenButton = page.getByRole('button', {
      name: 'Add token: Border Radius',
    });
    this.addColorTokenButton = page.getByRole('button', {
      name: 'Add token: Color',
    });
    this.addDimensionsTokenButton = page.getByRole('button', {
      name: 'Add token: Dimensions',
    });
    this.addOpacityTokenButton = page.getByRole('button', {
      name: 'Add token: Opacity',
    });
    this.addRotationTokenButton = page.getByRole('button', {
      name: 'Add token: Rotation',
    });
    this.addSizingTokenButton = page.getByRole('button', {
      name: 'Add token: Sizing',
    });
    this.addSpacingTokenButton = page.getByRole('button', {
      name: 'Add token: Spacing',
    });
    this.addStrokeWidthTokenButton = page.getByRole('button', {
      name: 'Add token: Stroke Width',
    });
    this.addFontSizeTokenButton = page.getByRole('button', {
      name: 'Add token: Font Size',
    });
    this.addFontFamilyTokenButton = page.getByRole('button', {
      name: 'Add token: Font Family',
    });
    this.addFontWeightTokenButton = page.getByRole('button', {
      name: 'Add token: Font Weight',
    });
    this.addLetterSpacingTokenButton = page.getByRole('button', {
      name: 'Add token: Letter Spacing',
    });
    this.addNumberTokenButton = page.getByRole('button', {
      name: 'Add token: Number',
    });
    this.addTextCaseTokenButton = page.getByRole('button', {
      name: 'Add token: Text Case',
    });
    this.addTextDecorationTokenButton = page.getByRole('button', {
      name: 'Add token: Text Decoration',
    });
  }

  async fillTokenData(mainToken: MainToken<TokenClass>) {
    if (mainToken.value !== undefined) {
      await this.tokenValueInput.fill(mainToken.value);
    }
  }

  async enterTokenValue(value: string) {
    await this.tokenValueInput.fill(value);
  }
}
