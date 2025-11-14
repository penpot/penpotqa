import { type Locator, type Page, expect } from '@playwright/test';
import { TokenClass } from './tokens-component';
import { BasicTokenData } from './tokens-page';

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
    await this.fontFamilyInput.fill(typographyToken.fontFamily ?? '');
    await this.fontWeightInput.fill(typographyToken.fontWeight ?? '');
    await this.fontSizeInput.fill(typographyToken.fontSize ?? '');
    await this.lineHeightInput.fill(typographyToken.lineHeight ?? '');
    await this.letterSpacingInput.fill(typographyToken.letterSpacing ?? '');
    await this.textDecorationInput.fill(typographyToken.textDecoration ?? '');
    await this.textCaseInput.fill(typographyToken.textCase ?? '');
  }
}

export default TypographyTokensComponent;
