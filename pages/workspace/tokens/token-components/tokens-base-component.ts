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
import {
  ShadowTokensComponent,
  ShadowToken,
} from '@pages/workspace/tokens/token-components/shadow-tokens-component';

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
  Shadow = 'Shadow',
}

export interface BasicTokenData {
  name: string;
  description?: string;
}

/**
 * Represents a token group node in the token tree.
 * Extends BasicTokenData so that `name` holds the group path segment (e.g. 'primary').
 * The optional `parent` field models nested group hierarchies and can be left unset
 * when the test only needs to reference a top-level group.
 */
export interface TokenGroupData extends BasicTokenData {
  parent?: TokenGroupData;
}

/**
 * Builds the full dot-separated path for a token or group segment from the provided
 * `name` and the `TokenGroupData` parent chain.
 */
export const buildTokenPath = (name: string, parent?: TokenGroupData): string =>
  parent ? `${buildTokenPath(parent.name, parent.parent)}.${name}` : name;

export class TokensComponent {
  readonly page: Page;
  readonly baseComp: BaseComponent;
  readonly mainTokensComp: MainTokensComponent;
  readonly typoTokensComp: TypographyTokensComponent;
  readonly shadowTokensComp: ShadowTokensComponent;
  readonly tokenSideBar: Locator;
  readonly tokenSections: Locator;
  readonly invalidToken: Locator;
  readonly tokenContextMenu: Locator;
  readonly editTokenMenuItem: Locator;
  readonly tokenDescriptionInput: Locator;
  readonly tokenNameInput: Locator;
  readonly duplicateTokenMenuItem: Locator;
  readonly deleteTokenMenuItem: Locator;
  readonly deleteTokensGroupMenuItem: Locator;
  readonly expandTokensButton: Locator;
  readonly remapTokenModal: Locator;
  readonly remapTokensButton: Locator;
  readonly dontRemapButton: Locator;
  readonly tokenGroupName: Locator;
  readonly tokensPage: TokensPage;
  readonly createTokenModal: Locator;

  constructor(page: Page, tokensPage: TokensPage) {
    this.page = page;
    this.tokensPage = tokensPage;
    this.baseComp = new BaseComponent(page);
    this.typoTokensComp = new TypographyTokensComponent(page);
    this.mainTokensComp = new MainTokensComponent(page, tokensPage);
    this.shadowTokensComp = new ShadowTokensComponent(page);
    this.tokenSideBar = page.getByTestId('tokens-sidebar');
    this.createTokenModal = page.getByTestId('token-update-create-modal');
    this.tokenContextMenu = page.getByTestId('tokens-context-menu-for-token');
    this.tokenSections = this.tokenSideBar.locator('[class*="section-name"]');
    this.invalidToken = page.locator('button[class*="token-pill-invalid-applied"]');
    this.tokenDescriptionInput = page.getByPlaceholder('Description');
    this.tokenNameInput = page.locator('#token-name');
    this.duplicateTokenMenuItem = this.tokenContextMenu
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate  token' });
    this.deleteTokenMenuItem = this.tokenContextMenu
      .getByRole('listitem')
      .filter({ hasText: 'Delete token' });
    this.deleteTokensGroupMenuItem = page
      .getByTestId('tokens-context-menu-for-token-node')
      .getByRole('button', { name: 'Delete', exact: true });
    this.expandTokensButton = this.tokenSideBar
      .locator('[class*="layer-button-wrapper"]')
      .getByRole('button');
    this.editTokenMenuItem = this.tokenContextMenu
      .getByRole('listitem')
      .filter({ hasText: 'Edit token' });

    this.remapTokenModal = page.getByTestId('token-remapping-modal');
    this.remapTokensButton = this.remapTokenModal.getByRole('button', {
      name: 'Remap tokens',
    });
    this.dontRemapButton = this.remapTokenModal.getByRole('button', {
      name: "Don't remap",
    });
    this.tokenGroupName = this.tokenSideBar.locator('[class*="layer-button-name"]');
  }

  getTokenSection(tokenClass: TokenClass): Locator {
    const treeId = `token-tree-${tokenClass.toLowerCase().replace(/\s+/g, '-')}`;
    return this.page
      .locator('[class*="token-section-wrapper"]')
      .filter({ has: this.page.locator(`[aria-controls="${treeId}"]`) });
  }

  private getAddTokenButton(tokenClass: TokenClass): Locator {
    return this.page.getByRole('button', { name: `Add token: ${tokenClass}` });
  }

  private getTokenTreeButton(tokenClass: TokenClass): Locator {
    return this.tokenSideBar.getByRole('button', { name: `${tokenClass}` }).first();
  }

  private async fillTokenData(
    token:
      | TypographyToken<TokenClass>
      | ShadowToken<TokenClass>
      | MainToken<TokenClass>,
  ) {
    await this.tokenNameInput.fill(token.name);

    if (token.description !== undefined) {
      await this.tokenDescriptionInput.fill(token.description);
    }

    if (token.class === TokenClass.Typography) {
      await this.typoTokensComp.fillTokenData(token);
    } else if (token.class === TokenClass.Shadow) {
      await this.shadowTokensComp.fillShadowTokenData(
        token as ShadowToken<TokenClass>,
      );
    } else {
      await this.mainTokensComp.fillTokenData(token);
    }
  }

  async clickOnTokenDescription() {
    await this.tokenDescriptionInput.click();
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
    token:
      | TypographyToken<TokenClass>
      | ShadowToken<TokenClass>
      | MainToken<TokenClass>,
  ) {
    const addTokenButton = this.getAddTokenButton(token.class);
    await addTokenButton.click();
    await this.fillTokenData(token);
  }

  async createTokenViaAddButtonAndSave(
    token:
      | TypographyToken<TokenClass>
      | ShadowToken<TokenClass>
      | MainToken<TokenClass>,
  ) {
    await this.clickOnAddTokenAndFillData(token);
    await this.baseComp.modalSaveButton.click();
  }

  async createTokenViaAddButtonAndEnter(
    token:
      | TypographyToken<TokenClass>
      | ShadowToken<TokenClass>
      | MainToken<TokenClass>,
  ) {
    await this.clickOnAddTokenAndFillData(token);
    await expect(this.baseComp.modalSaveButton).toBeEnabled();
    await this.baseComp.clickOnEnter();
  }

  async isSaveButtonDisabled() {
    await expect(this.baseComp.modalSaveButton).toBeDisabled();
  }

  async isCreateTokenModalClosed() {
    await expect(this.createTokenModal).not.toBeVisible();
  }

  async rightClickOnTokenGroup(group: TokenGroupData) {
    await this.page
      .getByRole('button', { name: group.name, exact: true })
      .click({ button: 'right' });
  }

  async isDeleteGroupMenuItemVisible() {
    await expect(this.deleteTokensGroupMenuItem).toBeVisible();
  }

  async deleteTokenGroup(group: TokenGroupData) {
    await this.rightClickOnTokenGroup(group);
    await this.isDeleteGroupMenuItemVisible();
    await this.deleteTokensGroupMenuItem.click();
  }

  async clickEditToken(
    updatedToken:
      | TypographyToken<TokenClass>
      | ShadowToken<TokenClass>
      | MainToken<TokenClass>,
  ) {
    await this.rightClickOnTokenWithName(updatedToken.name);
    await this.editTokenMenuItem.click();
  }

  async editTokenViaRightClickByName(
    updatedToken:
      | TypographyToken<TokenClass>
      | ShadowToken<TokenClass>
      | MainToken<TokenClass>,
  ) {
    await this.clickEditToken(updatedToken);
    await this.fillTokenData(updatedToken);
  }

  async editTokenViaRightClickAndSave(
    updatedToken:
      | TypographyToken<TokenClass>
      | ShadowToken<TokenClass>
      | MainToken<TokenClass>,
  ) {
    await this.editTokenViaRightClickByName(updatedToken);
    await this.baseComp.modalSaveButton.click();
  }

  async isTokenVisibleWithName(name: string, visible = true) {
    const token = this.page
      .getByRole('button')
      .locator(`span[aria-label="${name}"]`);
    visible
      ? await expect(token).toBeVisible()
      : await expect(token).not.toBeVisible();
  }

  async clickOnTokenWithName(name: string) {
    await this.page
      .getByRole('button')
      .locator(`span[aria-label="${name}"]`)
      .click();
  }

  async isTokenAppliedWithName(name: string, applied = true) {
    const token = this.page.locator(
      `button[class*="token-pill-applied"] span[aria-label="${name}"]`,
    );
    applied
      ? await expect(token).toBeVisible()
      : await expect(token).not.toBeVisible();
  }

  async isTokenDisabledWithName(name: string, disabled = true) {
    const token = this.page.locator(
      `button[class*="token-pill-disabled"] span[aria-label="${name}"]`,
    );
    disabled
      ? await expect(token).toBeVisible()
      : await expect(token).not.toBeVisible();
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
    const item = this.page
      .getByTestId('tokens-context-menu-for-token')
      .getByRole('listitem')
      .locator(`[class*="item-text"]`)
      .filter({ hasText: new RegExp(`^${itemName}$`) });
    visible
      ? await expect(item).toBeVisible()
      : await expect(item).not.toBeVisible();
  }

  async isDeleteTokenMenuItemVisible() {
    await expect(this.deleteTokenMenuItem).toBeVisible();
  }

  async deleteToken(tokenName: string) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.isDeleteTokenMenuItemVisible();
    await this.deleteTokenMenuItem.click();
  }

  async checkAppliedTokenTitle(text: string) {
    const tokenLocator = this.page.locator(`button[class*="token-pill-applied"]`);
    await tokenLocator.hover();
    await expect(tokenLocator).toHaveAttribute('title', text);
  }

  async checkTokenTitle(tokenName: string, text: string) {
    const tokenLocator = this.page.locator(
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

  async expandTokenByName(tokenClass: TokenClass) {
    const tokenTreeButton = this.getTokenTreeButton(tokenClass);
    const isExpanded = await tokenTreeButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await tokenTreeButton.click();
    }
  }

  async isRemapTokenModalVisible() {
    await expect(this.remapTokenModal).toBeVisible();
  }

  async clickRemapTokensButton() {
    await this.remapTokensButton.click();
  }

  async clickDontRemapButton() {
    await this.dontRemapButton.click();
  }

  async isTokenSingleSegment(name: string) {
    const nameWrapper = this.page.getByRole('button', { name }).locator('span');
    await expect(nameWrapper).not.toHaveClass(/divided/);
    await expect(nameWrapper).toHaveText(name);
    await expect(nameWrapper.locator('span')).toHaveCount(0);
  }

  async isTokenGroupVisible(group: TokenGroupData, visible = true) {
    const groupLocator = this.tokenGroupName.filter({
      hasText: new RegExp(`^${group.name}$`),
    });
    visible
      ? await expect(groupLocator).toBeVisible()
      : await expect(groupLocator).not.toBeVisible();
  }

  async isTokenVisibleInGroup(
    group: TokenGroupData,
    tokenName: string,
    visible = true,
  ) {
    const groupButton = this.page.getByRole('button', {
      name: group.name,
      exact: true,
    });
    await expect(groupButton).toHaveAttribute('aria-controls', /.+/);
    const childrenContainerId = await groupButton.getAttribute('aria-controls');
    const token = this.page
      .locator(`[id="${childrenContainerId}"]`)
      .getByRole('button', { name: tokenName });
    visible
      ? await expect(token).toBeVisible()
      : await expect(token).not.toBeVisible();
  }

  async isLastSegmentVisibleInGroup(
    group: TokenGroupData,
    segment: string,
    visible = true,
  ) {
    const groupButton = this.page.getByRole('button', {
      name: group.name,
      exact: true,
    });
    await expect(groupButton).toHaveAttribute('aria-controls', /.+/);
    const childrenContainerId = await groupButton.getAttribute('aria-controls');
    const lastSegment = this.page
      .locator(`[id="${childrenContainerId}"]`)
      .locator('span[class*="last-name-wrapper"]')
      .filter({ hasText: segment });
    visible
      ? await expect(lastSegment).toBeVisible()
      : await expect(lastSegment).not.toBeVisible();
  }

  async isTokenGroupCount(group: TokenGroupData, count: number) {
    await expect(
      this.tokenGroupName.filter({ hasText: new RegExp(`^${group.name}$`) }),
    ).toHaveCount(count);
  }

  async clickOnTokenGroup(group: TokenGroupData) {
    await this.page.getByRole('button', { name: group.name, exact: true }).click();
  }

  async isTokenGroupExpanded(group: TokenGroupData, expanded = true) {
    const groupButton = this.page.getByRole('button', {
      name: group.name,
      exact: true,
    });
    await expect(groupButton).toHaveAttribute(
      'aria-expanded',
      expanded ? 'true' : 'false',
    );
  }

  async renameTokenAndConfirmRemap(
    originalToken: MainToken<TokenClass>,
    newName: string,
  ): Promise<void> {
    await this.expandTokenByName(originalToken.class);
    await this.clickEditToken(originalToken);
    await this.tokenNameInput.fill(newName);
    await this.baseComp.modalSaveButton.click();
    await this.isRemapTokenModalVisible();
    await this.clickRemapTokensButton();
    await this.tokensPage.waitForChangeIsSaved();
    await this.isTokenVisibleWithName(newName);
  }
}
