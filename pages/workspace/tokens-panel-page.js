const { expect } = require('@playwright/test');
const { MainPage } = require('./main-page');

exports.TokensPanelPage = class TokensPanelPage extends MainPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.tokensTab = page.getByRole('tab', { name: 'tokens' });
    this.setsList = page.locator('[class*="tokens_sets__sets-list"]');
    this.createOneSetButton = page
      .locator('[class*="tokens_sets__empty-sets"]')
      .getByText('Create one.');
    this.createSetButton = page.getByRole('button', { name: 'Add set' });
    this.setsNameInput = page.getByPlaceholder("Enter name (use '/' for groups)");
    this.setName = page.getByTestId('tokens-set-item');
    this.groupSetName = page.getByTestId('tokens-set-group-item');

    this.createOneThemeButton = page
      .locator('[class*="empty-theme-wrapper"]')
      .getByText('Create one.');
    this.addNewThemeButton = page.getByRole('button', { name: 'Add new theme' });
    this.themeNameInput = page.getByPlaceholder('Add a theme (i.e. Light)');
    this.groupThemeNameInput = page.getByPlaceholder('Add group (i.e. Mode)');
    this.themesDropdown = page.getByTestId('theme-select');
    this.backToThemeListButton = page.getByRole('button', {
      name: 'Back to theme list',
    });

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

    this.tokenToolsButton = page.getByRole('button', { name: 'Tools' });
    this.importButton = page.getByRole('menuitem', { name: 'Import' });
    this.chooseFileButton = page.getByRole('button', { name: 'Choose file' });
    this.chooseFolderButton = page.getByRole('button', { name: 'Choose folder' });
    this.exportButton = page.getByRole('menuitem', { name: 'Export' });
    this.multipleFilesButton = page.getByRole('tab', { name: 'Multiple files' });
    this.exportTokensMessage = page.locator(
      '[class*="tokens_modals_export__disabled-message"]',
    );
    this.confirmExportButton = page.getByRole('button', { name: 'Export' });
    this.exportFileItem = page.locator('[class*="export__file-name"]');
  }

  async clickTokensTab() {
    await this.tokensTab.click();
  }

  async createSetViaLink(name) {
    await this.createOneSetButton.click();
    await this.setsNameInput.fill(name);
    await this.clickOnEnter();
  }

  async createSetViaButton(name) {
    await this.createSetButton.click();
    await this.setsNameInput.fill(name);
    await this.clickOnEnter();
  }

  async checkFirstSetName(text) {
    await expect(this.setName.first()).toHaveText(text);
  }

  async isSetNameVisible(text) {
    await expect(this.setName.filter({ hasText: text })).toHaveCount(1);
  }

  async isGroupSetNameVisible(text) {
    await expect(this.groupSetName.filter({ hasText: text })).toHaveCount(1);
  }

  async clickOnSetCheckboxByName(setName) {
    await this.setName.filter({ hasText: setName }).getByRole('checkbox').click();
  }

  async rightClickOnSetByName(setName) {
    await this.setName.filter({ hasText: setName }).click({ button: 'right' });
  }

  async isSetCheckedByName(setName) {
    await expect(
      this.setName.filter({ hasText: setName }).getByRole('checkbox'),
    ).toBeChecked();
  }

  async createThemeViaLinkWithSet(name, setName) {
    await this.createOneThemeButton.click();
    await this.themeNameInput.fill(name);
    await this.activateSetInTheme(setName);
    await this.modalSaveButton.click();
    await this.modalCloseButton.last().click();
  }

  async createThemeViaLink(name) {
    await this.createOneThemeButton.click();
    await this.themeNameInput.fill(name);
    await this.modalSaveButton.click();
    await this.modalCloseButton.last().click();
  }

  async createThemeViaLinkWithGroup(groupName, themeName) {
    await this.createOneThemeButton.click();
    await this.groupThemeNameInput.fill(groupName);
    await this.themeNameInput.fill(themeName);
    await this.modalSaveButton.click();
  }

  async addNewThemeWithGroup(groupName, themeName) {
    await this.addNewThemeButton.click();
    await this.groupThemeNameInput.fill(groupName);
    await this.themeNameInput.fill(themeName);
    await this.modalSaveButton.click();
  }

  async addNewTheme(themeName) {
    await this.addNewThemeButton.click();
    await this.themeNameInput.fill(themeName);
    await this.modalSaveButton.click();
  }

  async createRadiusToken(name = 'global.radius', value = '-1') {
    await this.addRadiusTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await this.modalSaveButton.click();
  }

  async createColorToken(name = 'global.color', value = '#ff0000') {
    await this.addColorTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.clickOnEnter();
  }

  async createOpacityToken(name = 'global.opacity', value = '0.7') {
    await this.addOpacityTokenButton.click();
    await expect(this.modalSaveButton).toBeDisabled();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.clickOnEnter();
  }

  async createRotationToken(name = 'global.rotation', value = '-45') {
    await this.addRotationTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.clickOnEnter();
  }

  async createSizingToken(name = 'global.sizing', value = '200') {
    await this.addSizingTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.clickOnEnter();
  }

  async createSpacingToken(name = 'global.spacing', value = '20') {
    await this.addSpacingTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.clickOnEnter();
  }

  async createStrokeWidthToken(name = 'global.stroke', value = '5.5') {
    await this.addStrokeWidthTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.clickOnEnter();
  }

  async createDimensionToken(name = 'global.dimension', value = '100') {
    await this.addDimensionsTokenButton.click();
    await this.tokenNameInput.fill(name);
    await this.tokenValueInput.fill(value);
    await expect(this.modalSaveButton).toBeEnabled();
    await this.modalSaveButton.click();
  }

  async isTokenVisibleWithName(name, visible = true) {
    visible
      ? await expect(
          this.page.getByRole('button').locator(`span[aria-label="${name}"]`),
        ).toBeVisible()
      : await expect(
          this.page.getByRole('button').locator(`span[aria-label="${name}"]`),
        ).not.toBeVisible();
  }

  async clickOnTokenWithName(name) {
    await this.page
      .getByRole('button')
      .locator(`span[aria-label="${name}"]`)
      .click();
  }

  async rightClickOnTokenWithName(name) {
    await this.page
      .getByRole('button')
      .locator(`span[aria-label="${name}"]`)
      .click({ button: 'right', force: true });
  }

  async isTokenAppliedWithName(name, applied = true) {
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

  async isMenuItemWithNameSelected(tokenName, itemName) {
    await this.rightClickOnTokenWithName(tokenName);
    await expect(
      this.page.locator('[class*="menu-item-selected"]', {
        hasText: new RegExp(`^${itemName}$`),
      }),
    ).toBeVisible();
  }

  async isSubMenuItemWithNameSelected(tokenName, subMenuName, itemName) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.page.getByRole('listitem').filter({ hasText: subMenuName }).hover();
    await expect(
      this.page.locator('[class*="menu-item-selected"]', { hasText: itemName }),
    ).toBeVisible();
  }

  async isAllMenuItemWithSectionNameSelected(tokenName, sectionName) {
    await this.rightClickOnTokenWithName(tokenName);
    await expect(
      this.page.locator('[class*="menu-item-selected"]:has-text("All")', {
        hasText: sectionName,
      }),
    ).toBeVisible();
  }

  async isAllSubMenuItemWithSectionNameSelected(
    tokenName,
    subMenuName,
    sectionName,
  ) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.page.getByRole('listitem').filter({ hasText: subMenuName }).hover();
    await expect(
      this.page.locator('[class*="menu-item-selected"]:has-text("All")', {
        hasText: sectionName,
      }),
    ).toBeVisible();
  }

  async openEditTokenWindow(tokenName) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.editTokenMenuItem.click();
  }

  async enterTokenValue(value) {
    await this.tokenValueInput.fill(value);
  }

  async enterTokenDescription(text) {
    await this.tokenDescriptionInput.fill(text);
  }

  async editToken(tokenName, newValue, newDescription) {
    await this.openEditTokenWindow(tokenName);
    await this.enterTokenValue(newValue);
    await this.enterTokenDescription(newDescription);
    await this.modalSaveButton.click();
  }

  async deleteToken(tokenName) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.deleteTokenMenuItem.click();
  }

  async checkAppliedTokenTitle(text) {
    const tokenLocator = await this.page.locator(
      `button[class*="token-pill-applied"]`,
    );
    await tokenLocator.hover();
    await expect(tokenLocator).toHaveAttribute('title', text);
  }

  async selectMenuItem(tokenName, itemName) {
    await this.rightClickOnTokenWithName(tokenName);
    await this.page
      .getByTestId('tokens-context-menu-for-token')
      .getByRole('listitem')
      .filter({ hasText: new RegExp(`^${itemName}$`) })
      .click();
  }

  async checkSelectedTheme(themeName) {
    await expect(this.themesDropdown.filter({ hasText: themeName })).toBeVisible();
  }

  async selectTheme(themeName) {
    await this.themesDropdown.click();
    await this.page.getByRole('option').filter({ hasText: themeName }).click();
  }

  async openEditThemeModalByThemeName(name) {
    const themeRow = await this.page.getByTitle(name).locator('//../..');
    await themeRow.getByTitle('Edit theme and manage sets').click();
  }

  async activateSetInTheme(name) {
    await this.page
      .getByTestId('token-theme-update-create-modal')
      .getByRole('button', { name: name })
      .click();
  }

  async backToThemeList() {
    await this.backToThemeListButton.click();
  }

  async saveTheme() {
    await this.modalSaveButton.click();
  }

  async checkActiveSetsCountByThemeName(name, count) {
    const themeRow = await this.page.getByTitle(name).locator('//../..');
    await expect(themeRow.getByTitle('Edit theme and manage sets')).toHaveText(
      `${count} active sets`,
    );
  }

  async clickOnTokenToolsButton() {
    await this.tokenToolsButton.click();
  }

  async importTokens(file) {
    await this.importButton.click();
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.chooseFileButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }

  async importTokensFolder(file) {
    await this.importButton.click();
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.chooseFolderButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }

  async getTokenErrorDetailText() {
    const text = await this.importErrorDetailMessage.textContent();
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  async checkImportTokenDetailErrorCount(count) {
    const text = await this.getTokenErrorDetailText();
    expect(text.length).toBe(count);
  }

  async checkImportTokenDetailErrorFormat(regex) {
    const text = await this.getTokenErrorDetailText();
    for (const [index, line] of text.entries()) {
      expect(line).toMatch(regex);
    }
  }

  async duplicateSetByName(setName) {
    await this.rightClickOnSetByName(setName);
    await this.duplicateOption.click();
  }

  async clickOnExportButton() {
    await this.exportButton.click();
  }

  async clickOnMultipleFilesButton() {
    await this.multipleFilesButton.click();
  }

  async checkEmptyExportTabMessage() {
    await expect(this.exportTokensMessage).toContainText(
      'There are no tokens, themes or sets to export.',
    );
  }

  async isExportWindowClosed(closed = true) {
    closed
      ? await expect(this.multipleFilesButton).not.toBeVisible()
      : await expect(this.multipleFilesButton).toBeVisible();
  }

  async exportToken() {
    await this.confirmExportButton.click();
    await this.page.waitForEvent('download');
  }

  async checkExportFileItemCount(expectedCount) {
    await expect(this.exportFileItem).toHaveCount(expectedCount);
  }

  async ifExportFileExists(name) {
    await expect(this.exportFileItem.filter({ hasText: name })).toBeVisible();
  }
};
