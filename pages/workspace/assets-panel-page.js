const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');

exports.AssetsPanelPage = class AssetsPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Assets panel
    this.assetsTab = page.getByRole("tab", { name: "assets" });
    this.assetComponentLabel = page.locator(
      'div[class*="assets_components__grid-cell"]',
    );
    this.assetsSecondComponentLabel = page.locator(
      'div[class*="assets_components__grid-cell"] >>nth=1',
    );
    this.componentsGridOnAssetsTab = page.locator(
      'div[class*="assets_components__asset-grid"]',
    );
    this.componentsTitleBarOnAssetsTab = page.locator(
      'div[class*="components_title_bar"] span:text-is("Components")',
    );
    this.assetsPanel = page.locator('article[class*="assets-bar"]');
    this.assetsSectionName = page.getByTestId('left-sidebar');
    this.assetsSectionNumbers = page.locator(
      'span[class*="assets_common__num-assets"]',
    );
    this.renameFileLibraryMenuItem = page.getByRole('menuitem').filter({ hasText: 'Rename' });
    this.deleteFileLibraryMenuItem = page.getByRole('menuitem').filter({ hasText: 'Delete' });
    this.editFileLibraryMenuItem = page.getByRole('menuitem').filter({ hasText: 'Edit' });
    this.createGroupFileLibraryMenuItem = page.getByRole('menuitem').filter({ hasText: 'Group' });
    this.ungroupFileLibraryMenuItem = page.getByRole('menuitem').filter({ hasText: 'Ungroup' });
    this.groupNameInput = page.getByRole('textbox', { name: 'Group name' });
    this.createGroupButton = page.getByRole('button', { name: 'Create' });
    this.renameGroupButton = page.getByRole('button', { name: 'Rename' });
    this.fileLibraryGroupTitle = page.locator('div[class*="group-title"]');
    this.fileLibraryListViewButton = page.getByTitle('List view');
    this.fileLibraryGridViewButton = page.getByTitle('Grid view');
    this.addFileLibraryColorButton = page.locator(
      'button[class*="assets_colors__assets-btn"]',
    );
    this.fileLibraryColorsColorBullet = page.locator(
      'div[class*="assets_colors__bullet-block"]',
    );
    this.fileLibraryColorsColorTitle = page.locator('div[class*="name-block"]');
    this.fileLibraryColorsColorNameInput = page.locator(
      'input[class*="element-name"]',
    );
    this.addFileLibraryTypographyButton = page.locator(
      'button[class*="typographies__assets-btn"]',
    );
    this.minimizeFileLibraryTypographyButton = page.locator(
      'div[class*="typography__action-btn"]',
    );
    this.expandFileLibraryTypographyButton = page.locator(
      'div[class*="typography__element-set-actions"] button',
    );
    this.fileLibraryTypographyRecord = page.locator(
      'div[class*="typography-entry"]',
    );
    this.fontSelector = page.locator('div[class*="typography__font-option"]');
    this.fontSelectorSearchInput = page.getByRole('textbox', { name: 'Search font' });
    this.fontSizeInput = page.locator('div[class*="font-size-select"] input');
    this.typographyNameInput = page.locator('input[class*="adv-typography-name"]');
    this.assetsTitleText = page.locator(
      'div[class*="asset-section"] span[class*="title-name"]',
    );
    this.assetsTypeButton = page.getByRole('button', { name: 'Filter' });
    this.assetsTypeDropdown = page.locator('ul[class*="context-menu-items"]');
    this.assetsTypeAll = page.locator('#section-all');
    this.assetsTypeComponents = page.locator('#section-components');
    this.assetsTypeColors = page.locator('#section-color');
    this.assetsTypeTypographies = page.locator('#section-typography');
    this.duplicateMainComponentMenuItem = page.getByRole('menuitem').filter({ hasText: 'Duplicate main' });
    this.showMainComponentMenuItem = page.getByRole('menuitem').filter({ hasText: 'Show main component' });
    this.fileLibraryComponentNameInput = page.locator(
      'div[class*="assets_components__editing"] input',
    );
    this.fontRecordOnTypographiesBottomPanel = page.locator(
      'div[class="typography-item"]',
    );

    //Assets panel - Libraries
    this.addAsSharedLibraryButton = page.getByRole('button', { name: 'Add as Shared Library' });
    this.removeAsSharedLibraryButton = page.getByRole('button', { name: 'Unpublish' });
    this.sharedLibraryBadge = page.locator('span[class*="shared-badge"]');
    this.librariesOpenModalButton = page.getByRole('button', { name: 'Libraries' });
    this.addSharedLibraryButton = page.getByRole('button', { name: 'Publish' });
    this.cancelSharedLibraryButton = page.getByRole('button', { name: 'Cancel' });
    this.searchSharedLibrariesInput = page.getByRole('textbox', { name: 'Search shared libraries' });
    this.searchSharedLibrariesClearButton = page.locator('button[class*="search_bar__clear"]');
    this.libraryTitle = page.locator('div[class*="special-title"]');
    this.libraryComponentsTitle = page.locator(
      '//*[@class="icon-component"]/../../../../../button/div/span'
    );
    this.dismissButton = page.getByRole('button', { name: 'Dismiss' });
    this.librariesUpdatesTab = page.getByRole('tab', { name: 'UPDATES' });
    this.librariesUpdateButton = page.getByRole('button', { name: 'Update' });
    this.librariesMoreInfoButton = page.getByRole('button', { name: 'More info' });
    this.closeModalButton = page.locator('svg[class*="close-icon"]');
    this.librariesModal = page.locator('div[class*="libraries__modal-dialog"]');
  }

  async clickAssetsTab() {
    await this.assetsTab.click();
  }

  async isSecondComponentAddedToFileLibrary() {
    await expect(this.assetsSecondComponentLabel).toBeVisible();
  }

  async isComponentNotAddedToFileLibraryComponents() {
    await expect(this.assetComponentLabel).not.toBeVisible();
  }

  async deleteFileLibraryComponents() {
    await this.assetComponentLabel.click({ button: 'right' });
    await this.deleteFileLibraryMenuItem.click();
  }

  async isAssetsSectionNameDisplayed(name, amount) {
    await expect(this.assetsSectionName.getByText(name)).toHaveText(name);
    await expect(this.assetsSectionNumbers).toHaveText(amount);
  }

  async isFileLibraryGroupCreated(groupName) {
    await expect(this.fileLibraryGroupTitle).toHaveText(groupName);
  }

  async isFileLibraryGroupRemoved() {
    await expect(this.fileLibraryGroupTitle).not.toBeVisible();
  }

  async renameGroupFileLibrary(newGroupName) {
    await this.fileLibraryGroupTitle.click({ button: 'right' });
    await this.renameFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.renameGroupButton.click();
  }

  async ungroupFileLibrary() {
    await this.fileLibraryGroupTitle.click({ button: 'right' });
    await this.ungroupFileLibraryMenuItem.click();
  }

  async clickFileLibraryListViewButton() {
    await this.fileLibraryListViewButton.click();
  }

  async clickFileLibraryGridViewButton() {
    await this.fileLibraryGridViewButton.click();
  }

  async clickAddFileLibraryColorButton() {
    await this.addFileLibraryColorButton.click();
  }

  async isColorAddedToFileLibraryColors(colorName) {
    await expect(this.fileLibraryColorsColorBullet).toBeVisible();
    await expect(this.fileLibraryColorsColorTitle).toHaveText(colorName);
  }

  async isColorNotAddedToFileLibraryColors() {
    await expect(this.fileLibraryColorsColorBullet).not.toBeVisible();
  }

  async editFileLibraryColor() {
    await this.fileLibraryColorsColorBullet.click({ button: 'right' });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryColor(newColorName) {
    await this.fileLibraryColorsColorBullet.click({ button: 'right' });
    await this.renameFileLibraryMenuItem.click();
    await this.fileLibraryColorsColorNameInput.fill(newColorName);
  }

  async deleteFileLibraryColor() {
    await this.fileLibraryColorsColorBullet.click({ button: 'right' });
    await this.deleteFileLibraryMenuItem.click();
  }

  async clickFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({ delay: 500 });
  }

  async clickAndPressAltFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({
      delay: 500,
      modifiers: ['Alt'],
    });
  }

  async clickAddFileLibraryTypographyButton() {
    await this.addFileLibraryTypographyButton.click();
  }

  async minimizeFileLibraryTypography() {
    await this.minimizeFileLibraryTypographyButton.click();
  }

  async expandFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.hover();
    await this.expandFileLibraryTypographyButton.click();
  }

  async editFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.click({ button: 'right' });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryTypography(newName) {
    await this.fileLibraryTypographyRecord.click({ button: 'right' });
    await this.renameFileLibraryMenuItem.click();
    await this.typographyNameInput.fill(newName);
  }

  async deleteFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.click({ button: 'right' });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryAssets(assetType, newGroupName) {
    let selector;
    switch (assetType) {
      case 'Colors':
        selector = this.fileLibraryColorsColorBullet;
        break;
      case 'Typographies':
        selector = this.fileLibraryTypographyRecord;
        break;
      case 'Components':
        selector = this.assetComponentLabel;
        break;
    }
    await selector.click({ button: 'right' });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async clickFileLibraryTypographiesTypographyRecord() {
    await this.fileLibraryTypographyRecord.click();
  }

  async selectFont(fontName) {
    await this.fontSelector.click();
    await this.fontSelectorSearchInput.fill(fontName);
    await this.page
      .locator(`div[class*="font-item"] span:has-text('${fontName}')`)
      .click();
  }

  async selectFontSize(value) {
    await this.fontSizeInput.fill(value);
  }

  async clickAddAsSharedLibraryButton() {
    await this.addAsSharedLibraryButton.click();
  }

  async clickRemoveAsSharedLibraryButton() {
    await this.removeAsSharedLibraryButton.click();
  }

  async isRemoveAsSharedLibraryButtonVisible() {
    await expect(this.removeAsSharedLibraryButton).toBeVisible();
  }

  async isSharedLibraryBadgeVisible() {
    await expect(this.sharedLibraryBadge).toBeVisible();
  }

  async isSharedLibraryBadgeNotVisible() {
    await expect(this.sharedLibraryBadge).not.toBeVisible();
  }

  async dragComponentOnCanvas(x, y) {
    await this.assetComponentLabel.dragTo(this.viewport, {
      targetPosition: { x: x, y: y },
    });
  }

  async expandComponentsBlockOnAssetsTab() {
    if (!(await this.componentsGridOnAssetsTab.isVisible())) {
      await this.componentsTitleBarOnAssetsTab.click();
    }
    await expect(this.componentsGridOnAssetsTab).toBeVisible();
  }

  async isComponentAddedToFileLibraryComponents() {
    await expect(this.assetComponentLabel).toBeVisible();
  }

  async selectTypeFromAllAssetsDropdown(type) {
    await this.assetsTypeButton.click();
    await expect(this.assetsTypeDropdown).toBeVisible();
    switch (type) {
      case 'All assets':
        await this.assetsTypeAll.click();
        break;
      case 'Components':
        await this.assetsTypeComponents.click();
        break;
      case 'Colors':
        await this.assetsTypeColors.click();
        break;
      case 'Typographies':
        await this.assetsTypeTypographies.click();
        break;
    }
  }

  async duplicateFileLibraryComponent() {
    await this.assetComponentLabel.click({ button: 'right' });
    await this.duplicateMainComponentMenuItem.click();
  }

  async showFileLibraryMainComponent() {
    await this.assetComponentLabel.click({ button: 'right' });
    await this.showMainComponentMenuItem.click();
  }

  async renameFileLibraryComponent(newName) {
    await this.assetComponentLabel.click({ button: 'right' });
    await this.renameFileLibraryMenuItem.click();
    await this.fileLibraryComponentNameInput.fill(newName);
    await this.clickOnEnter();
  }

  async clickLibrariesButton() {
    await this.librariesOpenModalButton.click();
  }

  async clickSharedLibraryButton() {
    await this.addSharedLibraryButton.click();
  }

  async isSharedLibraryButtonVisible() {
    await expect(this.addSharedLibraryButton).toBeVisible();
  }

  async clickCancelSharedLibraryButton() {
    await this.cancelSharedLibraryButton.click();
  }

  async isSharedLibraryCancelButtonVisible() {
    await expect(this.cancelSharedLibraryButton).toBeVisible();
  }

  async isSharedLibrarySearchInputVisible() {
    await expect(this.searchSharedLibrariesInput).toBeVisible();
  }

  async clickSharedLibraryImportButton(name) {
    const elem = this.page.locator(`//div[text()="${name}"]/../../button`);
    await elem.first().click();
  }

  async isSharedLibraryVisibleByName(name) {
    const elem = this.page.locator(`//div[text()="${name}"]/../../button`);
    await expect(elem.first()).toBeVisible();
  }

  async dragAndDropComponentToViewport(name) {
    await this.page.waitForTimeout(200);
    const component = this.page.locator(
      `//span[@title="${name}"]/..`,
    ).last();
    await component.hover();
    await component.dragTo(this.viewport);
  }

  async clickLibraryTitle() {
    await this.libraryTitle.last().click();
  }

  async clickLibraryComponentsTitle() {
    await this.page.waitForTimeout(300);
    await this.libraryComponentsTitle.last().click();
  }

  async clickLibraryTitleWithName(libraryName) {
    const libTitle = this.page.locator(`div[class*="special-title"]:has-text("${libraryName}")`);
    await libTitle.last().click();
  }

  async clickDismissButton() {
    await this.dismissButton.last().click();
  }

  async clickUpdatesTab() {
    await this.librariesUpdatesTab.click();
  }

  async clickLibrariesUpdateButton() {
    await this.librariesUpdateButton.click();
  }

  async clickCloseModalButton() {
    await this.closeModalButton.click();
  }

  async clickLibrariesMoreInfoButton() {
    await this.librariesMoreInfoButton.click();
  }

  async isLibrariesUpdateButtonVisible() {
    await expect(this.librariesUpdateButton.first()).toBeVisible();
  }

  async searchSharedLibraries(name) {
    await this.searchSharedLibrariesInput.click();
    await this.searchSharedLibrariesInput.pressSequentially(name);
    await this.page.keyboard.press('Enter');
  }

  async clearSearchSharedLibraries() {
    await this.searchSharedLibrariesClearButton.click();
  }
};
