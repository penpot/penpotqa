const { BasePage } = require("../base-page");
const { expect } = require("@playwright/test");

exports.AssetsPanelPage = class AssetsPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Assets panel
    this.assetsTab = page.locator('div[data-id="assets"]');
    this.assetsSectionButton = page.locator(
      "button[class*=assets__section-button]",
    );
    this.assetsComponentsOption = page.locator("#section-components");
    this.assetsColorsOption = page.locator("#section-color");
    this.assetsTypographiesOption = page.locator("#section-typography");
    this.assetsAllOption = page.locator("#section-all");
    this.assetsPanel = page.locator('div[class*="assets-bar"]');
    this.librariesTab = page.locator('div[class="libraries-button"]');
    this.assetsSectionName = page.locator(
      'span[class*="assets_common__section-name"]',
    );
    this.assetsSectionNumbers = page.locator(
      'span[class*="assets_common__num-assets"]',
    );
    this.fileLibraryGraphicsUploadImageSelector = page.locator(
      'div[class="libraries-wrapper"] input[accept="image/gif,image/png,image/svg+xml,image/webp,image/jpeg"]',
    );
    this.fileLibraryGraphicsUploadedImageLabel = page.locator(
      'div[class="grid-cell"]',
    );
    this.renameFileLibraryMenuItem = page.locator('li:has-text("Rename")');
    this.deleteFileLibraryMenuItem = page.locator('li:has-text("Delete")');
    this.editFileLibraryMenuItem = page.locator('li:has-text("Edit")');
    this.duplicateFileLibraryMenuItem = page.locator(
      'li:has-text("Duplicate")',
    );
    this.createGroupFileLibraryMenuItem = page.locator('li:has-text("Group")');
    this.renameGroupFileLibraryMenuItem = page.locator('li:has-text("Rename")');
    this.ungroupFileLibraryMenuItem = page.locator('li:has-text("Ungroup")');
    this.groupNameInput = page.locator("#asset-name");
    this.createGroupButton = page.locator('input[value="Create"]');
    this.renameGroupButton = page.locator('input[value="Rename"]');
    this.fileLibraryGroupTitle = page.locator('div[class*="group-title"]');
    this.fileLibraryChangeViewButton = page.locator(
      'div[class="listing-option-btn"] svg',
    );
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
    this.fontSelectorSearchInput = page.locator(
      'input[placeholder="Search font"]',
    );
    this.fontSizeInput = page.locator('div[class*="font-size-select"] input');
    this.typographyNameInput = page.locator(
      'input[class*="adv-typography-name"]',
    );
    this.fileLibraryGraphicsComponentLabel = page.locator(
      'div[class="grid-cell"]',
    );
    this.fileLibraryGraphicsSecondComponentLabel = page.locator(
      'div[class="grid-cell"] >>nth=1',
    );

    //Assets panel - Libraries
    this.addSharedLibraryButton = page.locator('input[value="Add"]');
    this.removeSharedLibraryButton = page.locator('input[value="Remove"]');
    this.publishSharedLibraryButton = page.locator('input[value="Publish"]');
    this.unPublishSharedLibraryButton = page.locator(
      'input[value="Unpublish"]',
    );
    this.closeLibrariesPopUpButton = page.locator(
      "div.libraries-dialog a.close",
    );
    this.addAsSharedLibraryButton = page.locator(
      'input[value="Add as Shared Library"]',
    );
    this.removeAsSharedLibraryButton = page.locator('input[value="Unpublish"]');
    this.sharedLibraryBadge = page.locator('span[class*="shared-badge"]');
    this.searchLibraryInput = page.locator(
      "div.libraries-search input.search-input",
    );
    this.clearSearchInputIcon = page.locator("div.search-close svg.icon-close");
    this.searchIcon = page.locator("div.libraries-content div.search-icon");
    this.librariesEmptyList = page.locator("div.section-list-empty");
  }

  async clickAssetsTab() {
    await this.assetsTab.click();
  }

  async switchToAssetsPanelViaShortcut() {
    await this.page.keyboard.press("Alt+I");
  }

  async isAssetsPanelDisplayed() {
    await expect(this.assetsPanel).toBeVisible();
  }

  async clickLibrariesTab() {
    await this.librariesTab.click();
  }

  async isComponentAddedToFileLibraryComponents() {
    await expect(this.fileLibraryGraphicsComponentLabel).toBeVisible();
  }

  async isSecondComponentAddedToFileLibraryComponents() {
    await expect(this.fileLibraryGraphicsSecondComponentLabel).toBeVisible();
  }

  async isComponentNotAddedToFileLibraryComponents() {
    await expect(this.fileLibraryGraphicsComponentLabel).not.toBeVisible();
  }

  async duplicateFileLibraryComponents() {
    await this.fileLibraryGraphicsComponentLabel.click({ button: "right" });
    await this.duplicateFileLibraryMenuItem.click();
  }

  async deleteFileLibraryComponents() {
    await this.fileLibraryGraphicsComponentLabel.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async clickAddSharedLibraryButton() {
    await this.addSharedLibraryButton.click();
  }

  async clickRemoveSharedLibraryButton() {
    await this.removeSharedLibraryButton.click();
  }

  async clickPublishSharedLibraryButton() {
    await this.publishSharedLibraryButton.click();
  }

  async unPublishSharedLibrary() {
    await this.unPublishSharedLibraryButton.click();
    await this.unPublishSharedLibraryButton.click();
  }

  async isUnpublishLibraryBtnPresent() {
    await expect(this.unPublishSharedLibraryButton).toBeVisible();
  }

  async isPublishLibraryBtnPresent() {
    await expect(this.publishSharedLibraryButton).toBeVisible();
  }

  async clickCloseLibrariesPopUpButton() {
    await this.closeLibrariesPopUpButton.click();
  }

  async expandFileLibraryOnAccessPanel(libraryName) {
    await this.page
      .locator(
        `div[class="tool-window-bar library-bar"] span:has-text('${libraryName}')`,
      )
      .click();
  }

  async isFileLibraryOnAccessPanelNotDisplayed(libraryName) {
    await expect(
      this.page.locator(
        `div[class="tool-window-bar library-bar"] span:has-text('${libraryName}')`,
      ),
    ).not.toBeVisible();
  }

  async selectTypeFromAllAssetsSelector(type) {
    await this.clickOnAssetsSectionButton();
    switch (type) {
      case "All assets":
        await this.assetsAllOption.click();
        break;
      case "Components":
        await this.assetsComponentsOption.click();
        break;
      case "Colors":
        await this.assetsColorsOption.click();
        break;
      case "Typographies":
        await this.assetsTypographiesOption.click();
        break;
    }
  }

  async isAssetsSectionNameDisplayed(name, amount) {
    await expect(this.assetsSectionName).toHaveText(name);
    await expect(this.assetsSectionNumbers).toHaveText(amount);
  }

  async uploadImageToFileLibraryGraphics(filePath) {
    await this.fileLibraryGraphicsUploadImageSelector.setInputFiles(filePath);
  }

  async isImageUploadedToFileLibraryGraphics() {
    await expect(this.fileLibraryGraphicsUploadedImageLabel).toBeVisible();
  }

  async isImageNotUploadedToFileLibraryGraphics() {
    await expect(this.fileLibraryGraphicsUploadedImageLabel).not.toBeVisible();
  }

  async deleteFileLibraryGraphics() {
    await this.fileLibraryGraphicsUploadedImageLabel.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryGraphics(newGroupName) {
    await this.fileLibraryGraphicsUploadedImageLabel.click({ button: "right" });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async isFileLibraryGroupCreated(groupName) {
    await expect(this.fileLibraryGroupTitle).toHaveText(groupName);
  }

  async isFileLibraryGroupRemoved() {
    await expect(this.fileLibraryGroupTitle).not.toBeVisible();
  }

  async renameGroupFileLibrary(newGroupName) {
    await this.fileLibraryGroupTitle.click({ button: "right" });
    await this.renameGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.renameGroupButton.click();
  }

  async ungroupFileLibrary() {
    await this.fileLibraryGroupTitle.click({ button: "right" });
    await this.ungroupFileLibraryMenuItem.click();
  }

  async clickFileLibraryChangeViewButton() {
    await this.fileLibraryChangeViewButton.click();
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
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryColor(newColorName) {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    await this.fileLibraryColorsColorNameInput.fill(newColorName);
  }

  async deleteFileLibraryColor() {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async clickFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({ delay: 500 });
  }

  async clickAndPressAltFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({
      delay: 500,
      modifiers: ["Alt"],
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
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryTypography(newName) {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    // await this.clearInput(this.typographyNameInput);
    await this.typographyNameInput.fill(newName);
  }

  async deleteFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryAssets(assetType, newGroupName) {
    let selector;
    switch (assetType) {
      case "Colors":
        selector = this.fileLibraryColorsColorBullet;
        break;
      case "Typographies":
        selector = this.fileLibraryTypographyRecord;
        break;
    }
    await selector.click({ button: "right" });
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

  async searchForLibrary(libraryName) {
    await this.searchLibraryInput.fill(libraryName);
    await this.page.waitForTimeout(200);
  }

  async clearSearchLibraryInput() {
    await this.clearSearchInputIcon.click({ force: true });
    await this.searchIcon.waitFor();
  }

  async isNoMatchedLibrariesFound(libraryName) {
    await expect(this.librariesEmptyList).toBeVisible();
    await expect(this.librariesEmptyList).toHaveText(
      `No matches found for “${libraryName}“`,
    );
  }

  async isLibraryFoundAfterSearch(libraryName, isFound) {
    const librarySel = this.page.locator(
      `div.section-list-item div.item-name:text-is("${libraryName}")`,
    );
    if (isFound) {
      await expect(librarySel).toBeVisible();
    } else {
      await expect(librarySel).not.toBeVisible();
    }
  }

  async isSharedLibraryBadgeVisible() {
    await expect(this.sharedLibraryBadge).toBeVisible();
  }

  async isSharedLibraryBadgeNotVisible() {
    await expect(this.sharedLibraryBadge).not.toBeVisible();
  }

  async clickOnAssetsSectionButton() {
    await this.assetsSectionButton.click();
  }
};
