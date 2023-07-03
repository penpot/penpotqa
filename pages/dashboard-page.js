const { expect } = require("@playwright/test");
const { BasePage } = require("./base-page");

exports.DashboardPage = class DashboardPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.successMessage = page.locator('div[class="banner success fixed"]');
    this.infoMessage = page.locator('div[class="banner info fixed"]');

    //Files
    this.numberOfFilesText = page.locator(
      'div[class="project-name-wrapper"] span[class="info"]'
    );
    this.fileTile = page.locator('div[class="grid-item-th"]');
    this.secondFileTile = page.locator('div[class="grid-item-th"] >>nth=1');
    this.fileInfoPanel = page.locator('div[class="dashboard-grid"] div[class="grid-item-th"]');
    this.fileNameTitle = page.locator('div[class="item-info"] h3');
    this.deleteFileMenuItem = page.locator('a[data-test="file-delete"]');
    this.deleteFileButton = page.locator(
      'input[value="Delete files"],input[value="Delete file"]'
    );
    this.createFileButtonPlaceholder = page.locator(
      'div[class="dashboard-grid"] button[class="create-new"]'
    );
    this.createFileButtonTitlePanel = page.locator(
      '*[data-test="project-new-file"]'
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

    //Projects
    this.addProjectButton = page.locator(
      'button[data-test="new-project-button"]'
    );
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
    this.pinUnpinProjectButton = page.locator('button[alt="Pin/Unpin"] svg');
    this.projectNameInput = page.locator(
      'div[class="project-name-wrapper"] div[class="edit-wrapper"]'
    );
    this.projectOptionsMenuButton = page.locator(
      '*[data-test="project-options"] .icon-actions'
    );
    this.projectOptions = page.locator('[data-test="project-options"]');
    this.fileImport = page.locator('[data-test="file-import"]');
    this.modal = page.locator('#modal');
    this.modalCloseButton = page.locator('.modal-close-button');
    this.modalTitle = page.locator('.modal-header-title h2');
    this.modalCancelButton = page.locator('.modal-footer .action-buttons .cancel-button');
    this.modalAcceptButton = page.locator('.modal-footer .action-buttons .accept-button');
    this.feedbackBanner = page.locator('.feedback-banner')
    this.feedbackBannerMessage = page.locator('.feedback-banner .message')
    this.projectsSidebarItem = page.locator('li:has-text("Projects")');
    this.draftsSidebarItem = page.locator('li:has-text("Drafts")');
    this.pinnedProjectsSidebarItem = page.locator(
      'div[data-test="pinned-projects"]'
    );
    this.searchInput = page.locator("#search-input");

    //Fonts
    this.fontsSidebarItem = page.locator('li:has-text("Fonts")');
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
    this.teamSelector = page.locator(".current-team");
    this.teamList = page.locator("ul[class*='teams-dropdown']");
    this.createNewTeamMenuItem = page.locator("#teams-selector-create-team");

    //Teams
    this.teamNameInput = page.locator("#name");
    this.createNewTeamButton = page.locator("input[value='Create new team']");
    this.teamMenuItem = page.locator(".current-team .team-name");
    this.teamOptionsMenuButton = page.locator(".switch-options .icon-actions");
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
      'li:has-text("Resend invitation")'
    );
    this.invitationRecordDeleteInvititationMenuItem = page.locator(
      'li:has-text("Delete invitation")'
    );
    this.teamSettingsMenuItem = page.locator('li[data-test="team-settings"]');
    this.renameTeamMenuItem = page.locator('li[data-test="rename-team"]');
    this.uploadTeamImageButton = page.locator('input[type="file"]');
    this.renameTeamInput = page.locator("#name");
    this.updateTeamButton = page.locator('input[value="Update team"]');

    //Libraries & Templates
    this.librariesAndTemplatesCarouselButton = page.locator(
      '//*[text()="Libraries & Templates"]//parent::button'
    );
    this.librariesAndTemplatesSection = page.locator(
      'div[class^="dashboard-templates-section"]'
    );
    this.librariesAndTemplatesSectionCollapsed = page.locator(
      'div[class="dashboard-templates-section collapsed"]'
    );
    this.librariesAndTemplatesSectionLeftArrowButton = page.locator(
      'button[class="button left"]'
    );
    this.librariesAndTemplatesSectionRightArrowButton = page.locator(
      'button[class="button right"]'
    );
    this.teamInfoSection = page.locator('div[class="block info-block"]');
    this.continueButton = page.locator('input[value="Continue"]');
    this.acceptButton = page.locator('input[value="Accept"]');
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

  async isDashboardOpened() {
    await this.page.waitForURL(/.*dashboard\/team/, { waitUntil: "load" });
    await this.page.waitForResponse(/get-team-recent-files/);
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
    await this.fileNameInput.type(newFileName);
    await this.page.keyboard.press("Enter");
    await this.isFileNameDisplayed(newFileName);
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

  async waitSuccessMessageHidden() {
    await this.successMessage.waitFor({ state:"hidden" });
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
    let text = await this.projectNameTitle.first().textContent();
    await this.projectNameTitle.first().click({ button: "right" });
    await this.renameProjectMenuItem.click();
    await this.projectNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
    await this.projectNameInput.type(newProjectName);
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

  async searchFont(fontName) {
    await this.searchFontInput.type(fontName);
    await expect(this.fontNameTableCell).toHaveText(fontName);
    await expect(this.fontNameTableCell).toHaveCount(1);
  }

  async createTeam(teamName) {
    await this.openTeamsListIfClosed();
    await this.createNewTeamMenuItem.click();
    await this.teamNameInput.fill(teamName);
    await this.createNewTeamButton.click();
  }

  async isTeamSelected(teamName) {
    await expect(this.teamSelector).toHaveText(teamName);
  }

  async openTeamsListIfClosed() {
    if (!await this.teamList.isVisible()) {
      await this.teamSelector.click();
    }
    await expect(this.teamList).toBeVisible();
  }

  async deleteTeam(teamName) {
    await this.openTeamsListIfClosed();
    for (const el of await this.teamMenuItem.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      if (text.includes(teamName)) {
        await el.click();
        await this.isTeamSelected(teamName);
        await this.teamOptionsMenuButton.click();
        await this.deleteTeamMenuItem.click();
        await this.deleteTeamButton.click();
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
        await expect(this.teamSelector).toHaveText("Your Penpot");
        await this.teamSelector.click();
      }
    }
    await this.teamSelector.click();
  }

  async isTeamDeleted(teamName) {
    await this.openTeamsListIfClosed();
    for (const el of await this.teamMenuItem.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      await expect(text).not.toEqual(teamName);
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
    await expect(this.librariesAndTemplatesSectionCollapsed).toBeVisible();
  }

  async minimizeLibrariesAndTemplatesCarouselIfExpanded() {
    if (await this.librariesAndTemplatesSection.isVisible()) {
      await this.clickLibrariesAndTemplatesCarouselButton();
    }
  }

  async flipRightLibrariesAndTemplatesCarousel() {
    await this.librariesAndTemplatesSectionRightArrowButton.click();
    await this.header.hover();
  }

  async flipLeftLibrariesAndTemplatesCarousel() {
    await this.librariesAndTemplatesSectionLeftArrowButton.click();
    await this.header.hover();
  }

  async openFile() {
    await this.fileTile.dblclick();
  }

  async openSecondFile() {
    await this.secondFileTile.dblclick();
  }

  async importSharedLibrary(libraryName) {
    await this.page
      .locator(`div[class="card-name"] span:has-text('${libraryName}')`)
      .click();
    await this.continueButton.click();
    await this.acceptButton.click();
  }

  async importFile(file) {
    await this.projectOptions.click();
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.fileImport.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalTitle).toHaveText("Import Penpot files");
    await this.modalAcceptButton.click();
    await this.feedbackBanner.waitFor('visible');
    await expect(this.feedbackBannerMessage).toHaveText("1 file has been imported successfully.");
    await this.modalAcceptButton.click();
  }

  async importAndOpenFile(file) {
    await this.importFile(file);
    await this.openFile();
  }
};
