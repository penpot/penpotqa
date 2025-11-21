import { type Locator, type Page, expect } from '@playwright/test';
import {
  TokenClass,
  BasicTokenData,
} from '@pages/workspace/tokens/token-components/tokens-base-component';

export interface TypographyToken<TokenClass> extends BasicTokenData {
  class: TokenClass;
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textDecoration?: string;
  textCase?: string;
}

export class TypographyTokensComponent {
  private readonly page: Page;
  private readonly createTokenModal: Locator;
  private readonly fontFamilyInput: Locator;
  private readonly fontWeightInput: Locator;
  private readonly fontSizeInput: Locator;
  private readonly lineHeightInput: Locator;
  private readonly letterSpacingInput: Locator;
  private readonly textDecorationInput: Locator;
  private readonly textCaseInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // main component locators
    this.createTokenModal = this.page.getByTestId('token-update-create-modal');
    // create token modal locators
    this.fontFamilyInput = this.createTokenModal.getByRole('textbox', {
      name: 'Font family',
    });
    this.fontWeightInput = this.createTokenModal.getByRole('textbox', {
      name: 'Font weight',
    });
    this.fontSizeInput = this.createTokenModal.getByRole('textbox', {
      name: 'Font size',
    });
    this.lineHeightInput = this.createTokenModal.getByRole('textbox', {
      name: 'Line height',
    });
    this.letterSpacingInput = this.createTokenModal.getByRole('textbox', {
      name: 'Letter spacing',
    });
    this.textDecorationInput = this.createTokenModal.getByRole('textbox', {
      name: 'Text decoration',
    });
    this.textCaseInput = this.createTokenModal.getByRole('textbox', {
      name: 'Text case',
    });
  }

  async fillTokenData(typographyToken: TypographyToken<TokenClass>) {
    if (typographyToken.fontFamily !== undefined) {
      await this.fontFamilyInput.fill(typographyToken.fontFamily);
    }
    if (typographyToken.fontWeight !== undefined) {
      await this.fontWeightInput.fill(typographyToken.fontWeight);
    }
    if (typographyToken.fontSize !== undefined) {
      await this.fontSizeInput.fill(typographyToken.fontSize);
    }
    if (typographyToken.lineHeight !== undefined) {
      await this.lineHeightInput.fill(typographyToken.lineHeight);
    }
    if (typographyToken.letterSpacing !== undefined) {
      await this.letterSpacingInput.fill(typographyToken.letterSpacing);
    }
    if (typographyToken.textDecoration !== undefined) {
      await this.textDecorationInput.fill(typographyToken.textDecoration);
    }
    if (typographyToken.textCase !== undefined) {
      await this.textCaseInput.fill(typographyToken.textCase);
    }
  }
}

export default TypographyTokensComponent;
