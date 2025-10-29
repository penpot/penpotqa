const { expect } = require('@playwright/test');
const { TokensPanelPage } = require('./tokens-panel-page');

exports.TypographyTokensComponent = class TypographyTokensComponent extends (
  TokensPanelPage
) {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Tokens locators
    this.addTypographyTokenButton = page.getByRole('button', {
      name: 'Add token: Typography',
    });
    this.tokenFamilyInput = page.getByRole('textbox', { name: 'Font family' });
  }

  async addNewTypoToken(tokenName, fontFamily) {
    await this.addTypographyTokenButton.click();
    // TODO: Implement the rest of the method to add a new typography token
    await this.tokenNameInput.fill(tokenName);
    if (fontFamily !== undefined) {
      await this.tokenFamilyInput.fill(fontFamily);
    }
    await this.modalSaveButton.click();
  }
};
