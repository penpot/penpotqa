const { expect } = require("@playwright/test");

exports.DashboardPage = class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator("h1");
    this.numberOfFilesText = page.locator(
      'div[class="project-name-wrapper"] span[class="info"]'
    );
    this.fileTile = page.locator('div[class="grid-item-th"]');
    this.fileInfoPanel = page.locator('div[class="item-info"]');
    this.fileNameTitle = page.locator('div[class="item-info"] h3');
    this.deleteFileMenuItem = page.locator('a[data-test="file-delete"]');
    this.deleteFileButton = page.locator(
      'input[value="Delete files"],input[value="Delete file"]'
    );
    this.createFileButtonPlaceholder = page.locator(
      'button[class="create-new"]'
    );
    this.createFileButtonTitlePanel = page.locator(
      'a[data-test="project-new-file"]'
    );
    this.renameFileMenuItem = page.locator('a[data-test="file-rename"]');
    this.duplicateFileMenuItem = page.locator('a[data-test="file-duplicate"]');
    this.addFileAsSharedLibraryMenuItem = page.locator(
      'a[data-test="file-add-shared"]'
    );
    this.addFileAsSharedLibraryButton = page.locator(
      'input[value="Add as Shared Library"]'
    );
    this.sharedLibraryIcon = page.locator('svg[class="icon-library"]');
    this.delFileAsSharedLibraryMenuItem = page.locator(
      'a[data-test="file-del-shared"]'
    );
    this.delFileAsSharedLibraryButton = page.locator(
      'input[value="Unpublish"]'
    );
    this.downloadFilePenpotMenuItem = page.locator(
      'a[data-test="download-binary-file"]'
    );
    this.downloadFileStandardMenuItem = page.locator(
      'a[data-test="download-standard-file"]'
    );
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');
    this.fileNameInput = page.locator('div[class="edit-wrapper"]');
    this.fileOptionsMenuButton = page.locator(
      'div[class="project-th-icon menu"] svg[class="icon-actions"]'
    );
    this.successMessage = page.locator('div[class="banner success fixed"]');
    this.infoMessage = page.locator('div[class="banner info fixed"]');
    this.addProjectButton = page.locator('a[data-test="new-project-button"]');
    this.projectNameInput = page.locator(
      'div[class="project-name-wrapper"] div[class="edit-wrapper"]'
    );
    this.projectNameTitle = page.locator(
      'div[class="project-name-wrapper"] h2'
    );
    this.deleteProjectMenuItem = page.locator('a[data-test="project-delete"]');
    this.deleteProjectButton = page.locator(
      'input[value="Delete files"],input[value="Delete project"]'
    );
    this.renameProjectMenuItem = page.locator('a[data-test="project-rename"]');
    this.duplicateProjectMenuItem = page.locator(
      'a[data-test="project-duplicate"]'
    );
    this.pinUnpinProjectButton = page.locator('span[alt="Pin/Unpin"] svg');
    this.projectNameInput = page.locator(
      'div[class="project-name-wrapper"] div[class="edit-wrapper"]'
    );
    this.projectOptionsMenuButton = page.locator(
      'a[data-test="project-options"] svg[class="icon-actions"]'
    );
    this.projectsSidebarItem = page.locator('li:has-text("Projects")');
    this.draftsSidebarItem = page.locator('li:has-text("Drafts")');
    this.fontsSidebarItem = page.locator('li:has-text("Fonts")');
    this.pinnedProjectsSidebarItem = page.locator(
      'div[data-test="pinned-projects"]'
    );
    this.searchInput = page.locator("#search-input");
    this.uploadFontSelector = page.locator("#font-upload");
    this.uploadFontButton = page.locator('button:has-text("Upload")');
    this.fontNameTableCell = page.locator(
      'div[class="font-item table-row"] div[class="table-field family"]'
    );
    this.fontStyleTableCell = page.locator(
      'div[class="font-item table-row"] div[class="table-field variants"]'
    );
    this.fontOptionsMenuButton = page.locator(
      'div[class="table-field options"] svg[class="icon-actions"]'
    );
    this.editFontMenuItem = page.locator('a[data-test="font-edit"]');
    this.deleteFontMenuItem = page.locator('a[data-test="font-delete"]');
    this.deleteFontButton = page.locator('input[value="Delete"]');
    this.fontsTablePlaceholder = page.locator(
      'div[class="fonts-placeholder"] div[class="label"]'
    );
    this.fontNameInput = page.locator(
      'div[class="font-item table-row"] input[type="text"]'
    );
    this.saveFontButton = page.locator('button:has-text("Save")');

    this.searchFontInput = page.locator("input[placeholder='Search font']");

    this.teamSelector = page.locator("div[class='current-team']");

    this.createNewTeamMenuItem = page.locator(
      "li[data-test='create-new-team']"
    );

    this.teamNameInput = page.locator("#name");

    this.createNewTeamButton = page.locator("input[value='Create new team']");
    this.teamMenuItem = page.locator("li[class='team-name']");
    this.teamOptionsMenuButton = page.locator(
      'div[class="switch-options"] svg[class="icon-actions"]'
    );
    this.deleteTeamMenuItem = page.locator('li[data-test="delete-team"]');
    this.deleteTeamButton = page.locator('input[value="Delete team"]');
    this.invitationsMenuItem = page.locator('li[data-test="team-invitations"]');
    this.inviteMembersToTeamButton = page.locator(
      'a[data-test="invite-member"]'
    );
    this.inviteMembersPopUpHeader = page.locator(
      'div[class^="modal dashboard-invite-modal form-container "] div[class="title"]'
    );
    this.inviteMembersTeamHeroButton = page.locator(
      'button[class="btn-primary invite"]'
    );
    this.inviteMembersToTeamRoleSelectorButton = page.locator(
      'div[class="custom-select"]'
    );
    this.inviteMembersToTeamRoleSelector = page.locator(
      'div[class="custom-select"] select'
    );
    this.inviteMembersToTeamEmailInput = page.locator(
      'input[placeholder="Emails, comma separated"]'
    );
    this.sendInvitationButton = page.locator('input[value="Send invitation"]');

    this.invitationRecord = page.locator('div[class="table-row"]');

    this.invitationRecordEmailCell = page.locator(
      'div[class="table-field mail"]'
    );

    this.invitationRecordRoleCell = page.locator(
      'div[class="table-field roles"]'
    );

    this.invitationRecordRoleSelector = page.locator(
      'div[class="rol-selector has-priv"]'
    );

    this.invitationRecordStatusCell = page.locator(
      'div[class="table-field status"] div'
    );

    this.invitationRecordOptionsMenuButton = page.locator(
      'div[class="table-field actions"] svg[class="icon-actions"]'
    );

    this.invitationRecordResendInvititationMenuItem = page.locator(
      'ul:has-text("Resend invitation")'
    );

    this.invitationRecordDeleteInvititationMenuItem = page.locator(
      'ul:has-text("Delete invitation")'
    );
    this.teamSettingsMenuItem = page.locator('li[data-test="team-settings"]');

    this.renameTeamMenuItem = page.locator('li[data-test="rename-team"]');

    this.uploadTeamImageButton = page.locator('input[type="file"]');

    this.renameTeamInput = page.locator("#name");

    this.updateTeamButton = page.locator('input[value="Update team"]');

    this.librariesAndTemplatesCarouselButton = page.locator(
      'span:has-text("Libraries & Templates")'
    );

    this.librariesAndTemplatesSection = page.locator(
      'div[class="dashboard-templates-section "]'
    );

    this.librariesAndTemplatesSectionLeftArrowButton = page.locator(
      'div[class="button left"]'
    );

    this.librariesAndTemplatesSectionRightArrowButton = page.locator(
      'div[class="button right"]'
    );

    this.teamInfoSection = page.locator('div[class="block info-block"]');
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toBeVisible();
    await expect(this.header).toHaveText(title);
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
    for (const el of await this.fileInfoPanel.elementHandles()) {
      await el.click({ button: "right" });
      await this.deleteFileMenuItem.click();
      await this.deleteFileButton.click();
    }
  }

  async deleteFilesIfExist() {
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

  async deleteProjects() {
    for (const el of await this.projectNameTitle.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      if (!text.includes("Drafts")) {
        await el.click({ button: "right" });
        await this.deleteProjectMenuItem.click();
        await this.deleteProjectButton.click();
      }
    }
  }

  async deleteProjectsIfExist() {
    const text = (await this.projectNameTitle.first().innerText()).valueOf();
    if (!text.includes("Drafts")) {
      await this.deleteProjects();
    }
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState("networkidle");
  }

  async checkNumberOfFiles(numberOfFiles) {
    await this.waitForPageLoaded();
    await expect(this.numberOfFilesText.first()).toHaveText(numberOfFiles);
  }

  async renameFileViaRightclick(newFileName) {
    await this.fileInfoPanel.click({ button: "right" });
    await this.renameFileMenuItem.click();
    await this.fileNameInput.type(newFileName);
    await this.page.keyboard.press("Enter");
    await this.isFileNameDisplayed(newFileName);
  }

  async renameFileViaOptionsIcon(newFileName) {
    await this.fileInfoPanel.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.renameFileMenuItem.click();
    await this.fileNameInput.type(newFileName);
    await this.page.keyboard.press("Enter");
    await this.isFileNameDisplayed(newFileName);
  }

  async isFileNameDisplayed(fileName) {
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

  async isSuccessMessageDisplayed(message) {
    await expect(this.successMessage).toHaveText(message);
  }

  async isInfoMessageDisplayed(message) {
    await expect(this.infoMessage).toHaveText(message);
  }

  async isInfoMessageNotDisplayed() {
    await expect(this.infoMessage).not.toBeVisible();
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
    await this.projectNameInput.type(newProjectName);
    await this.page.keyboard.press("Enter");
  }

  async isProjectTitleDisplayed(newProjectName) {
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async renameProjectViaRightclick(newProjectName) {
    await this.projectNameTitle.first().click({ button: "right" });
    await this.renameProjectMenuItem.click();
    await this.projectNameInput.type(newProjectName);
    await this.page.keyboard.press("Enter");
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async renameProjectViaOptionsIcon(newProjectName) {
    await this.projectNameTitle.first().hover();
    await this.projectOptionsMenuButton.first().click({ force: true });
    await this.renameProjectMenuItem.click();
    await this.projectNameInput.type(newProjectName);
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

  async clickSidebarItem(item) {
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
    }
  }

  async clickUnpinProjectButton() {
    await this.waitForPageLoaded();
    await this.projectNameTitle.first().hover();
    await this.waitForPageLoaded();
    await expect(this.pinUnpinProjectButton).toHaveClass("icon-pin-fill");
    await this.pinUnpinProjectButton.click();
    await this.waitForPageLoaded();
  }

  async clickPinProjectButton() {
    await this.waitForPageLoaded();
    await this.projectNameTitle.first().hover();
    await this.waitForPageLoaded();
    await expect(this.pinUnpinProjectButton).toHaveClass("icon-pin");
    await this.pinUnpinProjectButton.click();
    await this.waitForPageLoaded();
  }

  async checkPinnedProjectsSidebarItem(text) {
    await expect(this.pinnedProjectsSidebarItem).toHaveText(text);
  }

  async search(text) {
    await this.searchInput.type(text);
  }

  async uploadFont(filePath) {
    await this.uploadFontSelector.setInputFiles(filePath);
    await this.uploadFontButton.click();
    await expect(this.uploadFontButton).not.toBeVisible();
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

  async deleteFonts() {
    for (const el of await this.fontOptionsMenuButton.elementHandles()) {
      await el.click();
      await this.deleteFontMenuItem.click();
      await this.deleteFontButton.click();
    }
  }

  async deleteFontsIfExist() {
    const fontRecords = await this.page.$$('div[class="font-item table-row"]');
    if (fontRecords) await this.deleteFonts();
  }

  async isFontsTablePlaceholderDisplayed(text) {
    await expect(this.fontsTablePlaceholder).toHaveText(text);
  }

  async editFont(newFontName) {
    await this.fontOptionsMenuButton.click();
    await this.editFontMenuItem.click();
    await this.clearInput(this.fontNameInput);
    await this.fontNameInput.type(newFontName);
    await this.saveFontButton.click();
    await expect(this.fontNameTableCell).toHaveText(newFontName);
  }

  async clearInput(input) {
    await input.click();
    let text = await input.inputValue();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
  }

  async searchFont(fontName) {
    await this.searchFontInput.type(fontName);
    await expect(this.fontNameTableCell).toHaveText(fontName);
    await expect(this.fontNameTableCell).toHaveCount(1);
  }

  async createTeam(teamName) {
    await this.teamSelector.click();
    await this.createNewTeamMenuItem.click();
    await this.teamNameInput.fill(teamName);
    await this.createNewTeamButton.click();
  }

  async isTeamSelected(teamName) {
    await expect(this.teamSelector).toHaveText(teamName);
  }

  async deleteTeam(teamName) {
    await this.teamSelector.click();
    for (const el of await this.teamMenuItem.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      if (text.includes(teamName)) {
        await el.click();
        await this.teamOptionsMenuButton.click();
        await this.deleteTeamMenuItem.click();
        await this.deleteTeamButton.click();
        await this.waitForPageLoaded();
        await expect(this.teamSelector).not.toHaveText(teamName);
      }
    }
  }

  async deleteTeamsIfExist() {
    await this.teamSelector.click();
    for (const el of await this.teamMenuItem.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      if (!text.includes("Your Penpot")) {
        await el.click();
        await this.teamOptionsMenuButton.click();
        await this.deleteTeamMenuItem.click();
        await this.deleteTeamButton.click();
        await this.waitForPageLoaded();
        await expect(this.teamSelector).toHaveText("Your Penpot");
        await this.teamSelector.click();
      }
    }
    await this.teamSelector.click();
  }

  async isTeamDeleted(teamName) {
    await this.teamSelector.click();
    for (const el of await this.teamMenuItem.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      expect(text).not.toEqual(teamName);
    }
  }

  async openInvitationsPageViaOptionsMenu() {
    await this.teamOptionsMenuButton.click();
    await this.invitationsMenuItem.click();
  }

  async clickInviteMembersToTeamButton() {
    await this.inviteMembersToTeamButton.click();
  }

  async isInviteMembersPopUpHeaderDisplayed(title) {
    await expect(this.inviteMembersPopUpHeader).toHaveText(title);
  }

  async clickInviteMembersTeamHeroButton() {
    await this.inviteMembersTeamHeroButton.click();
  }

  async enterEmailToInviteMembersPopUp(email) {
    await this.inviteMembersToTeamEmailInput.type(email);
  }

  async clickSendInvitationButton() {
    await this.sendInvitationButton.click();
  }

  async isInvitationRecordDisplayed(email, role, status) {
    await expect(this.invitationRecordEmailCell).toHaveText(email);
    await expect(this.invitationRecordRoleCell).toHaveText(role);
    await expect(this.invitationRecordStatusCell).toHaveText(status);
  }

  async selectInvitationRoleInPopUp(role) {
    await this.inviteMembersToTeamRoleSelectorButton.click();
    switch (role) {
      case "Admin":
        await this.inviteMembersToTeamRoleSelector.selectOption("admin");
        break;
      case "Editor":
        await this.inviteMembersToTeamRoleSelector.selectOption("editor");
        break;
    }
  }

  async selectInvitationRoleInInvitationRecord(role) {
    await this.invitationRecordRoleSelector.click();
    await this.page.locator(`li:has-text('${role}')`).click();
  }

  async resendInvitation() {
    await this.invitationRecordOptionsMenuButton.click();
    await this.invitationRecordResendInvititationMenuItem.click();
  }

  async deleteInvitation() {
    await this.invitationRecordOptionsMenuButton.click();
    await this.invitationRecordDeleteInvititationMenuItem.click();
  }

  async isInvitationRecordRemoved() {
    await expect(this.invitationRecord).not.toBeVisible();
  }

  async openTeamSettingsPageViaOptionsMenu() {
    await this.teamOptionsMenuButton.click();
    await this.teamSettingsMenuItem.click();
  }

  async uploadTeamImage(filePath) {
    await this.uploadTeamImageButton.setInputFiles(filePath);
  }

  async renameTeam(teamName) {
    await this.teamOptionsMenuButton.click();
    await this.renameTeamMenuItem.click();
    await this.clearInput(this.renameTeamInput);
    await this.renameTeamInput.fill(teamName);
    await this.updateTeamButton.click();
  }

  async clickLibrariesAndTemplatesCarouselButton() {
    await this.librariesAndTemplatesCarouselButton.click();
  }

  async isLibrariesAndTemplatesSectionDisplayed() {
    await expect(this.librariesAndTemplatesSection).toBeVisible();
  }

  async isLibrariesAndTemplatesSectionNotDisplayed() {
    await expect(this.librariesAndTemplatesSection).not.toBeVisible();
  }

  async minimizeLibrariesAndTemplatesCarouselIfExpanded() {
    if (await this.librariesAndTemplatesSection.isVisible()) {
      await this.clickLibrariesAndTemplatesCarouselButton();
    }
  }

  async flipRightLibrariesAndTemplatesCarousel() {
    await this.librariesAndTemplatesSectionRightArrowButton.click();
    await this.waitForPageLoaded();
  }

  async flipLeftLibrariesAndTemplatesCarousel() {
    await this.librariesAndTemplatesSectionLeftArrowButton.click();
    await this.waitForPageLoaded();
  }

  async openFIle() {
    await this.fileTile.dblclick();
  }
};
