import { type Locator, type Page, expect } from '@playwright/test';
import { TokenType } from './tokens-page';

export interface TypographyToken extends TokenType {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textDecoration: string;
  textCase: string;
}

export class TypographyTokensComponent {
  private readonly page: Page;
  private readonly tokenUpdateCreateModal: Locator;
  private readonly tokenFamilyInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // typography tokens locators
    this.tokenUpdateCreateModal = this.page.getByTestId('token-update-create-modal');

    this.tokenFamilyInput = this.tokenUpdateCreateModal.getByRole('textbox', {
      name: 'Font family',
    });
  }

  async fillTypographyDetails(tokenName: string, fontFamily: string) {
    // TODO: Implement the rest of the method to add a new typography token
    if (fontFamily !== undefined) {
      await this.tokenFamilyInput.fill(fontFamily);
    }
  }
}

export default TypographyTokensComponent;
