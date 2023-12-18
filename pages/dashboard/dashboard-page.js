const { expect } = require("@playwright/test");
const { BasePage } = require("../base-page");

exports.DashboardPage = class DashboardPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Files
    this.numberOfFilesText = page.locator(
      'div[class="project-name-wrapper"] span[class="info"]',
    );
    this.fileTile = page.locator('div[class="grid-item-th"]');
    this.fileInfoPanel = page.locator(
      'div[class="dashboard-grid"] div[class="grid-item-th"]',
    );
    this.fileNameTitle = page.locator('div[class="item-info"] h3');
    this.deleteFileMenuItem = page.locator('a[data-test="file-delete"]');
    this.deleteFileButton = page.locator(
      'input[value="Delete files"],input[value="Delete file"]',
    );
    this.createFileButtonPlaceholder = page.locator(
      'div[class*="dashboard-grid"] button[class*="create-new"]',
    );
    this.createFileButtonTitlePanel = page.locator(
      '*[data-test="project-new-file"]',
    );
    this.renameFileMenuItem = page.locator('a[data-test="file-rename"]');
    this.duplicateFileMenuItem = page.locator('a[data-test="file-duplicate"]');
    this.addFileAsSharedLibraryMenuItem = page.locator(
      'a[data-test="file-add-shared"]',
    );
    this.addFileAsSharedLibraryButton = page.locator(
      'input[value="Add as Shared Library"]',
    );
    this.sharedLibraryIcon = page.locator('svg[class="icon-library"]');
    this.delFileAsSharedLibraryMenuItem = page.locator(
      'a[data-test="file-del-shared"]',
    );
    this.delFileAsSharedLibraryButton = page.locator(
      'input[value="Unpublish"]',
    );
    this.downloadFilePenpotMenuItem = page.locator(
      'a[data-test="download-binary-file"]',
    );
    this.downloadFileStandardMenuItem = page.locator(
      'a[data-test="download-standard-file"]',
    );
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');
    this.fileNameInput = page.locator('div[class="edit-wrapper"]');
    this.fileOptionsMenuButton = page.locator(
      'div[class="project-th-icon menu"] svg[class="icon-actions"]',
    );
    this.headerOptionsMenuButton = page.locator(
      'div[class="dashboard-header-actions"] svg[class="icon-actions"]',
    );

    //Projects
    this.addProjectButton = page.locator(
      'button[data-test="new-project-button"]',
    );
    this.projectNameInput = page.locator(
      'div[class="project-name-wrapper"] div[class="edit-wrapper"]',
    );
    this.projectNameTitle = page.locator(
      'div[class="project-name-wrapper"] h2',
    );
    this.deleteProjectMenuItem = page.locator('a[data-test="project-delete"]');
    this.deleteProjectButton = page.locator(
      'input[value="Delete files"],input[value="Delete project"]',
    );
    this.renameProjectMenuItem = page.locator('a[data-test="project-rename"]');
    this.duplicateProjectMenuItem = page.locator(
      'a[data-test="project-duplicate"]',
    );
    this.pinUnpinProjectButton = page.locator('button[alt="Pin/Unpin"] svg');
    this.projectNameInput = page.locator(
      'div[class="project-name-wrapper"] div[class="edit-wrapper"]',
    );
    this.projectOptionsMenuButton = page.locator(
      '*[data-test="project-options"] .icon-actions',
    );
    this.projectsSidebarItem = page.locator('li:has-text("Projects")');
    this.draftsSidebarItem = page.locator('li:has-text("Drafts")');
    this.librariesSidebarItem = page.locator('li:has-text("Libraries")');
    this.pinnedProjectsSidebarItem = page.locator(
      'div[data-test="pinned-projects"]',
    );
    this.searchInput = page.locator("#search-input");
    this.projectOptions = page.locator('[data-test="project-options"]');

    // Import files
    this.fileImport = page.locator('[data-test="file-import"]');
    this.modalTitle = page.locator(".modal-header-title h2");
    this.modalCancelButton = page.locator(
      ".modal-footer .action-buttons .cancel-button",
    );
    this.modalAcceptButton = page.locator(
      ".modal-footer .action-buttons .accept-button",
    );
    this.feedbackBanner = page.locator(".feedback-banner");
    this.feedbackBannerMessage = page.locator(".feedback-banner .message");
    this.importErrorMessage = page.locator('div[class="error-message"]');

    //Fonts
    this.fontsSidebarItem = page.locator('li:has-text("Fonts")');
    this.uploadFontSelector = page.locator("#font-upload");
    this.uploadFontButton = page.locator('button:has-text("Upload")');
    this.fontNameTableCell = page.locator(
      'div[class="font-item table-row"] div[class="table-field family"]',
    );
    this.fontStyleTableCell = page.locator(
      'div[class="font-item table-row"] div[class="table-field variants"]',
    );
    this.fontOptionsMenuButton = page.locator(
      'div[class="table-field options"] svg[class="icon-actions"]',
    );
    this.editFontMenuItem = page.locator('a[data-test="font-edit"]');
    this.deleteFontMenuItem = page.locator('a[data-test="font-delete"]');
    this.deleteFontButton = page.locator('input[value="Delete"]');
    this.fontsTablePlaceholder = page.locator(
      'div[class="fonts-placeholder"] div[class="label"]',
    );
    this.fontNameInput = page.locator(
      'div[class="font-item table-row"] input[type="text"]',
    );
    this.saveFontButton = page.locator('button:has-text("Save")');
    this.searchFontInput = page.locator('input[placeholder="Search font"]');
    this.fontFormatError = page.locator('div[class="banner error fixed"]');

    //Libraries & Templates
    this.librariesAndTemplatesCarouselButton = page.locator(
      "div.dashboard-templates-section div.title button",
    );
    this.librariesAndTemplatesSection = page.locator(
      'div[class="dashboard-templates-section "]',
    );
    this.librariesAndTemplatesSectionCollapsed = page.locator(
      'div[class="dashboard-templates-section collapsed"]',
    );
    this.librariesAndTemplatesSectionLeftArrowButton = page.locator(
      'button[class="button left"]',
    );
    this.librariesAndTemplatesSectionRightArrowButton = page.locator(
      'button[class="button right"]',
    );
    this.continueButton = page.locator('input[value="Continue"]');
    this.acceptButton = page.locator('input[value="Accept"]');
    this.noLibrariesPlacelder = page.locator(
      'div[data-test="empty-placeholder"] p',
    );
  }

  async createFileViaPlaceholder() {
    await this.createFileButtonPlaceholder.first().click();
  }

  async createFileViaTitlePanel() {
    await this.projectNameTitle.first().hover();
    await this.createFileButtonTitlePanel.first().click({ force: true });
  }

  async deleteFileViaRightclick() {
    await this.fileInfoPanel.click({ button: "right" });
    await this.deleteFileMenuItem.click();
    await this.deleteFileButton.click();
  }

  async deleteFileViaOptionsIcon() {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.deleteFileMenuItem.click();
    await this.deleteFileButton.click();
  }

  async deleteFiles() {
    let counter = 0;
    while (await this.fileInfoPanel.count()) {
      await this.fileInfoPanel.first().click({ button: "right" });
      await this.deleteFileMenuItem.click();
      await this.deleteFileButton.click();
      counter++;
    }
    await expect(this.fileInfoPanel).toHaveCount(0);
  }

  async deleteFilesIfExist() {
    await this.numberOfFilesText.waitFor();
    const text = (await this.numberOfFilesText.innerText()).valueOf();
    if (!text.includes("0 files")) {
      await this.deleteFiles();
    }
  }

  async deleteProjectViaRightclick() {
    await this.projectNameTitle.first().click({ button: "right" });
    await this.deleteProjectMenuItem.click();
    await this.deleteProjectButton.click();
  }

  async deleteProjectViaOptionsIcon() {
    await this.projectNameTitle.first().hover();
    await this.projectOptionsMenuButton.first().click({ force: true });
    await this.deleteProjectMenuItem.click();
    await this.deleteProjectButton.click();
  }

  async deleteProjectsIfExist() {
    for (const project of await this.projectNameTitle.elementHandles()) {
      const name = (await project.innerText()).valueOf();
      if (!name.includes("Drafts")) {
        await project.click({ button: "right" });
        await this.deleteProjectMenuItem.click();
        await this.deleteProjectButton.click();
      }
    }
    await expect(this.projectNameTitle).toHaveCount(1);
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState("networkidle");
  }

  async isDashboardOpenedAfterLogin() {
    await this.page.waitForURL(/.*dashboard\/team/, { waitUntil: "load" });
  }

  async checkNumberOfFiles(numberOfFiles) {
    await expect(this.numberOfFilesText.first()).toHaveText(numberOfFiles);
  }

  async renameFileViaRightclick(newFileName) {
    await this.fileInfoPanel.click({ button: "right" });
    let text = await this.fileNameTitle.textContent();
    await this.renameFileMenuItem.click();
    await this.fileNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
    await this.fileNameInput.pressSequentially(newFileName);
    await this.page.keyboard.press("Enter");
    await this.isFilePresent(newFileName);
  }

  async renameFileViaOptionsIcon(newFileName) {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    let text = await this.fileNameTitle.textContent();
    await this.renameFileMenuItem.click();
    await this.fileNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
    await this.fileNameInput.pressSequentially(newFileName);
    await this.page.keyboard.press("Enter");
    await this.isFilePresent(newFileName);
  }

  async isFilePresent(fileName) {
    await expect(this.fileNameTitle).toHaveText(fileName);
  }

  async duplicateFileViaRightclick() {
    await this.fileInfoPanel.click({ button: "right" });
    await this.duplicateFileMenuItem.click();
  }

  async duplicateFileViaOptionsIcon() {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.duplicateFileMenuItem.click();
  }

  async addFileAsSharedLibraryViaRightclick() {
    await this.fileInfoPanel.click({ button: "right" });
    await this.addFileAsSharedLibraryMenuItem.click();
    await this.addFileAsSharedLibraryButton.click();
  }

  async addFileAsSharedLibraryViaOptionsIcon() {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.addFileAsSharedLibraryMenuItem.click();
    await this.addFileAsSharedLibraryButton.click();
  }

  async deleteFileAsSharedLibraryViaRightclick() {
    await this.fileInfoPanel.click({ button: "right" });
    await this.delFileAsSharedLibraryMenuItem.click();
    await this.delFileAsSharedLibraryButton.click();
  }

  async deleteFileAsSharedLibraryViaOptionsIcon() {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.delFileAsSharedLibraryMenuItem.click();
    await this.delFileAsSharedLibraryButton.click();
  }

  async isSharedLibraryIconDisplayed() {
    await expect(this.sharedLibraryIcon).toBeVisible();
  }
  async isSharedLibraryIconNotDisplayed() {
    await expect(this.sharedLibraryIcon).not.toBeVisible();
  }

  async downloadPenpotFileViaRightclick() {
    await this.fileInfoPanel.click({ button: "right" });
    await this.downloadFilePenpotMenuItem.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadPenpotFileViaOptionsIcon() {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.downloadFilePenpotMenuItem.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadStandardFileViaRightclick() {
    await this.fileInfoPanel.click({ button: "right" });
    await this.downloadFileStandardMenuItem.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadStandardFileViaOptionsIcon() {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.downloadFileStandardMenuItem.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async clickAddProjectButton() {
    await this.addProjectButton.click();
  }

  async setProjectName(newProjectName) {
    await this.projectNameInput.pressSequentially(newProjectName);
    await this.page.keyboard.press("Enter");
  }

  async isProjectTitleDisplayed(newProjectName) {
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async createProject(name) {
    await this.clickAddProjectButton();
    await this.setProjectName(name);
    await this.isProjectTitleDisplayed(name);
  }

  async renameProjectViaRightclick(newProjectName) {
    let text = await this.projectNameTitle.first().textContent();
    await this.projectNameTitle.first().click({ button: "right" });
    await this.renameProjectMenuItem.click();
    await this.projectNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
    await this.projectNameInput.pressSequentially(newProjectName);
    await this.page.keyboard.press("Enter");
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async renameProjectViaOptionsIcon(newProjectName) {
    let text = await this.projectNameTitle.first().textContent();
    await this.projectNameTitle.first().hover();
    await this.projectOptionsMenuButton.first().click({ force: true });
    await this.renameProjectMenuItem.click();
    await this.projectNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
    await this.projectNameInput.pressSequentially(newProjectName);
    await this.page.keyboard.press("Enter");
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async duplicateProjectViaRightclick() {
    await this.projectNameTitle.first().click({ button: "right" });
    await this.duplicateProjectMenuItem.click();
  }

  async duplicateProjectViaOptionsIcon() {
    await this.projectNameTitle.first().hover();
    await this.projectOptionsMenuButton.first().click({ force: true });
    await this.duplicateProjectMenuItem.click();
  }

  async openSidebarItem(item) {
    switch (item) {
      case "Projects":
        await this.projectsSidebarItem.click();
        break;
      case "Drafts":
        await this.draftsSidebarItem.click();
        break;
      case "Fonts":
        await this.fontsSidebarItem.click();
        break;
      case "Libraries":
        await this.librariesSidebarItem.click();
        break;
    }
    await expect(this.header).toHaveText(item);
  }

  async openProjectFromLeftSidebar(projectName) {
    const projectSel = await this.page.locator(
      `div[data-test="pinned-projects"] span.element-title:has-text("${projectName}")`,
    );
    await projectSel.click();
    await this.isHeaderDisplayed(projectName);
  }

  async checkNoLibrariesExist() {
    await expect(this.noLibrariesPlacelder).toContainText(
      "Files added to Libraries will appear here.",
    );
  }

  async clickUnpinProjectButton() {
    await this.projectNameTitle.first().hover();
    await expect(this.pinUnpinProjectButton).toHaveClass("icon-pin-fill");
    await this.pinUnpinProjectButton.click();
    await expect(this.pinUnpinProjectButton).toHaveClass("icon-pin");
  }

  async clickPinProjectButton() {
    await this.projectNameTitle.first().hover();
    await expect(this.pinUnpinProjectButton).toHaveClass("icon-pin");
    await this.pinUnpinProjectButton.click();
    await expect(this.pinUnpinProjectButton).toHaveClass("icon-pin-fill");
  }

  async checkPinnedProjectsSidebarItem(text) {
    await expect(this.pinnedProjectsSidebarItem).toHaveText(text);
  }

  async search(text) {
    await this.searchInput.pressSequentially(text);
  }

  async uploadFont(filePath) {
    await this.uploadFontSelector.setInputFiles(filePath);
    await this.uploadFontButton.click();
    await expect(this.uploadFontButton).not.toBeVisible();
  }

  async uploadFontWithInvalidFormat(filePath) {
    const fontName = filePath.split("/")[1];
    const warning = `The font '${fontName}' could not be loaded`;
    await this.uploadFontSelector.setInputFiles(filePath);
    await expect(this.fontFormatError).toHaveText(warning);
  }

  async isFontUploaded(fontName, fontStyle) {
    await expect(this.fontNameTableCell).toHaveText(fontName);
    await expect(this.fontStyleTableCell).toHaveText(fontStyle);
  }

  async deleteFont() {
    await this.fontOptionsMenuButton.click();
    await this.deleteFontMenuItem.click();
    await this.deleteFontButton.click();
  }

  async isFontsTablePlaceholderDisplayed(text) {
    await expect(this.fontsTablePlaceholder).toHaveText(text);
  }

  async editFont(newFontName) {
    await this.fontOptionsMenuButton.click();
    await this.editFontMenuItem.click();
    await this.clearInput(this.fontNameInput);
    await this.fontNameInput.pressSequentially(newFontName);
    await this.saveFontButton.click();
    await expect(this.fontNameTableCell).toHaveText(newFontName);
  }

  async searchFont(fontName) {
    await this.searchFontInput.pressSequentially(fontName);
    await expect(this.fontNameTableCell).toHaveText(fontName);
    await expect(this.fontNameTableCell).toHaveCount(1);
  }

  async clickLibrariesAndTemplatesCarouselButton() {
    await this.librariesAndTemplatesCarouselButton.click();
  }

  async isLibrariesAndTemplatesSectionDisplayed() {
    await expect(this.librariesAndTemplatesSection).toBeVisible();
  }

  async isLibrariesAndTemplatesSectionHidden() {
    await expect(this.librariesAndTemplatesSectionCollapsed).toBeVisible();
  }

  async isLibrariesAndTemplatesCarouselVisible() {
    try {
      await this.librariesAndTemplatesSection.waitFor({
        state: "visible",
        timeout: 4000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async minimizeLibrariesAndTemplatesCarousel() {
    if (await this.isLibrariesAndTemplatesCarouselVisible()) {
      await this.clickLibrariesAndTemplatesCarouselButton();
    }
    await this.isLibrariesAndTemplatesSectionHidden();
  }

  async maximizeLibrariesAndTemplatesCarousel() {
    if (!(await this.isLibrariesAndTemplatesCarouselVisible())) {
      await this.clickLibrariesAndTemplatesCarouselButton();
    }
    await this.isLibrariesAndTemplatesSectionDisplayed();
  }

  async flipLibrariesAndTemplatesCarousel(direction, times = 1) {
    if (direction === "left") {
      await this.librariesAndTemplatesSectionLeftArrowButton.click({
        clickCount: times,
      });
    } else {
      await this.librariesAndTemplatesSectionRightArrowButton.click({
        clickCount: times,
      });
    }
    await this.header.hover();
  }

  async openFile() {
    await this.fileTile.dblclick();
  }

  async openSecondFile(fileName) {
    const fileSel = this.page.locator(
      `div.info-wrapper:has-text("${fileName}")`,
    );
    await fileSel.dblclick();
  }

  async importSharedLibrary(libraryName) {
    await this.page
      .locator(`div[class="card-name"] span:has-text('${libraryName}')`)
      .click();
    await this.continueButton.click();
    await this.acceptButton.click();
  }

  async importFileProcessingSuccess(file) {
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.fileImport.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalTitle).toHaveText("Import Penpot files");
    await this.modalAcceptButton.click();
    await this.feedbackBanner.waitFor({ state: "visible" });
    await expect(this.feedbackBannerMessage).toHaveText(
      "1 file has been imported successfully.",
    );
    await this.modalAcceptButton.click();
  }

  async importFileProcessingError(file) {
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.fileImport.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalTitle).toHaveText("Import Penpot files");
    await expect(this.modalAcceptButton).toBeVisible();
    await expect(this.modalAcceptButton).toBeDisabled();

    await expect(this.importErrorMessage).toHaveText(
      "Oops! We couldn't import this file",
    );
    await this.modalCancelButton.click();
  }

  async importFile(file) {
    await this.projectOptions.click();
    await this.importFileProcessingSuccess(file);
  }

  async importFileFromProjectPage(file) {
    await this.headerOptionsMenuButton.click();
    await this.importFileProcessingSuccess(file);
  }

  async importFileWithInvalidFormat(file) {
    await this.headerOptionsMenuButton.click();
    await this.importFileProcessingError(file);
  }

  async importAndOpenFile(file) {
    await this.importFile(file);
    await this.openFile();
  }
};
