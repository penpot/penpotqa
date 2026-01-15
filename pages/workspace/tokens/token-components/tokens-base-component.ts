import { type Locator, type Page, expect } from '@playwright/test';
import { BaseComponent } from '@pages/base-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import {
  MainToken,
  MainTokensComponent,
} from '@pages/workspace/tokens/token-components/main-tokens-component';
import {
  TypographyTokensComponent,
  TypographyToken,
} from '@pages/workspace/tokens/token-components/typography-tokens-component';

export enum TokenClass {
  Color = 'Color',
  BorderRadius = 'Border Radius',
  Dimension = 'Dimensions',
  FontFamily = 'Font Family',
  FontSize = 'Font Size',
  FontWeight = 'Font Weight',
  LetterSpacing = 'Letter Spacing',
  Number = 'Number',
  Opacity = 'Opacity',
  Rotation = 'Rotation',
  Sizing = 'Sizing',
  Spacing = 'Spacing',
  StrokeWidth = 'Stroke Width',
  TextCase = 'Text Case',
  TextDecoration = 'Text Decoration',
  Typography = 'Typography',
}

export interface BasicTokenData {
  name: string;
  description?: string;
}

export class TokensComponent {
  readonly page: Page;
  readonly baseComp: BaseComponent;
  readonly mainTokensComp: MainTokensComponent;
  readonly typoTokensComp: TypographyTokensComponent;

  readonly tokenSideBar: Locator;
  readonly tokenSections: Locator;
  readonly invalidToken: Locator;
  readonly editTokenMenuItem: Locator;
  readonly tokenDescriptionInput: Locator;
  readonly tokenNameInput: Locator;
  readonly duplicateTokenMenuItem: Locator;
  readonly deleteTokenMenuItem: Locator;
  readonly expandTokensButton: Locator;

  constructor(page: Page, tokensPage: TokensPage) {
    this.page = page;
    this.baseComp = new BaseComponent(page);
    this.typoTokensComp = new TypographyTokensComponent(page);
    this.mainTokensComp = new MainTokensComponent(page, tokensPage);

    this.tokenSideBar = page.getByTestId('tokens-sidebar');
    this.tokenSections = this.tokenSideBar.locator('[class*="section-name"]');
    this.invalidToken = page.locator('button[class*="token-pill-invalid-applied"]');
    this.tokenDescriptionInput = page.getByPlaceholder('Description');
    this.tokenNameInput = page.locator('#token-name');
    this.duplicateTokenMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate  token' });
    this.deleteTokenMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete token' });

    this.expandTokensButton = this.tokenSideBar
      .locator('[class*="title_bar__title-wrapper"]')
      .getByRole('button');

    this.editTokenMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Edit token' });
  }

  private async getAddTokenButton(tokenClass: TokenClass): Promise<Locator> {
    return this.page.getByRole('button', { name: `Add token: ${tokenClass}` });
  }

  private async fillTokenData(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.tokenNameInput.fill(token.name);

    if (token.description !== undefined) {
      await this.tokenDescriptionInput.fill(token.description);
    }

    if (token.class === TokenClass.Typography) {
      await this.typoTokensComp.fillTokenData(token);
    } else {
      await this.mainTokensComp.fillTokenData(token);
    }
  }

  async clickOnTokenDescription() {
    await this.tokenDescriptionInput.click;
  }

  async enterTokenDescription(text: string) {
    await this.tokenDescriptionInput.fill(text);
  }

  async rightClickOnTokenWithName(name: string) {
    await this.page
      .getByRole('button')
      .locator(`span[aria-label="${name}"]`)
      .click({ button: 'right', force: true });
  }

  async clickOnAddTokenAndFillData(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    const addTokenButton = await this.getAddTokenButton(token.class);
    await addTokenButton.click();
    await this.fillTokenData(token);
  }

  async createTokenViaAddButtonAndSave(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.clickOnAddTokenAndFillData(token);
    await this.baseComp.modalSaveButton.click();
  }

  async createTokenViaAddButtonAndEnter(
    token: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.clickOnAddTokenAndFillData(token);
    await expect(this.baseComp.modalSaveButton).toBeEnabled();
    await this.baseComp.clickOnEnter();
  }

  async editTokenViaRightClickByName(
    updatedToken: TypographyToken<TokenClass> | MainToken<TokenClass>,
  ) {
    await this.rightClickOnTokenWithName(updatedToken.name);
    await this.editTokenMenuItem.click();
    await this.fillTokenData(updatedToken);
  }

  async editTokenViaRightClickAndSave(
    updatedToken: TypographyToken<TokenClass> | MainToken<TokenClass>,
    mainPage?: any,
  ) {
    await this.editTokenViaRightClickByName(updatedToken);
    await this.baseComp.modalSaveButton.click();
    if (mainPage) {
      await mainPage.waitForChangeIsSaved();
    }
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

  async checkTokenField(
    fieldName: string,
    expectedValue: string,
    tokenClass: TokenClass,
  ) {
    let field;
    if (tokenClass === TokenClass.Typography) {
      field = this.typoTokensComp.getFieldLocator(fieldName);
    } else {
      field = this.mainTokensComp.getFieldLocator(fieldName);
    }

    if (!field) {
      throw new Error(
        `Unknown field name: ${fieldName} for token class: ${tokenClass}`,
      );
    }

    await expect(field).toHaveValue(expectedValue);
  }
}
