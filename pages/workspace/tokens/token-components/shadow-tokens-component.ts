import { type Locator, type Page, expect } from '@playwright/test';
import {
  TokenClass,
  BasicTokenData,
} from '@pages/workspace/tokens/token-components/tokens-base-component';

/**
 * Represents a single shadow entry
 */
export interface SingleShadow {
  shadowType?: string;
  xOffset?: string;
  yOffset?: string;
  blurRadius?: string;
  spreadRadius?: string;
  color?: string;
}

/**
 * Shadow token supporting one or more shadows
 */
export interface ShadowToken<TokenClass> extends BasicTokenData {
  class: TokenClass.Shadow;
  shadows: SingleShadow[];
}

export class ShadowTokensComponent {
  private readonly page: Page;
  private readonly createTokenModal: Locator;
  private readonly shadowSelectDropdown: Locator;
  private readonly addShadowButton: Locator;
  private readonly useAliasButton: Locator;
  private readonly aliasInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createTokenModal = this.page.getByTestId('token-update-create-modal');
    this.shadowSelectDropdown = this.createTokenModal.getByRole('combobox');
    this.addShadowButton = this.createTokenModal.getByRole('button', {
      name: 'Add Shadow',
    });
    this.useAliasButton = this.createTokenModal.getByTestId('reference-opt');
    this.aliasInput = this.createTokenModal.getByRole('textbox', {
      name: 'Reference',
    });
  }

  /**
   * Returns the shadow container by index.
   * Defaults to index 0 if not provided.
   */
  private getShadowContainer(index: number = 0): Locator {
    return this.createTokenModal.getByTestId(`shadow-input-fields-${index}`);
  }

  private getXOffsetInput(index?: number): Locator {
    return this.getShadowContainer(index).getByRole('textbox', { name: 'X' });
  }

  private getYOffsetInput(index?: number): Locator {
    return this.getShadowContainer(index).getByRole('textbox', { name: 'Y' });
  }

  private getBlurRadiusInput(index?: number): Locator {
    return this.getShadowContainer(index).getByRole('textbox', { name: 'Blur' });
  }

  private getSpreadRadiusInput(index?: number): Locator {
    return this.getShadowContainer(index).getByRole('textbox', { name: 'Spread' });
  }

  private getColorInput(index?: number): Locator {
    return this.getShadowContainer(index).getByRole('textbox', { name: 'Color' });
  }

  private async getShadowTokenTypeOption(shadowType: string): Promise<Locator> {
    return this.createTokenModal.getByRole('option', { name: shadowType });
  }

  private async getCurrentShadowType(): Promise<string> {
    return (await this.createTokenModal.textContent()) ?? 'drop shadow';
  }

  async selectShadowType(shadowType: string) {
    const currentShadow = await this.getCurrentShadowType();

    // Only select if different
    if (currentShadow.toLowerCase() === shadowType.toLowerCase()) {
      return;
    }

    await this.shadowSelectDropdown.click();
    const option = await this.getShadowTokenTypeOption(shadowType);
    await option.click();
  }

  /**
   * Fills data for a single shadow (scoped by index)
   */
  private async fillSingleShadow(shadow: SingleShadow, index?: number) {
    if (shadow.color !== undefined) {
      await this.getColorInput(index).fill(shadow.color);
    }
    if (shadow.shadowType !== undefined) {
      await this.selectShadowType(shadow.shadowType);
    }
    if (shadow.xOffset !== undefined) {
      await this.getXOffsetInput(index).fill(shadow.xOffset);
    }
    if (shadow.yOffset !== undefined) {
      await this.getYOffsetInput(index).fill(shadow.yOffset);
    }
    if (shadow.blurRadius !== undefined) {
      await this.getBlurRadiusInput(index).fill(shadow.blurRadius);
    }
    if (shadow.spreadRadius !== undefined) {
      await this.getSpreadRadiusInput(index).fill(shadow.spreadRadius);
    }
  }

  /**
   * Fills token data for one or multiple shadows
   */
  async fillTokenData(shadowToken: ShadowToken<TokenClass>) {
    for (let i = 0; i < shadowToken.shadows.length; i++) {
      if (i > 0) {
        await this.addShadowButton.click();
      }

      await this.fillSingleShadow(shadowToken.shadows[i], i);
    }
  }

  async removeShadow(index: number) {
    const container = this.getShadowContainer(index);
    const removeButton = container.getByRole('button', { name: 'Remove Shadow' });
    await removeButton.click();
  }

  async clickOnUseReferenceButton() {
    await this.useAliasButton.click();
  }

  async fillAliasInput(value: string) {
    await this.aliasInput.fill(value);
  }
}

export default ShadowTokensComponent;
