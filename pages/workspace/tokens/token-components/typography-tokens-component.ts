import { type Locator, type Page, expect } from '@playwright/test';
import {
  TokenClass,
  BasicTokenData,
} from '@pages/workspace/tokens/token-components/tokens-base-component';
import { TokenReferenceFieldComponent } from '@pages/workspace/tokens/token-components/token-reference-field-component';
import { TokenValueOptionsComponent } from '@pages/workspace/tokens/token-components/token-value-options-component';

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
  readonly valueOptions: TokenValueOptionsComponent;
  readonly referenceField: TokenReferenceFieldComponent;

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
    this.valueOptions = new TokenValueOptionsComponent(page, this.createTokenModal);
    this.referenceField = new TokenReferenceFieldComponent(
      page,
      this.createTokenModal,
    );
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

  async checkTokenFieldHasExpectedValue(
    typographyToken: TypographyToken<TokenClass>,
  ) {
    if (typographyToken.fontFamily !== undefined) {
      await expect(this.fontFamilyInput).toHaveValue(typographyToken.fontFamily);
    }
    if (typographyToken.fontWeight !== undefined) {
      await expect(this.fontWeightInput).toHaveValue(typographyToken.fontWeight);
    }
    if (typographyToken.fontSize !== undefined) {
      await expect(this.fontSizeInput).toHaveValue(typographyToken.fontSize);
    }
    if (typographyToken.lineHeight !== undefined) {
      await expect(this.lineHeightInput).toHaveValue(typographyToken.lineHeight);
    }
    if (typographyToken.letterSpacing !== undefined) {
      await expect(this.letterSpacingInput).toHaveValue(
        typographyToken.letterSpacing,
      );
    }
    if (typographyToken.textDecoration !== undefined) {
      await expect(this.textDecorationInput).toHaveValue(
        typographyToken.textDecoration,
      );
    }
    if (typographyToken.textCase !== undefined) {
      await expect(this.textCaseInput).toHaveValue(typographyToken.textCase);
    }
  }
}

export default TypographyTokensComponent;
