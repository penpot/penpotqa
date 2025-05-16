const { expect } = require('@playwright/test');
const { BasePage } = require('../base-page');

exports.DashboardPage = class DashboardPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Files
    this.numberOfFilesText = page.locator(
      'div[class*="project-name-wrapper"] span[class*="projects__info"]',
    );
    this.fileTile = page.locator(
      'div[class*="dashboard-grid"] div[class*="grid-item-th"]',
    );
    this.fileNameTitle = page.locator('div[class*="item-info"] h3');
    this.deleteFileMenuItem = page.getByTestId('file-delete');
    this.deleteFileButton = page.locator(
      'input[value="Delete files"],input[value="Delete file"]',
    );
    this.deleteFileModalWindow = page.locator(
      'div[class*="delete_shared__modal-container"]',
    );
    this.createFileButtonPlaceholder = page
      .locator('[class*="empty-project-container"]')
      .getByTitle('Add file');
    this.createFileButtonOldPlaceholder = page.locator(
      'div[class*="dashboard-grid"] button[class*="create-new"]',
    );
    this.moveButton = page.getByRole('button', {
      name: 'Move',
    });
    this.createFileButtonTitlePanel = page.getByTestId('project-new-file');
    this.createFileButtonDraftsTab = page.getByTestId('new-file');
    this.renameFileMenuItem = page.getByTestId('file-rename');
    this.duplicateFileMenuItem = page.getByTestId('file-duplicate');
    this.addFileAsSharedLibraryMenuItem = page.getByTestId('file-add-shared');
    this.addFileAsSharedLibraryButton = page.getByRole('button', {
      name: 'Add as Shared Library',
    });
    this.sharedLibraryIcon = page.locator('svg[class="icon-library"]');
    this.delFileAsSharedLibraryMenuItem = page.getByTestId('file-del-shared');
    this.delFileAsSharedLibraryButton = page.getByRole('button', {
      name: 'Unpublish',
    });
    this.moveToFileMenuItem = page.getByTestId('file-move-to');
    this.moveToOtherTeamMenuItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Move to other team' });
    this.dashboardLibraryItem = page
      .getByRole('button', { name: 'New File 1' })
      .locator(`div[class*="dashboard_grid__library"]`);
    this.downloadFilePenpotMenuItem = page.getByTestId('download-binary-file');
    this.dashboardSection = page.locator('[class="main_ui_dashboard__dashboard"]');
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page
      .getByRole('button', { name: 'Close' })
      .getByText('Close', { exact: true });
    this.fileNameInput = page.locator('div[class*="edit-wrapper"]');
    this.fileOptionsMenuButton = page.locator('div[class*="project-th-icon"] svg');
    this.headerOptionsMenuButton = page.locator(
      'div[title="Options"] svg[class*="files__menu-icon"]',
    );

    //Projects
    this.addProjectButton = page.getByTestId('new-project-button');
    this.projectNameInput = page.locator(
      'div[class*="project-name-wrapper"] div[class*="edit-wrapper"]',
    );
    this.projectNameTitle = page.locator('div[class*="project-name-wrapper"] h2');
    this.deleteProjectMenuItem = page.getByTestId('project-delete');
    this.deleteProjectButton = page.locator(
      'input[value="Delete files"],input[value="Delete project"]',
    );
    this.renameProjectMenuItem = page.getByTestId('project-rename');
    this.duplicateProjectMenuItem = page.getByTestId('project-duplicate');
    this.pinUnpinProjectButton = page.getByRole('button', { name: 'Pin/Unpin' });
    this.projectOptionsMenuButton = page.getByTestId('project-options');
    this.projectsSidebarItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Projects' });
    this.draftsSidebarItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Drafts' });
    this.librariesSidebarItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Libraries' });
    this.pinnedProjectsSidebarItem = page.getByTestId('pinned-projects');
    this.searchInput = page.locator('#search-input');
    this.projectOptions = page.getByTestId('project-options').first();

    // Import files
    this.fileImport = page.getByTestId('file-import');
    this.importModal = page.locator('div[class*="import__modal-container"]');
    this.modalTitle = page.locator('h2[class*="modal-title"]');
    this.modalAcceptButton = page.locator(
      'div[class*="modal-footer"] input[class*="accept-btn"]',
    );
    this.feedbackBanner = page.locator('aside[class*="main_ui_notifications"]');
    this.feedbackBannerMessage = page.locator(
      'div[class*="main_ui_notifications_context_notification__context-text"]',
    );

    //Fonts
    this.fontsSidebarItem = page.getByTestId('fonts');
    this.uploadFontSelector = page.locator('#font-upload');
    this.addCustomFontButton = page.getByRole('button', {
      name: 'Add custom font',
      exact: true,
    });
    this.uploadFontButton = page.getByRole('button', {
      name: 'Upload',
      exact: true,
    });
    this.fontNameTableCell = page.locator(
      'div[class*="installed-fonts"] div[class*="table-row"] div[class*="dashboard_fonts__family"]',
    );
    this.fontStyleTableCell = page.locator(
      'div[class*="installed-fonts"] div[class*="table-row"] div[class*="dashboard_fonts__variants"]',
    );
    this.fontOptionsMenuButton = page.locator(
      'div[class*="fonts__options"] svg[class="icon-menu"]',
    );
    this.editFontMenuItem = page.locator('#font-edit');
    this.deleteFontMenuItem = page.locator('#font-delete');
    this.deleteFontButton = page.getByRole('button', { name: 'Delete' });
    this.cancelDeleteFontButton = page.getByRole('button', { name: 'Cancel' });
    this.fontsTablePlaceholder = page.locator(
      'div[class*="fonts-placeholder"] div[class*="label"]',
    );
    this.fontNameInput = page.locator('div[class*="table-row"] input[type="text"]');
    this.saveFontButton = page.getByRole('button', { name: 'Save' });
    this.searchFontInput = page.getByPlaceholder('Search font');
    this.fontFormatError = this.successMessage;

    //Libraries & Templates
    this.noLibrariesPlacelder = page.getByText('No libraries yet.');

    // Onboarding
    this.onboardingContinueBtn = page.locator(
      'button[class="main_ui_onboarding_newsletter__accept-btn"]',
    );
    this.onboardingHeader = page.locator('h1[data-testid="onboarding-welcome"]');
    this.planingToUsingDropdown = page.locator('div[class*="custom-select"]');
    this.planingToUsingDropdownLabel = page
      .locator('div[class*="custom-select"] span')
      .first();
    this.planingOtherInput = page.locator('#planning-other');
    this.toolOtherInput = page.locator('#experience-design-tool-other[type="text"]');
    this.responsabilityOtherInput = page.locator('#role-other');
    this.roleOtherInput = page.locator('#responsability-other');
    this.startWithOtherInput = page.locator('#start-with-other[type="text"]');
    this.refererOtherInput = page.locator('#referer-other[type="text"]');
    this.nextButton = page.locator('button[label="Next"]');
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.startButton = page.getByRole('button', { name: 'Start' });
    this.figmaTool = page.locator('//input[@id="experience-design-tool-figma"]/..');
    this.toolsButton = page.locator(
      'label[class*="components_forms__radio-label-image"]',
    );
    this.onboardingNewsHeader = page.locator(
      '*[data-testid="onboarding-newsletter-title"]',
    );
    this.onboardingNewsUpdatesCheckbox = page.locator(
      'label[for="newsletter-updates"]',
    );
    this.onboardingNewsCheckbox = page.locator('label[for="newsletter-news"]');
    this.onboardingCreateTeamInput = page.locator('input[class*="team-name-input"]');
    this.onboardingContinueCreateTeamBtn = page.locator(
      'button[label="Continue creating team"]',
    );
    this.onboardingContinueWithoutTeamBtn = page
      .getByRole('button')
      .filter({ hasText: 'Continue without team' });
    this.onboardingInviteInput = page.locator(
      'input[class*="components_forms__inside-input"]',
    );
    this.onboardingCreateTeamButton = page.locator(
      'button[class*="main_ui_onboarding_team_choice__accept-button"]',
    );
    this.selectedRadioButtonLabel = page
      .locator('label[class*="components_forms__radio-label checked"]')
      .first();
    this.selectedRadioImageLabel = page
      .locator('label[class*="checked"] span[class*="text"]')
      .first();
    this.onboardingPaginator = page.locator(
      'div[class*="onboarding_questions__paginator"]',
    );
    this.onboardingLetsGoBtn = page.getByRole('button', {
      name: 'Continue',
      exact: true,
    });
    this.onboardingFirstHeader = page.locator(
      '*[class*="onboarding_questions__modal-title"]',
    );
    this.whatNewsHeader = page.getByText('What’s new in Penpot?', { exact: true });
    this.pluginModalHeader = page.getByText(
      'Build Plugins and enhance your workflow',
      { exact: true },
    );
    this.pluginModalContinueBtn = page.getByRole('button', { name: 'Continue' });
    this.pluginModalGoBtn = page.getByRole('button', { name: "Let's go" });

    // Comment notifications
    this.notificationButton = page.getByTestId('open-comments');
    this.unreadNotification = this.notificationButton.locator(
      'div[class*="comments__unread"]',
    );

    this.notificationReplyUserName = page.locator(
      'div[class*="comments__author-fullname"]',
    );
    this.notificationReplyText = page.locator('[class*="comments__comment-text"]');
    this.notificationUnreadReplyCount = page.locator(
      '[class*="comments__replies-unread"]',
    );

    this.notificationMarkAllAsReadButton = page.getByRole('button', {
      name: 'Mark all as read',
    });
    this.noNotificationsMessage = page.getByText("You're all caught up!");
    this.markedAllNotifsAsReadMessage = page.getByText(
      'Marked all notifications as read',
      { exact: true },
    );
  }

  async createFileViaPlaceholder() {
    await this.createFileButtonPlaceholder.first().click();
  }

  async createFileViaProjectPlaceholder() {
    await this.createFileButtonOldPlaceholder.first().click();
  }

  async createFileViaTitlePanel() {
    await this.createFileButtonTitlePanel.first().click({ force: true });
  }

  async deleteFileViaRightclick() {
    await this.fileTile.click({ button: 'right' });
    await this.deleteFileMenuItem.click();
    await this.deleteFileButton.click();
  }

  async deleteFileViaOptionsIcon() {
    await this.fileTile.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
    await this.deleteFileMenuItem.click();
    await this.deleteFileButton.click();
  }

  async deleteFiles() {
    let counter = 0;
    while (await this.fileTile.count()) {
      await this.fileTile.first().click({ button: 'right' });
      await this.deleteFileMenuItem.click();
      await this.deleteFileButton.click();
      counter++;
    }
    await expect(this.fileTile).toHaveCount(0);
  }

  async deleteFilesIfExist() {
    await this.numberOfFilesText.waitFor();
    const text = (await this.numberOfFilesText.innerText()).valueOf();
    if (!text.includes('0 files')) {
      await this.deleteFiles();
    }
  }

  async deleteProjectViaRightclick() {
    await this.projectNameTitle.first().click({ button: 'right' });
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
      if (!name.includes('Drafts')) {
        await project.click({ button: 'right' });
        await this.deleteProjectMenuItem.click();
        await this.deleteProjectButton.click();
      }
    }
    await expect(this.projectNameTitle).toHaveCount(1);
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState('networkidle');
  }

  async isDashboardOpenedAfterLogin() {
    await this.page.waitForURL(/.*dashboard\/recent\?team-id/, {
      waitUntil: 'load',
    });
  }

  async checkNumberOfFiles(numberOfFiles) {
    await expect(this.numberOfFilesText.first()).toHaveText(numberOfFiles);
  }

  async renameFile(newFileName, byRightClick = true) {
    let text = await this.fileNameTitle.textContent();
    if (byRightClick) {
      await this.fileTile.click({ button: 'right' });
    } else {
      await this.clickOnFileOptions();
    }
    await this.renameFileMenuItem.click();
    await this.fileNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press('Backspace');
    }
    await this.fileNameInput.pressSequentially(newFileName);
    await this.page.keyboard.press('Enter');
    await this.isFilePresent(newFileName);
  }

  async isFilePresent(fileName) {
    await expect(this.fileNameTitle).toHaveText(fileName);
  }

  async duplicateFileViaRightclick() {
    await this.fileTile.click({ button: 'right' });
    await this.duplicateFileMenuItem.click();
  }

  async duplicateFileViaOptionsIcon() {
    await this.clickOnFileOptions();
    await this.duplicateFileMenuItem.click();
  }

  async addFileAsSharedLibraryViaRightclick() {
    await this.fileTile.click({ button: 'right' });
    await this.addFileAsSharedLibraryMenuItem.click();
    await this.addFileAsSharedLibraryButton.click();
  }

  async clickOnFileOptions() {
    await this.fileTile.first().hover();
    await this.fileOptionsMenuButton.first().hover();
    await this.fileOptionsMenuButton.first().click();
  }

  async addFileAsSharedLibraryViaOptionsIcon() {
    await this.clickOnFileOptions();
    await this.addFileAsSharedLibraryMenuItem.click();
    await this.addFileAsSharedLibraryButton.click();
  }

  async deleteFileAsSharedLibraryViaRightclick() {
    await this.fileTile.click({ button: 'right' });
    await this.delFileAsSharedLibraryMenuItem.click();
    await this.delFileAsSharedLibraryButton.click();
  }

  async deleteFileAsSharedLibraryViaOptionsIcon() {
    await this.clickOnFileOptions();
    await this.delFileAsSharedLibraryMenuItem.click();
    await this.delFileAsSharedLibraryButton.click();
  }

  async isSharedLibraryIconDisplayed() {
    await expect(this.sharedLibraryIcon).toBeVisible();
  }

  async isSharedLibraryIconNotDisplayed() {
    await expect(this.sharedLibraryIcon).not.toBeVisible();
  }

  async downloadFileViaRightClick() {
    await this.fileTile.click({ button: 'right' });
    await this.downloadFilePenpotMenuItem.click();

    await this.page.waitForEvent('download');
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadFileViaOptionsIcon() {
    await this.clickOnFileOptions();
    await this.downloadFilePenpotMenuItem.click();

    await this.page.waitForEvent('download');
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async clickAddProjectButton() {
    await this.addProjectButton.click();
  }

  async setProjectName(newProjectName) {
    await this.projectNameInput.pressSequentially(newProjectName);
    await this.page.keyboard.press('Enter');
  }

  async isProjectTitleDisplayed(newProjectName) {
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async createProject(name) {
    await this.clickAddProjectButton();
    await this.setProjectName(name);
    await this.isProjectTitleDisplayed(name);
  }

  async renameProjectViaRightClick(newProjectName) {
    let text = await this.projectNameTitle.first().textContent();
    await this.projectNameTitle.first().click({ button: 'right' });
    await this.renameProjectMenuItem.click();
    await this.projectNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press('Backspace');
    }
    await this.projectNameInput.pressSequentially(newProjectName);
    await this.page.keyboard.press('Enter');
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async renameProjectViaOptionsIcon(newProjectName) {
    let text = await this.projectNameTitle.first().textContent();
    await this.projectNameTitle.first().hover();
    await this.projectOptionsMenuButton.first().click({ force: true });
    await this.renameProjectMenuItem.click();
    await this.projectNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press('Backspace');
    }
    await this.projectNameInput.pressSequentially(newProjectName);
    await this.page.keyboard.press('Enter');
    await expect(this.projectNameTitle.first()).toHaveText(newProjectName);
  }

  async duplicateProjectViaRightclick() {
    await this.projectNameTitle.first().click({ button: 'right' });
    await this.duplicateProjectMenuItem.click();
  }

  async duplicateProjectViaOptionsIcon() {
    await this.projectNameTitle.first().hover();
    await this.projectOptionsMenuButton.first().click({ force: true });
    await this.duplicateProjectMenuItem.click();
  }

  async openSidebarItem(item) {
    switch (item) {
      case 'Projects':
        await this.projectsSidebarItem.click();
        break;
      case 'Drafts':
        await this.draftsSidebarItem.click();
        break;
      case 'Fonts':
        await this.fontsSidebarItem.click();
        break;
      case 'Libraries':
        await this.librariesSidebarItem.click();
        break;
    }
    await expect(this.header).toHaveText(item);
  }

  async openProjectFromLeftSidebar(projectName) {
    const projectSel = await this.page.locator(
      `div[data-testid="pinned-projects"] span[class*="element-title"]:has-text("${projectName}")`,
    );
    await projectSel.click();
    await this.isHeaderDisplayed(projectName);
  }

  async pinProjectByName(projectName) {
    const projectSel = await this.page.locator(
      `//*[@title='${projectName}']/../../../div[contains(@class,'projects__grid-container')]/..//button[contains(@class,'main_ui_dashboard_pin_button__button')]`,
    );
    await projectSel.click();
  }

  async checkNoLibrariesExist() {
    await expect(this.noLibrariesPlacelder).toContainText('No libraries yet.');
  }

  async clickUnpinProjectButton() {
    await this.projectNameTitle.first().hover();
    await expect(this.pinUnpinProjectButton).toHaveClass(
      'main_ui_dashboard_projects__pin-button main_ui_dashboard_pin_button__button main_ui_dashboard_pin_button__button-active',
    );
    await this.pinUnpinProjectButton.click();
    await expect(this.pinUnpinProjectButton).toHaveClass(
      'main_ui_dashboard_projects__pin-button main_ui_dashboard_pin_button__button ',
    );
  }

  async clickPinProjectButton() {
    await this.projectNameTitle.first().hover();
    await expect(this.pinUnpinProjectButton).toHaveClass(
      'main_ui_dashboard_projects__pin-button main_ui_dashboard_pin_button__button ',
    );
    await this.pinUnpinProjectButton.click();
    await expect(this.pinUnpinProjectButton).toHaveClass(
      'main_ui_dashboard_projects__pin-button main_ui_dashboard_pin_button__button main_ui_dashboard_pin_button__button-active',
    );
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
    await this.uploadFontButton.waitFor({ state: 'hidden' });
  }

  async uploadFontWithInvalidFormat(filePath) {
    const fontName = filePath.split('/')[1];
    const warning = `The font '${fontName}' could not be loaded`;
    await this.uploadFontSelector.setInputFiles(filePath);
    await expect(this.fontFormatError).toHaveText(warning);
  }

  async isFontExists(fontName, fontStyle) {
    await expect(this.fontNameTableCell).toHaveText(fontName);
    await expect(this.fontStyleTableCell).toHaveText(fontStyle);
  }

  async isFontNotExist(fontName) {
    await expect(this.fontNameTableCell).not.toHaveText(fontName);
  }

  async deleteFont() {
    await this.fontOptionsMenuButton.click();
    await this.deleteFontMenuItem.click();
    await this.deleteFontButton.click();
  }

  async cancelDeleteFont() {
    await this.fontOptionsMenuButton.click();
    await this.deleteFontMenuItem.click();
    await this.cancelDeleteFontButton.click();
  }

  async isFontsTablePlaceholderDisplayed(text) {
    await expect(this.fontsTablePlaceholder).toHaveText(text);
  }

  async editFont(newFontName) {
    await this.fontOptionsMenuButton.click();
    await this.editFontMenuItem.click();
    await this.fontNameInput.fill(newFontName);
    await this.saveFontButton.click();
  }

  async searchFont(fontName) {
    await this.searchFontInput.pressSequentially(fontName);
    await expect(this.fontNameTableCell).toHaveCount(1);
  }

  async openFile() {
    await this.fileTile.dblclick();
  }

  async importFileProcessingSuccess(file) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.fileImport.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
    await this.confirmFileImport();
  }

  async confirmFileImport() {
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalTitle).toHaveText('Import Penpot files');
    await this.modalAcceptButton.click();
    await this.feedbackBannerMessage.waitFor({ timeout: 60000 });
    await expect(this.feedbackBannerMessage).toHaveText(
      '1 file has been imported successfully.',
    );
    await this.modalAcceptButton.click();
  }

  async importFileProcessingError(file) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.fileImport.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalTitle).toHaveText('Import Penpot files');
    await expect(this.importErrorMessage).toHaveText(
      "Oops! We couldn't import this file",
    );
    await this.modalCancelButton.click();
  }

  async importFileUploadError(file) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.fileImport.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalTitle).toHaveText('Import Penpot files');
    await this.modalAcceptButton.click();
    await this.feedbackBannerMessage.waitFor({ timeout: 60000 });
    await expect(this.feedbackBannerMessage).toHaveText(
      'Not all files have been imported',
    );
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

  async importFileWithInvalidFile(file) {
    await this.projectOptions.click();
    await this.importFileUploadError(file);
  }

  async importAndOpenFile(file) {
    await this.importFile(file);
    await this.openFile();
  }
  async openFileWithName(name) {
    const fileTitle = this.page.getByRole('button', { name: name });
    await fileTitle.first().dblclick();
  }

  async isFileVisibleByName(name) {
    const elem = this.page.getByRole('button', { name: name });
    await expect(elem.first()).toBeVisible();
  }

  async deleteFileWithNameViaRightClick(name) {
    const elem = this.page.getByRole('button', { name: name }).first();
    await elem.click({ button: 'right' });
    await this.deleteFileMenuItem.click();
  }

  async clickDeleteFileButton() {
    await this.deleteFileButton.click();
  }

  async moveFileToOtherTeamViaRightClick(fileName, otherTeamName) {
    const elem = this.page.getByRole('button', { name: fileName }).first();
    await elem.click({ button: 'right' });
    await expect(this.moveToFileMenuItem).toBeVisible();
    await this.moveToFileMenuItem.click();
    await this.moveToOtherTeamMenuItem.click();
    await this.page
      .locator(`//li[@role="menuitem"]/a[text()="${otherTeamName}"]`)
      .click();
    await this.page.locator(`//li[@role="menuitem"]/a[text()="Drafts"]`).click();
  }

  async clickOnMoveButton() {
    await this.moveButton.click();
  }

  async addFileWithNameAsSharedLibraryViaRightClick(fileName) {
    const elem = this.page.getByRole('button', { name: fileName }).first();
    await elem.click({ button: 'right' });
    await this.addFileAsSharedLibraryMenuItem.click();
    await this.addFileAsSharedLibraryButton.click();
  }

  async isFilePresentWithName(fileName) {
    const fileNameTitle = this.page
      .getByRole('button', { name: fileName })
      .locator(`div[class*="item-info"] h3`);
    await expect(fileNameTitle).toHaveText(fileName);
  }

  async renameFileWithNameViaRightClick(oldFileName, newFileName) {
    const fileTitle = this.page.getByRole('button', { name: oldFileName }).first();
    let text = await fileTitle.textContent();
    await fileTitle.click({ button: 'right' });
    await this.renameFileMenuItem.click();
    await this.fileNameInput.click();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press('Backspace');
    }
    await this.fileNameInput.pressSequentially(newFileName);
    await this.page.keyboard.press('Enter');
    await this.isFilePresentWithName(newFileName);
  }

  async clickOnOnboardingContinueBtn() {
    await this.onboardingContinueBtn.click();
    await this.page.waitForResponse(
      (response) =>
        response.url() ===
          `${process.env.BASE_URL}api/rpc/command/push-audit-events` &&
        response.status() === 200,
    );
  }

  async clickOnLetsGoBtn() {
    await this.onboardingLetsGoBtn.click();
  }
  async skipWhatNewsPopUp() {
    if (
      (await this.whatNewsHeader.isVisible()) &&
      (await this.onboardingLetsGoBtn.isVisible())
    ) {
      await this.clickOnLetsGoBtn();
    }
  }

  async skipPluginsPopUp() {
    if (
      (await this.pluginModalHeader.isVisible()) &&
      (await this.pluginModalContinueBtn.isVisible())
    ) {
      await this.clickOnPluginContinueBtn();
      await this.clickOnPluginGoBtn();
    }
  }

  async clickOnPluginContinueBtn() {
    await this.pluginModalContinueBtn.click();
  }

  async clickOnPluginGoBtn() {
    await this.pluginModalGoBtn.click();
  }

  async checkOnboardingWelcomeHeader(text) {
    await expect(this.onboardingHeader.first()).toHaveText(text);
  }

  async selectPlaningToUsing(option) {
    await this.planingToUsingDropdown.click();
    const optionSelector = await this.page.locator(`li span:has-text("${option}")`);
    await optionSelector.click();
  }

  async clickOnNextButton() {
    await this.nextButton.click();
  }

  async clickOnPrevButton() {
    await this.previousButton.click();
  }

  async clickOnStartButton() {
    await expect(this.startButton).not.toHaveAttribute('disabled');
    await this.startButton.click();
    await expect(this.startButton).toBeHidden();
  }

  async fillSecondOnboardPage(branding, visual, wireframes) {
    await this.page
      .locator(
        `//input[@id="experience-branding-illustrations-marketing-pieces-${branding}"]/..`,
      )
      .click();
    await this.page
      .locator(
        `//input[@id="experience-interface-design-visual-assets-design-systems-${visual}"]/..`,
      )
      .click();
    await this.page
      .locator(
        `//input[@id="experience-interface-wireframes-user-journeys-flows-navigation-trees-${wireframes}"]/..`,
      )
      .click();
    await this.nextButton.click();
  }

  async selectFigmaTool() {
    await this.figmaTool.click();
  }

  async selectTeamSize(option) {
    await this.planingToUsingDropdown.last().click();
    const optionSelector = await this.page.locator(`li span:has-text("${option}")`);
    await optionSelector.click();
  }

  async isOnboardingNewsHeaderDisplayed() {
    await expect(this.onboardingNewsHeader).toBeVisible();
  }

  async isOnboardingNewsUpdatesCheckboxDisplayed() {
    await expect(this.onboardingNewsUpdatesCheckbox).toBeVisible();
  }

  async isOnboardingNewsCheckboxDisplayed() {
    await expect(this.onboardingNewsCheckbox).toBeVisible();
  }

  async clickOnOnboardingContinueCreateTeamButton() {
    await this.onboardingContinueCreateTeamBtn.click();
  }

  async enterOnboardingTeamName(name) {
    await this.onboardingCreateTeamInput.fill(name);
  }

  async enterOnboardingInviteEmails(name) {
    await this.onboardingInviteInput.fill(name);
  }

  async clickOnOnboardingCreateTeamButton() {
    await this.onboardingCreateTeamButton.click();
  }

  async fillOnboardingQuestions() {
    await this.isOnboardingFirstQuestionsVisible();
    await this.selectRadioButton('Work');
    await this.selectDropdownOptions('Testing before self-hosting');
    await this.clickOnNextButton();
    await this.selectFigmaTool();
    await this.clickOnNextButton();
    await this.selectKindOfWork('Development');
    await this.selectRole('Team member');
    await this.selectTeamSize('11-30');
    await this.clickOnNextButton();
    await this.selectGetStartedQuestion('Prototyping');
    await this.clickOnNextButton();
    await this.selectRadioButton('YouTube');
    await this.clickOnStartButton();
    await this.clickOnOnboardingContinueBtn();
    await this.clickOnOnboardingContinueWithoutTeamButton();
    await this.skipWhatNewsPopUp();
    await this.skipPluginsPopUp();
  }

  async fillOnboardingFirstQuestions() {
    await this.isOnboardingFirstQuestionsVisible();
    await this.selectRadioButton('Work');
    await this.selectDropdownOptions('Testing before self-hosting');
    await this.clickOnNextButton();
    await this.selectFigmaTool();
    await this.clickOnNextButton();
    await this.selectKindOfWork('Development');
    await this.selectRole('Team member');
    await this.selectTeamSize('11-30');
    await this.clickOnNextButton();
    await this.selectGetStartedQuestion('Prototyping');
    await this.clickOnNextButton();
    await this.selectRadioButton('YouTube');
    await this.clickOnStartButton();
  }

  async isOnboardingFirstQuestionsVisible() {
    await expect(this.onboardingFirstHeader).toHaveText('Help us get to know you');
  }

  async selectRadioButton(name) {
    await this.page
      .locator(`label[class*="radio-label"]:has-text("${name}") span`)
      .first()
      .click();
  }

  async selectGetStartedQuestion(name) {
    await this.page
      .locator(`span[class*="forms__image-text"]:has-text("${name}")`)
      .click();
  }

  async selectDropdownOptions(option) {
    await this.planingToUsingDropdown.click();
    const optionSelector = await this.page.locator(`li span:has-text("${option}")`);
    await optionSelector.click();
  }

  async selectLastDropdownOptions() {
    await this.planingToUsingDropdown.click();
    const optionSelector = await this.page
      .locator(`li span[class*="select__label"]`)
      .last();
    await optionSelector.click();
  }

  async selectLastTool() {
    await this.toolsButton.last().click();
  }

  async checkDropdownValue(value) {
    await expect(this.planingToUsingDropdownLabel).toHaveText(value);
  }

  async checkRadioButtonLabel(value) {
    await expect(this.selectedRadioButtonLabel).toHaveText(value);
  }

  async checkRadioImageLabel(value) {
    await expect(this.selectedRadioImageLabel).toHaveText(value);
  }

  async selectKindOfWork(option) {
    await this.planingToUsingDropdown.first().click();
    const optionSelector = await this.page.locator(`li span:has-text("${option}")`);
    await optionSelector.click();
  }

  async selectRole(option) {
    await this.planingToUsingDropdown.nth(1).click();
    const optionSelector = await this.page.locator(`li span:has-text("${option}")`);
    await optionSelector.click();
  }

  async clickOnOnboardingContinueWithoutTeamButton() {
    if (await this.onboardingContinueWithoutTeamBtn.isVisible()) {
      await this.onboardingContinueWithoutTeamBtn.click();
      await this.page.waitForResponse(
        (response) =>
          response.url() ===
            `${process.env.BASE_URL}api/rpc/command/push-audit-events` &&
          response.status() === 200,
      );
    }
  }

  async isPlaningOtherInputVisible() {
    await expect(this.planingOtherInput).toBeVisible();
  }

  async enterPlaningOther(value) {
    await this.planingOtherInput.fill(value);
  }

  async isToolOtherInputVisible() {
    await expect(this.toolOtherInput).toBeVisible();
  }

  async enterOtherToolName(value) {
    await this.toolOtherInput.fill(value);
  }

  async isRoleOtherInputVisible() {
    await expect(this.roleOtherInput).toBeVisible();
  }

  async enterOtherRoleName(value) {
    await this.roleOtherInput.fill(value);
  }

  async isStartWithOtherInputVisible() {
    await expect(this.startWithOtherInput).toBeVisible();
  }

  async enterOtherStartWith(value) {
    await this.startWithOtherInput.fill(value);
  }

  async isKindOfWorkOtherInputVisible() {
    await expect(this.responsabilityOtherInput).toBeVisible();
  }

  async enterOtherKindOfWork(value) {
    await this.responsabilityOtherInput.fill(value);
  }

  async isReferOtherInputVisible() {
    await expect(this.refererOtherInput).toBeVisible();
  }

  async enterOtherRefer(value) {
    await this.refererOtherInput.fill(value);
  }

  async isNextBtnDisabled() {
    await expect(this.nextButton).toBeDisabled();
  }

  async isStartBtnDisabled() {
    await expect(this.startButton).toBeDisabled();
  }

  async selectLastKindOfWork() {
    await this.planingToUsingDropdown.first().click();
    const optionSelector = await this.page
      .locator(`li span[class*="select__label"]`)
      .last();
    await optionSelector.click();
  }

  async selectLastRole() {
    await this.planingToUsingDropdown.nth(1).click();
    const optionSelector = await this.page
      .locator(`li span[class*="select__label"]`)
      .last();
    await optionSelector.click();
  }

  async selectLastGetStartedQuestion() {
    await this.page.locator(`span[class*="forms__image-text"]`).last().click();
  }

  async selectLastRadioButton() {
    await this.page.locator(`label[class*="radio-label"] span`).last().click();
  }

  async checkPageNumber(number) {
    await expect(this.onboardingPaginator).toHaveText(`${number}/5`);
  }

  async waitForCreateFilePlaceholderVisible() {
    await this.createFileButtonPlaceholder.first().waitFor({ state: 'visible' });
  }

  async isOptionButtonFromDraftPageVisible(visible = true) {
    visible
      ? await expect(this.headerOptionsMenuButton).toBeVisible()
      : await expect(this.headerOptionsMenuButton).not.toBeVisible();
  }

  async isCreateFileOnDraftsTabButtonVisible(visible = true) {
    visible
      ? await expect(this.createFileButtonDraftsTab.first()).toBeVisible()
      : await expect(this.createFileButtonDraftsTab.first()).not.toBeVisible();
  }

  async isAddCustomFontButtonVisible(visible = true) {
    visible
      ? await expect(this.addCustomFontButton).toBeVisible()
      : await expect(this.addCustomFontButton).not.toBeVisible();
  }

  async isAddProjectButtonVisible(visible = true) {
    visible
      ? await expect(this.addProjectButton).toBeVisible()
      : await expect(this.addProjectButton).not.toBeVisible();
  }

  async isUnreadNotificationVisible(visible = true) {
    visible
      ? await expect(this.unreadNotification).toBeVisible()
      : await expect(this.unreadNotification).not.toBeVisible();
  }

  async clickOnNotificationButton() {
    await this.notificationButton.click();
  }

  async checkNotificationReplyUserName(text) {
    await expect(this.notificationReplyUserName).toHaveText(text);
  }

  async checkNotificationReplyText(text) {
    await expect(this.notificationReplyText).toHaveText(text);
  }

  async checkNotificationUnreadReplyCount(text) {
    await expect(this.notificationUnreadReplyCount).toHaveText(text);
  }

  async clickFirstNotificationMessage() {
    await this.notificationUnreadReplyCount.first().click();
  }

  async clickOnNotificationMarkAsReadButton() {
    await this.notificationMarkAllAsReadButton.click();
  }

  async isNoNotificationsMessagePresent() {
    await expect(this.noNotificationsMessage).toBeVisible();
  }

  async isMarkedAllNotifsAsReadMessage() {
    await expect(this.markedAllNotifsAsReadMessage).toBeVisible();
  }

  async clickOnModalAcceptButton() {
    await this.modalAcceptButton.click();
  }
};
