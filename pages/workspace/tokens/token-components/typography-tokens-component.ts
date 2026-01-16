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
  private readonly useAliasButton: Locator;
  private readonly useCompositeButton: Locator;
  private readonly aliasInput: Locator;
  private readonly aliasInputError: Locator;

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
    this.useAliasButton = this.createTokenModal.getByTestId('reference-opt');
    this.useCompositeButton = this.createTokenModal.getByTestId('composite-opt');
    this.aliasInput = this.createTokenModal.getByRole('textbox', {
      name: 'Reference',
    });
    this.aliasInputError = this.createTokenModal.getByText(
      /^Missing token references:/,
    );
  }

  async clickOnUseReferenceButton() {
    await this.useAliasButton.click();
  }

  async clickOnUseCompositeButton() {
    await this.useCompositeButton.click();
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

  async isAliasInputErrorVisible(boolean = true) {
    return boolean
      ? expect(
          this.aliasInputError,
          'Missing token reference expected, but not found',
        ).toBeVisible()
      : expect(
          this.aliasInputError,
          'Missing token reference not expected, but found',
        ).not.toBeVisible();
  }

  async fillAliasInput(value: string) {
    await this.aliasInput.fill(value);
  }

  async checkTokenFieldHasExpectedValue(fieldName: string, expectedValue: string) {
    const fieldMap: { [key: string]: Locator } = {
      fontFamily: this.fontFamilyInput,
      fontWeight: this.fontWeightInput,
      fontSize: this.fontSizeInput,
      lineHeight: this.lineHeightInput,
      letterSpacing: this.letterSpacingInput,
      textDecoration: this.textDecorationInput,
      textCase: this.textCaseInput,
    };

    const field = fieldMap[fieldName];
    if (!field) {
      throw new Error(`Unknown field name: ${fieldName}`);
    }

    await expect(field).toHaveValue(expectedValue);
  }

  async checkTypographicTokenValues(token: TypographyToken<TokenClass>) {
    if (token.fontFamily !== undefined) {
      await this.checkTokenFieldHasExpectedValue('fontFamily', token.fontFamily);
    }
    if (token.fontWeight !== undefined) {
      await this.checkTokenFieldHasExpectedValue('fontWeight', token.fontWeight);
    }
    if (token.fontSize !== undefined) {
      await this.checkTokenFieldHasExpectedValue('fontSize', token.fontSize);
    }
    if (token.lineHeight !== undefined) {
      await this.checkTokenFieldHasExpectedValue('lineHeight', token.lineHeight);
    }
    if (token.letterSpacing !== undefined) {
      await this.checkTokenFieldHasExpectedValue(
        'letterSpacing',
        token.letterSpacing,
      );
    }
    if (token.textDecoration !== undefined) {
      await this.checkTokenFieldHasExpectedValue(
        'textDecoration',
        token.textDecoration,
      );
    }
    if (token.textCase !== undefined) {
      await this.checkTokenFieldHasExpectedValue('textCase', token.textCase);
    }
  }
}

export default TypographyTokensComponent;
