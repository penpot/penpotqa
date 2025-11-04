import { type Locator, type Page, expect } from '@playwright/test';
import { TokensPage } from './tokens-page';
import { TypographyTokensComponent } from './typography-tokens-component';

export type TokenType = {
  name: string;
  description?: string;
};

export class TokensComponent {
  readonly page: Page;
  readonly tokensPage: TokensPage;
  readonly typoTokensComp: TypographyTokensComponent;

  // locators
  readonly tokenSideBar: Locator;
  readonly tokenSections: Locator;
  readonly invalidToken: Locator;
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
  readonly tokenNameInput: Locator;
  readonly tokenValueInput: Locator;
  readonly tokenDescriptionInput: Locator;
  readonly editTokenMenuItem: Locator;
  readonly duplicateTokenMenuItem: Locator;
  readonly deleteTokenMenuItem: Locator;
  readonly expandTokensButton: Locator;

  constructor(page: Page, tokensPage: TokensPage) {
    this.page = page;
    this.tokensPage = tokensPage;
    this.typoTokensComp = new TypographyTokensComponent(page);

    this.tokenSideBar = page.getByTestId('tokens-sidebar');

    // Tokens locators
    this.tokenSections = this.tokenSideBar.locator('[class*="section-name"]');
    this.invalidToken = page.locator('button[class*="token-pill-invalid-applied"]');

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

    this.tokenNameInput = page.locator('#token-name');
    this.tokenValueInput = page.locator('div[class*="input_tokens_value"] input');
    this.tokenDescriptionInput = page.getByPlaceholder('Description');

    this.editTokenMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Edit token' });
    this.duplicateTokenMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate  token' });
    this.deleteTokenMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete token' });

    this.expandTokensButton = this.tokenSideBar
      .locator('[class*="title_bar__title-wrapper"]')
      .getByRole('button');
  }

  async createRadiusToken(name: string = 'global.radius', value: string = '-1') {
    await this.addRadiusTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async createColorToken(name: string = 'global.color', value: string = '#ff0000') {
    await this.addColorTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.tokensPage.modalSaveButton).toBeEnabled();
    await this.tokensPage.clickOnEnter();
  }

  async createOpacityToken(name: string = 'global.opacity', value: string = '0.7') {
    await this.addOpacityTokenButton.click();
    await expect(this.tokensPage.modalSaveButton).toBeDisabled();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.tokensPage.modalSaveButton).toBeEnabled();
    await this.tokensPage.clickOnEnter();
  }

  async createRotationToken(name = 'global.rotation', value = '-45') {
    await this.addRotationTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.tokensPage.modalSaveButton).toBeEnabled();
    await this.tokensPage.clickOnEnter();
  }

  async createSizingToken(name = 'global.sizing', value = '200') {
    await this.addSizingTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.tokensPage.modalSaveButton).toBeEnabled();
    await this.tokensPage.clickOnEnter();
  }

  async createSpacingToken(name = 'global.spacing', value = '20') {
    await this.addSpacingTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.tokensPage.modalSaveButton).toBeEnabled();
    await this.tokensPage.clickOnEnter();
  }

  async createStrokeWidthToken(name = 'global.stroke', value = '5.5') {
    await this.addStrokeWidthTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.tokensPage.modalSaveButton).toBeEnabled();
    await this.tokensPage.clickOnEnter();
  }

  async createDimensionToken(name = 'global.dimension', value = '100') {
    await this.addDimensionsTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.tokensPage.modalSaveButton).toBeEnabled();
    await this.tokensPage.modalSaveButton.click();
  }

  async createFontSizeToken(name = 'global.font', value = '25') {
    await this.addFontSizeTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async createFontFamilyToken(name = 'global.font.family', value = 'Actor') {
    await this.addFontFamilyTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async createFontWeightToken(name = 'global.font.weight', value = '400') {
    await this.addFontWeightTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async createLetterSpacingToken(name = 'global.letter.spacing', value = '10') {
    await this.addLetterSpacingTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async createNumberToken(name = 'global.number', value = '10') {
    await this.addNumberTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async createTextCaseToken(name = 'global.text.case', value = 'Capitalize') {
    await this.addTextCaseTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async createTextDecorationToken(
    name = 'global.text.decoration',
    value = 'underline',
  ) {
    await this.addTextDecorationTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.tokensPage.modalSaveButton.click();
  }

  async isTokenVisibleWithName(name: string, visible = true) {
    visible
      ? await expect(
          this.page.getByRole('button').locator(`span[aria-label="${name}"]`),
        ).toBeVisible()
      : await expect(
          this.page.getByRole('button').locator(`span[aria-label="${name}"]`),
        ).not.toBeVisible();
  }

  async clickOnTokenWithName(name: string) {
    await this.page
      .getByRole('button')
      .locator(`span[aria-label="${name}"]`)
      .click();
  }

  async rightClickOnTokenWithName(name: string) {
    await this.page
      .getByRole('button')
      .locator(`span[aria-label="${name}"]`)
      .click({ button: 'right', force: true });
  }

  async isTokenAppliedWithName(name: string, applied = true) {
    applied
      ? await expect(
          this.page.locator(
            `button[class*="token-pill-applied"] span[aria-label="${name}"]`,
          ),
        ).toBeVisible()
      : await expect(
          this.page.locator(
            `button[class*="token-pill-applied"] span[aria-label="${name}"]`,
          ),
        ).not.toBeVisible();
  }

  async isTokenDisabledWithName(name: string, disabled = true) {
    disabled
      ? await expect(
          this.page.locator(
            `button[class*="token-pill-disabled"] span[aria-label="${name}"]`,
          ),
        ).toBeVisible()
      : await expect(
          this.page.locator(
            `button[class*="token-pill-disabled"] span[aria-label="${name}"]`,
          ),
        ).not.toBeVisible();
  }

  async isMenuItemWithNameSelected(tokenName: string, itemName: string) {
    await this.rightClickOnTokenWithName(tokenName);
    await expect(
      this.page.locator('[class*="menu-item-selected"]', {
        hasText: new RegExp(`^${itemName}$`),
      }),
    ).toBeVisible();
  }

  async isSubMenuItemWithNameSelected(
    tokenName: string,
    subMenuName: string,
    itemName: string,
  ) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.page.getByRole('listitem').filter({ hasText: subMenuName }).hover();
    await expect(
      this.page.locator('[class*="menu-item-selected"]', { hasText: itemName }),
    ).toBeVisible();
  }

  async isAllMenuItemWithSectionNameSelected(
    tokenName: string,
    sectionName: string,
  ) {
    await this.rightClickOnTokenWithName(tokenName);
    await expect(
      this.page.locator('[class*="menu-item-selected"]:has-text("All")', {
        hasText: sectionName,
      }),
    ).toBeVisible();
  }

  async isAllSubMenuItemWithSectionNameSelected(
    tokenName: string,
    subMenuName: string,
    sectionName: string,
  ) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.page.getByRole('listitem').filter({ hasText: subMenuName }).hover();
    await expect(
      this.page.locator('[class*="menu-item-selected"]:has-text("All")', {
        hasText: sectionName,
      }),
    ).toBeVisible();
  }

  async isMenuItemVisible(tokenName: string, itemName: string, visible = true) {
    await this.rightClickOnTokenWithName(tokenName);
    const item = await this.page
      .getByTestId('tokens-context-menu-for-token')
      .getByRole('listitem')
      .locator(`[class*="item-text"]`)
      .filter({ hasText: new RegExp(`^${itemName}$`) });
    visible
      ? await expect(item).toBeVisible()
      : await expect(item).not.toBeVisible();
  }

  async openEditTokenWindow(tokenName: string) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.editTokenMenuItem.click();
  }

  async enterTokenValue(value: string) {
    await this.tokenValueInput.fill(value);
  }

  async enterTokenDescription(text: string) {
    await this.tokenDescriptionInput.fill(text);
  }

  async editToken(
    tokenName: string,
    newValue: string,
    newDescription = 'Description',
  ) {
    await this.openEditTokenWindow(tokenName);
    await this.enterTokenValue(newValue);
    await this.enterTokenDescription(newDescription);
    await this.tokensPage.modalSaveButton.click();
  }

  async deleteToken(tokenName: string) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.deleteTokenMenuItem.click();
  }

  async checkAppliedTokenTitle(text: string) {
    const tokenLocator = await this.page.locator(
      `button[class*="token-pill-applied"]`,
    );
    await tokenLocator.hover();
    await expect(tokenLocator).toHaveAttribute('title', text);
  }

  async checkTokenTitle(tokenName: string, text: string) {
    const tokenLocator = await this.page.locator(
      `button:has(span[aria-label="${tokenName}"])`,
    );
    await tokenLocator.hover();
    await expect(tokenLocator).toHaveAttribute('title', text);
  }

  async selectMenuItem(tokenName: string, itemName: string) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.page
      .getByTestId('tokens-context-menu-for-token')
      .getByRole('listitem')
      .filter({ hasText: new RegExp(`^${itemName}$`) })
      .click();
  }

  async expandSectionByName(name: string) {
    await this.tokenSections.filter({ hasText: name }).click();
  }

  async checkInvalidTokenCount(count: number) {
    await expect(this.invalidToken).toHaveCount(count);
  }

  async expandAllTokens() {
    const count = await this.expandTokensButton.count();
    for (let i = 0; i < count; i++) {
      await this.expandTokensButton.nth(count - 1 - i).click();
    }
  }
}
