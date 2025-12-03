const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');

exports.TeamPage = class TeamPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Teams
    this.teamCurrentBtn = page.locator('button[class*="current-team"]');
    this.teamCurrentBtnWebkit = page
      .locator('button[class*="current-team"] div span')
      .first();
    this.teamList = page.locator('ul[class*="teams-dropdown"]');
    this.createNewTeamMenuItem = page.getByRole('menuitem', {
      name: 'Create new team',
    });
    this.teamNameInput = page.locator('#name');
    this.createNewTeamButton = page.getByRole('button', { name: 'Create new team' });
    this.teamCurrentNameDiv = page.locator(
      'button[class*="current-team"] div[class*="team-name"]',
    );
    this.teamNameLabel = page.locator(
      '//div[text()="Team info"]/following-sibling::div[1]',
    );
    this.teamOptionsMenuButton = page.getByRole('button', {
      name: 'team-management',
    });
    this.deleteTeamMenuItem = page.getByRole('menuitem', { name: 'Delete team' });
    this.deleteTeamButton = page.getByRole('button', { name: 'Delete team' });
    this.teamSettingsMenuItem = page.getByRole('menuitem', { name: 'Settings' });
    this.renameTeamMenuItem = page.getByRole('menuitem', { name: 'Rename' });
    this.uploadTeamImageButton = page.getByLabel('uploader');
    this.updateTeamButton = page.getByRole('button', { name: 'Update team' });
    this.teamOwnerSpan = page.locator(`//*[contains(@class,'owner-icon')]/../span`);
    this.teamMembersSpan = page.locator(
      `//*[contains(@class,'team__user-icon')]/../span`,
    );
    this.teamProjectsSpan = page.locator(
      `//*[contains(@class,'team__group-icon')]/../span`,
    );
    this.teamFilesSpan = page.locator(
      `//*[contains(@class,'team__document-icon')]/../span`,
    );
    this.teamInfoSection = page.locator('//div[text()="Team info"]/..');
    this.teamOwnerSection = page.locator('//div[text()="Team members"]/..');
    this.teamStatsSection = page.locator('//div[text()="Team projects"]/..');
    this.teamInfoHeader = page.getByText('Team info');

    this.membersMenuItem = page.getByRole('menuitem', { name: 'Members' });

    //Invitations
    this.invitationsMenuItem = page.getByRole('menuitem', { name: 'Invitations' });
    this.inviteMembersToTeamButton = page.getByTestId('invite-member');
    this.inviteMembersPopUpHeader = page.locator(
      'div[class*="modal-team-container"] div[class*="title"]',
    );
    this.inviteMembersTeamHeroButton = page.getByRole('button', {
      name: 'Invite members',
    });
    this.inviteMembersToTeamRoleSelectorButton = page.locator(
      'div[class*="custom-select"]',
    );
    this.adminRoleSelector = page.locator('li').filter({ hasText: 'Admin' });
    this.editorRoleSelector = page.locator('li').filter({ hasText: 'Editor' });
    this.viewerRoleSelector = page.locator('li').filter({ hasText: 'Viewer' });
    this.ownerRoleSelector = page.getByRole('listitem').filter({ hasText: 'Owner' });
    this.transferOwnershipButton = page.getByRole('button', {
      name: 'Transfer ownership',
    });
    this.leaveTeamButton = page.getByRole('button', { name: 'Leave team' });
    this.ownerLeaveTeamButton = page.getByRole('button', {
      name: 'Promote and leave',
    });
    this.deleteMemberButton = page.getByRole('button', { name: 'Delete member' });
    this.inviteMembersToTeamEmailInput = page.getByPlaceholder(
      'Emails, comma separated',
    );
    this.sendInvitationButton = page.getByRole('button', {
      name: 'Send invitation',
    });
    this.invitationRecord = page.locator(
      'div[class*="table-rows"] div[class*="table-row"]',
    );
    this.invitationRecordEmailCell = page.locator(
      'div[class*="dashboard_team__field-email"]',
    );
    this.invitationRecordRoleCell = page.locator(
      'span[class*="dashboard_team__rol-label"]',
    );
    this.invitationRecordRoleSelector = page.locator('div[class*="team__has-priv"]');
    this.invitationRecordStatusCell = page.locator(
      'div[class*="dashboard_team__field-status"] aside',
    );
    this.invitationRecordOptionsMenuButton = page.locator(
      'div[class*="main_ui_dashboard_team__table-field"] button',
    );
    this.resendInvitationButton = page
      .getByRole('button')
      .filter({ hasText: 'Resend invitation' });
    this.resendButton = page.getByRole('button', { name: 'Resend', exact: true });
    this.deleteInvitationButton = page.locator('button:has([href="#icon-delete"])');
    this.memberRecordLeaveTeamMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Leave team' });
    this.memberRecordDeleteMemberMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Remove member' });
    this.teamSettingsSection = page.locator('.main_ui_dashboard__dashboard-content');
    this.teamIcon = page.locator(`div[class*='team-icon'] img`);
    this.inviteMessage = page.locator('div[class*="main-message"]');
    this.errorMessage = page.locator('div[class*="desc-message"]').last();
    this.goToYourPenpotButton = page.getByRole('button', {
      name: 'Go to your Penpot',
    });

    // Request Access dialog Locators
    this.requestAccessDialog = page.locator('.main_ui_static__dialog').first();
    this.requestAccessButton = page.getByRole('button', { name: 'REQUEST ACCESS' });
    this.returnHomeButton = page.getByRole('button', { name: 'GO TO YOUR PENPOT' });
    this.firstInvitedEmail = page.locator('span[class*="forms__text"]').first();
    this.requestSentCorrectlyText = this.requestAccessDialog.getByText(
      'Your request has been sent correctly!',
    );
    this.requestSentCorrectlyDescribe = this.requestAccessDialog.getByText(
      "Remember that, if the owner allows it, you're going to be invited to the team.",
    );
    this.closeModalButton = page.locator('svg[class*="icon-close"]');
    this.requestFileAccessText = this.requestAccessDialog.getByText(
      "You don't have access to this file.",
    );
    this.requestFileAccessDescribe = this.requestAccessDialog.getByText(
      'To access this file, you can ask the team owner.',
    );

    // Subscriptions Locators
    this.subscriptionIcon = page.getByTestId('subscription-icon').first();
    this.subscriptionIconInTeamDropdown = page
      .getByRole('menuitem')
      .getByTestId('subscription-icon')
      .first();
    this.enterpriseIcon = this.subscriptionIcon.locator(
      'svg[class*="icon-character-e"]',
    );
    this.unlimitedIcon = this.subscriptionIcon.locator(
      'svg[class*="icon-character-u"]',
    );
    this.teamPlanName = page.locator('[class*="subscription__team-text"]');
    this.teamCurrentBtnText = this.teamCurrentBtn.locator('span[class*="text"]');
  }

  async createTeam(teamName) {
    await this.openTeamsListIfClosed();
    await this.createNewTeamMenuItem.click();
    await this.teamNameInput.fill(teamName);
    await this.createNewTeamButton.click();
    await this.waitForCreateNewTeamButtonToBeHidden(30000);
  }

  async isTeamSelected(teamName, browserName = 'chrome') {
    browserName === 'webkit'
      ? await expect(this.teamCurrentBtnWebkit).toHaveText(teamName)
      : await expect(this.teamCurrentBtnText).toHaveText(teamName);
  }

  async waitForTeamBtn(timeout = 10000) {
    await this.teamCurrentBtnWebkit.waitFor({ state: 'visible', timeout: timeout });
  }

  async waitForCreateNewTeamButtonToBeHidden(timeout = 10000) {
    await this.createNewTeamButton.waitFor({ state: 'hidden', timeout: timeout });
  }

  async openTeamsListIfClosed() {
    if (!(await this.teamList.isVisible())) {
      await this.teamCurrentBtn.click();
    }
    await expect(this.teamList).toBeVisible();
  }

  async switchTeam(teamName) {
    await this.openTeamsListIfClosed();
    const teamOption = this.page
      .getByRole('menuitem')
      .filter({ hasText: teamName })
      .first();
    await teamOption.click();
    await this.isTeamSelected(teamName);
  }

  async deleteTeam(teamName) {
    await this.openTeamsListIfClosed();
    const teamSel = this.page
      .getByRole('menuitem')
      .filter({ hasText: teamName })
      .first();
    if (await teamSel.isVisible()) {
      await teamSel.click();
      await this.isTeamSelected(teamName);
      await this.teamOptionsMenuButton.click();
      await this.deleteTeamMenuItem.click();
      await this.deleteTeamButton.click();
      // Wait for the deletion API call to complete
      await this.page.waitForResponse(
        (response) => response.url().includes('/api/main/methods/delete-team'),
        { timeout: 20000 },
      );
      // Verify the team name is no longer the current team (it should change)
      const currentTeamText = await this.teamCurrentBtn.textContent();
      if (currentTeamText === teamName) {
        throw new Error(`Team ${teamName} was not deleted properly`);
      }
    }
  }

  async deleteTeams(teams) {
    for (const team of teams) {
      await this.deleteTeam(team);
    }
  }

  async isTeamDeleted(teamName) {
    await expect(this.page.getByText('Your Penpot')).toBeVisible({ timeout: 8000 });
    await this.openTeamsListIfClosed();
    for (const el of await this.teamCurrentNameDiv.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      await expect(text).not.toEqual(teamName);
    }
  }

  async openTeamOptionsMenu() {
    await this.teamOptionsMenuButton.click();
  }

  async openMembersPageViaOptionsMenu() {
    await this.teamOptionsMenuButton.click();
    await this.membersMenuItem.click();
    await this.isHeaderDisplayed('Members');
  }

  async openInvitationsPageViaOptionsMenu() {
    await this.teamOptionsMenuButton.click();
    await this.invitationsMenuItem.click();
    await this.isHeaderDisplayed('Invitations');
  }

  async clickInviteMembersToTeamButton() {
    await this.inviteMembersToTeamButton.click();
  }

  async isInviteMembersToTeamButtonDisabled() {
    await expect(this.inviteMembersToTeamButton).not.toBeVisible();
  }

  async isInviteMembersPopUpHeaderDisplayed(title) {
    await expect(this.inviteMembersPopUpHeader).toHaveText(title);
  }

  async clickInviteMembersTeamHeroButton() {
    await this.inviteMembersTeamHeroButton.click();
  }

  async enterEmailToInviteMembersPopUp(email) {
    await this.inviteMembersToTeamEmailInput.fill(email);
  }

  async clickSendInvitationButton() {
    await this.sendInvitationButton.click();
  }

  async isSendInvitationBtnDisabled() {
    await expect(this.sendInvitationButton).toBeDisabled();
  }

  async isSendInvitationWarningExist(text) {
    await expect(this.warningMessageText).toHaveText(text);
  }

  async isInvitationRecordDisplayed(email, role, status) {
    await expect(this.invitationRecordEmailCell).toHaveText(email);
    await expect(this.invitationRecordRoleCell).toHaveText(role);
    await expect(this.invitationRecordStatusCell).toHaveText(status);
  }

  async isMultipleInvitationRecordDisplayed(email, role, status) {
    const emailSelector = `[class*="dashboard_team__field-email"]:has-text("${email}")`;
    const emailLocator = await this.page.locator(emailSelector);
    const roleLocator = await this.page.locator(
      `[class*="table-row-invitations"]:has(${emailSelector}) [class*="dashboard_team__field-roles"] span`,
    );
    const statusLocator = await this.page.locator(
      `[class*="table-row-invitations"]:has(${emailSelector}) [class*="dashboard_team__field-status"] aside`,
    );
    await expect(emailLocator).toHaveText(email);
    await expect(roleLocator).toHaveText(role);
    await expect(statusLocator).toHaveText(status);
  }

  async isMultipleMemberRecordDisplayed(name, email, role) {
    const nameSelector = `//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]`;
    const emailLocator = await this.page.locator(
      `${nameSelector}/following-sibling::div`,
    );
    const roleLocator = await this.page.locator(
      `${nameSelector}/../../following-sibling::div//span`,
    );
    const nameLocator = await this.page.locator(nameSelector);
    await expect(nameLocator).toContainText(name);
    await expect(emailLocator.first()).toHaveText(email);
    await expect(roleLocator).toHaveText(role);
  }

  async changeInvitationRole(email, role) {
    const emailSelector = `[class*="dashboard_team__field-email"]:has-text("${email}")`;
    await this.page
      .locator(
        `[class*="table-row-invitations"]:has(${emailSelector}) [class*="dashboard_team__field-roles"] span`,
      )
      .click();
    switch (role) {
      case 'Admin':
        await this.adminRoleSelector.click();
        break;
      case 'Editor':
        await this.editorRoleSelector.click();
        break;
      case 'Viewer':
        await this.viewerRoleSelector.click();
        break;
    }
  }

  async selectInvitationRoleInPopUp(role) {
    await this.inviteMembersToTeamRoleSelectorButton.click();
    switch (role) {
      case 'Admin':
        await this.adminRoleSelector.click();
        break;
      case 'Editor':
        await this.editorRoleSelector.click();
        break;
      case 'Viewer':
        await this.viewerRoleSelector.click();
        break;
    }
  }

  async selectInvitationRoleInInvitationRecord(role) {
    await this.invitationRecordRoleSelector.click();
    await this.page.locator(`li:has-text('${role}')`).click();
  }

  async selectMemberRoleInPopUp(name, role) {
    const locator = this.page.locator(
      `//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div//span`,
    );
    await locator.click();
    switch (role) {
      case 'Admin':
        await this.adminRoleSelector.click();
        break;
      case 'Editor':
        await this.editorRoleSelector.click();
        break;
      case 'Owner':
        await this.ownerRoleSelector.click();
        break;
      case 'Viewer':
        await this.viewerRoleSelector.click();
        break;
    }
  }

  async isMemberRoleInPopUpNotDisplayed(name, role) {
    const locator = this.page.locator(
      `//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div//span`,
    );
    await locator.click();
    let roleLoc;
    switch (role) {
      case 'Admin':
        roleLoc = await this.adminRoleSelector;
        break;
      case 'Editor':
        roleLoc = await this.editorRoleSelector;
        break;
      case 'Owner':
        roleLoc = await this.ownerRoleSelector;
        break;
      case 'Viewer':
        roleLoc = await this.viewerRoleSelector;
        break;
    }
    await expect(roleLoc).not.toBeVisible();
  }

  async isInvitationRoleInPopUpNotDisplayed(email, role) {
    const emailSelector = `[class*="dashboard_team__field-email"]:has-text("${email}")`;
    await this.page
      .locator(
        `[class*="table-row-invitations"]:has(${emailSelector}) [class*="dashboard_team__field-roles"] span`,
      )
      .click();
    let roleLoc;
    switch (role) {
      case 'Admin':
        roleLoc = await this.adminRoleSelector;
        break;
      case 'Editor':
        roleLoc = await this.editorRoleSelector;
        break;
      case 'Owner':
        roleLoc = await this.ownerRoleSelector;
        break;
      case 'Viewer':
        roleLoc = await this.viewerRoleSelector;
        break;
    }
    await expect(roleLoc).not.toBeVisible();
  }

  async clickOnTransferOwnershipButton() {
    await this.transferOwnershipButton.click();
  }

  async clickOnLeaveTeamButton() {
    await this.leaveTeamButton.click();
  }

  async clickOnPromoteAndLeaveTeamButton() {
    await this.ownerLeaveTeamButton.click();
  }

  async clickOnDeleteMemberButton() {
    await this.deleteMemberButton.click();
  }
  async resendInvitation(email) {
    await this.selectInvitationByEmail(email);
    await this.resendInvitationButton.click();
    await this.resendButton.click();
  }

  async deleteInvitation(email) {
    await this.selectInvitationByEmail(email);
    await this.deleteInvitationButton.click();
    await this.continueButton.click();
  }

  async leaveTeam(teamName, role = 'Admin', name) {
    await this.invitationRecordOptionsMenuButton.first().click();
    await this.memberRecordLeaveTeamMenuItem.click();
    role === 'Owner'
      ? await this.selectMember(name)
      : await this.clickOnLeaveTeamButton();
    await expect(this.teamCurrentBtn).not.toHaveText(teamName);
    await expect(this.teamCurrentBtn).toHaveText('Your Penpot');
  }

  async isInvitationRecordRemoved() {
    await expect(this.invitationRecord).not.toBeVisible();
  }

  async openTeamSettingsPageViaOptionsMenu() {
    await this.teamOptionsMenuButton.click();
    await this.teamSettingsMenuItem.click();
    await this.isHeaderDisplayed('Settings');
  }

  async uploadTeamImage(filePath) {
    await this.uploadTeamImageButton.setInputFiles(filePath);
    await this.page.waitForResponse(
      (response) =>
        response.url() ===
          `${process.env.BASE_URL}api/main/methods/push-audit-events` &&
        response.status() === 204,
    );
  }

  async isTeamOwnerInfoDisplayed(name) {
    await expect(this.teamOwnerSpan).toHaveText(name);
  }

  async isTeamMembersInfoDisplayed(text) {
    await expect(this.teamMembersSpan).toHaveText(text);
  }

  async isTeamProjectsInfoDisplayed(text) {
    await expect(this.teamProjectsSpan).toHaveText(text);
  }

  async isTeamFilesInfoDisplayed(text) {
    await expect(this.teamFilesSpan).toHaveText(text);
  }

  async renameTeam(teamName) {
    await this.teamOptionsMenuButton.click();
    await this.renameTeamMenuItem.click();
    await this.teamNameInput.fill(teamName);
    await this.updateTeamButton.click();
  }

  async hoverOnTeamName() {
    await this.teamInfoHeader.hover();
  }

  async deleteTeamMember(name) {
    const locator = await this.page.locator(
      `//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div/button`,
    );
    await locator.click();
    await this.memberRecordDeleteMemberMenuItem.click();
    await this.clickOnDeleteMemberButton();
    await expect(locator).not.toBeVisible();
  }

  async isDeleteTeamMemberDisabled(name) {
    const locator = await this.page.locator(
      `//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div/button`,
    );
    await expect(locator).not.toBeVisible();
  }

  async isInvitationRecordOptionsDisabled(email) {
    const locator = await this.page.locator(
      `//div[contains(@class, 'dashboard_team__field-email') and contains(text(), '${email}')]/following-sibling::div/button`,
    );
    await expect(locator).not.toBeVisible();
  }

  async selectMember(name) {
    await this.page.locator('span[class*="dropdown-button"]').click();
    await this.page
      .locator(`li span[class*="components_select"]:has-text("${name}")`)
      .click();
    await this.ownerLeaveTeamButton.click();
  }

  async isInviteMessageDisplayed(message) {
    await expect(this.inviteMessage, `Invite message is "${message}"`).toHaveText(
      message,
    );
  }

  async isErrorMessageDisplayed(message) {
    await expect(this.errorMessage, `Error message is "${message}"`).toHaveText(
      message,
    );
  }

  async isGoToPenpotButtonVisible() {
    await expect(
      this.goToYourPenpotButton,
      'Go to your Penpot button is visible',
    ).toBeVisible();
  }

  async clickGoToPenpotButton() {
    await this.goToYourPenpotButton.click();
  }

  async isRequestAccessProjectDialogVisible() {
    await expect(
      this.requestAccessDialog.getByText("You don't have access to this project."),
      'Request Access to Project dialog is visible',
    ).toBeVisible();
  }

  async clickOnRequestAccessButton() {
    await this.requestAccessButton.click();
  }

  async isRequestAccessButtonVisible(visible = true) {
    visible
      ? await expect(this.requestAccessButton).toBeVisible()
      : await expect(this.requestAccessButton).not.toBeVisible();
  }

  async clickReturnHomeButton() {
    await this.returnHomeButton.click();
  }

  async checkFirstInvitedEmail(email) {
    await expect(this.firstInvitedEmail).toHaveText(email);
  }

  async waitForInvitationButtonEnabled(timeout) {
    await expect(this.sendInvitationButton).not.toHaveAttribute('disabled', '', {
      timeout: timeout,
    });
  }

  async checkRequestSentCorrectlyDialog() {
    await expect(this.requestSentCorrectlyText).toBeVisible();
    await expect(this.requestSentCorrectlyDescribe).toBeVisible();
    await expect(this.goToYourPenpotButton).toBeVisible();
    await expect(this.closeModalButton).toBeVisible();
  }

  async isRequestFileAccessDialogVisible() {
    await expect(
      this.requestFileAccessText,
      '"You don\'t have access to this file." message is visible',
    ).toBeVisible();
    await expect(
      this.requestFileAccessDescribe,
      'Description is visible',
    ).toBeVisible();
    await expect(
      this.goToYourPenpotButton,
      'GO TO YOUR PENPOT button is visible',
    ).toBeVisible();
    await expect(
      this.requestAccessButton,
      'REQUEST ACCESS button is visible',
    ).toBeVisible();
    await expect(this.closeModalButton, 'Close button is visible').toBeVisible();
  }

  async assertRenameItemNotVisible() {
    await expect(
      this.renameTeamMenuItem,
      'Rename team button should not be visible',
    ).not.toBeVisible();
  }

  async isSubscriptionIconVisible(visible = true, subscription = 'Unlimited') {
    const icon =
      subscription.toLowerCase() === 'unlimited'
        ? this.unlimitedIcon
        : this.enterpriseIcon;

    visible
      ? await expect(icon).toBeVisible()
      : await expect(icon).not.toBeVisible();
  }

  async isSubscriptionIconVisibleInTeamDropdown(visible = true) {
    await this.openTeamsListIfClosed();
    visible
      ? await expect(this.subscriptionIconInTeamDropdown).toBeVisible()
      : await expect(this.subscriptionIconInTeamDropdown).not.toBeVisible();
  }

  async checkSubscriptionName(name) {
    await expect(this.teamPlanName).toHaveText(name);
  }

  async checkTeamSettingsTabContent() {
    await expect(this.teamIcon).toBeVisible();
    await expect(this.teamNameLabel).toBeVisible();
    await expect(this.teamInfoSection).toBeVisible();
    await expect(this.teamInfoHeader).toBeVisible();
    await this.isTeamProjectsInfoDisplayed('0 projects');
    await this.isTeamFilesInfoDisplayed('0 files');
    await this.checkSubscriptionName('Professional');
  }

  async selectInvitationByEmail(email) {
    await this.page.locator(`label:has([value="${email}"])`).click();
  }
};
