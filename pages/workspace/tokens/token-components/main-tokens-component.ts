import { type Locator, type Page, expect } from '@playwright/test';
import { SampleData } from 'helpers/sample-data';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import {
  TokenClass,
  BasicTokenData,
  TokenGroupData,
} from '@pages/workspace/tokens/token-components/tokens-base-component';

export interface MainToken<TokenClass> extends BasicTokenData {
  class: TokenClass;
  value?: string;
  parent?: TokenGroupData;
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
  readonly valueDropdownButton: Locator;
  readonly valueDropdownList: Locator;
  readonly createTokenModal: Locator;

  constructor(page: Page, tokensPage: TokensPage) {
    this.page = page;
    this.tokensPage = tokensPage;

    // Tokens locators
    this.createTokenModal = page.getByTestId('token-update-create-modal');
    this.tokenValueInput = this.createTokenModal.getByPlaceholder('{alias}');
    this.valueDropdownButton = this.createTokenModal.getByRole('button', {
      name: 'Open token list',
    });
    // the dropdown list is portaled outside the create/edit modal
    this.valueDropdownList = page.getByRole('listbox');

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
      await this.tokenValueInput.clear();
      await this.tokenValueInput.fill(mainToken.value);
    }
  }

  async enterTokenValue(value: string) {
    await this.tokenValueInput.fill(value);
  }

  getValueDropdownOption(tokenName: string): Locator {
    return this.valueDropdownList.getByRole('option', { name: tokenName });
  }

  async openValueDropdown() {
    await this.valueDropdownButton.click();
  }

  async checkValueDropdownListVisible(visible = true) {
    visible
      ? await expect(
          this.valueDropdownList,
          `Value dropdown list is visible`,
        ).toBeVisible()
      : await expect(
          this.valueDropdownList,
          `Value dropdown list is not visible`,
        ).not.toBeVisible();
  }

  async checkValueDropdownOptionVisible(tokenName: string, visible = true) {
    const option = this.getValueDropdownOption(tokenName);
    visible
      ? await expect(
          option,
          `Dropdown option "${tokenName}" is visible`,
        ).toBeVisible()
      : await expect(
          option,
          `Dropdown option "${tokenName}" is not visible`,
        ).not.toBeVisible();
  }

  async checkTokenValueInputText(value: string) {
    await expect(
      this.tokenValueInput,
      `Value input contains text "${value}"`,
    ).toHaveValue(value);
  }

  async checkResolvedValueText(text: string) {
    await expect(
      this.createTokenModal.getByText(text, { exact: true }),
      `Resolved value hint shows "${text}"`,
    ).toBeVisible();
  }
}
