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
    this.teamCurrentBtnWebkit = page.locator('button[class*="current-team"] div span').first();
    this.teamList = page.locator('ul[class*="teams-dropdown"]');
    this.createNewTeamMenuItem = page.locator('#teams-selector-create-team');
    this.teamNameInput = page.locator('#name');
    this.createNewTeamButton = page.getByRole('button', { name: 'Create new team' });
    this.teamCurrentNameDiv = page.locator(
      'button[class*="current-team"] div[class*="team-name"]',
    );
    this.teamNameLabel = page.locator('//div[text()="Team info"]/following-sibling::div[1]');
    this.teamOptionsMenuButton = page.locator('button[class*="switch-options"]');
    this.deleteTeamMenuItem = page.locator('#teams-options-delete-team');
    this.deleteTeamButton = page.locator('input[value="Delete team"]');
    this.teamSettingsMenuItem = page.locator('li[data-testid="team-settings"]');
    this.renameTeamMenuItem = page.locator('li[data-testid="rename-team"]');
    this.uploadTeamImageButton = page.locator('input[type="file"]');
    this.updateTeamButton = page.locator('button:has-text("Update team")');
    this.teamOwnerSpan = page.locator(
      `//*[contains(@class,'owner-icon')]/../span`,
    );
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

    this.membersMenuItem = page.locator('li[data-testid="team-members"]');

    //Invitations
    this.invitationsMenuItem = page.locator('li[data-testid="team-invitations"]');
    this.inviteMembersToTeamButton = page.locator('a[data-testid="invite-member"]');
    this.inviteMembersPopUpHeader = page.locator(
      'div[class*="modal-team-container"] div[class*="title"]',
    );
    this.inviteMembersTeamHeroButton = page.locator(
      'button:has-text("Invite members")',
    );
    this.inviteMembersToTeamRoleSelectorButton = page.locator(
      'div[class*="custom-select"]',
    );
    this.adminRoleSelector = page.locator('li:has-text("Admin")');
    this.editorRoleSelector = page.locator('li:has-text("Editor")');
    this.ownerRoleSelector = page.locator('li:has-text("Owner")');
    this.transferOwnershipButton = page.locator('input[value="Transfer ownership"]');
    this.leaveTeamButton = page.locator('input[value="Leave team"]');
    this.ownerLeaveTeamButton = page.locator('input[value="Promote and leave"]');
    this.deleteMemberButton = page.locator('input[value="Delete member"]');
    this.inviteMembersToTeamEmailInput = page.locator(
      'input[placeholder="Emails, comma separated"]',
    );
    this.sendInvitationButton = page.locator('button:has-text("Send invitation")');
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
    this.invitationRecordResendInvititationMenuItem = page.locator(
      'li:has-text("Resend invitation")',
    );
    this.invitationRecordDeleteInvititationMenuItem = page.locator(
      'li:has-text("Delete invitation")',
    );
    this.memberRecordleaveTeamMenuItem = page.locator(
      'li:has-text("Leave team")',
    );
    this.memberRecordDeleteMemberMenuItem = page.locator(
      'li:has-text("Remove member")',
    );
    this.invitationWarningSpan = page.locator(
      'aside[class*="warning"] div[class*="context_notification"]',
    );
    this.teamSettingsSection = page.locator('.main_ui_dashboard__dashboard-content');
    this.teamIcon = page.locator(`div[class*='team-icon'] img`);
    this.inviteMessage = page.locator('div[class*="main-message"]');
  }

  async createTeam(teamName) {
    await this.openTeamsListIfClosed();
    await this.createNewTeamMenuItem.click();
    await this.teamNameInput.fill(teamName);
    await this.createNewTeamButton.click();
  }

  async isTeamSelected(teamName, browserName = 'chrome') {
    browserName === 'webkit'
      ? await expect(this.teamCurrentBtnWebkit).toHaveText(teamName)
      : await expect(this.teamCurrentBtn).toHaveText(teamName);
  }

  async waitForTeamBtn(timeout = 10000) {
    await this.teamCurrentBtnWebkit.waitFor({ state: 'visible' , timeout: timeout});
  }

  async openTeamsListIfClosed() {
    if (!(await this.teamList.isVisible())) {
      await this.teamCurrentBtn.click();
    }
    await expect(this.teamList).toBeVisible();
  }

  async switchTeam(teamName) {
    await this.openTeamsListIfClosed();
    const teamOption = this.page.locator(
      `li[class*="team-dropdown-item"] span[class*="team-text"]:text-is("${teamName}")`,
    );
    await teamOption.click();
    await this.isTeamSelected(teamName);
  }

  async deleteTeam(teamName) {
    await this.openTeamsListIfClosed();
    const teamSel = this.page.locator(
      `ul[class*="teams-dropdown"] li[role="menuitem"] span[title="${teamName}"]`,
    );
    if (await teamSel.isVisible()) {
      await teamSel.click();
      await this.isTeamSelected(teamName);
      await this.teamOptionsMenuButton.click();
      await this.deleteTeamMenuItem.click();
      await this.deleteTeamButton.click();
      await expect(this.teamCurrentBtn).not.toHaveText(teamName);
      await expect(this.teamCurrentBtn).toHaveText('Your Penpot');
    }
  }

  async deleteTeams(teams) {
    for (const team of teams) {
      await this.deleteTeam(team);
    }
  }

  async isTeamDeleted(teamName) {
    await this.page.waitForTimeout(5000)
    await this.openTeamsListIfClosed();
    for (const el of await this.teamCurrentNameDiv.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      await expect(text).not.toEqual(teamName);
    }
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
    await expect(this.invitationWarningSpan).toHaveText(text);
  }

  async isInvitationRecordDisplayed(email, role, status) {
    await expect(this.invitationRecordEmailCell).toHaveText(email);
    await expect(this.invitationRecordRoleCell).toHaveText(role);
    await expect(this.invitationRecordStatusCell).toHaveText(status);
  }

  async isMultipleInvitationRecordDisplayed(email, role, status) {
    const emailSelector = `//div[contains(@class, 'dashboard_team__field-email') and contains(text(), '${email}')]`
    const emailLocator = await this.page.locator(emailSelector);
    const roleLocator = await this.page.locator(`${emailSelector}/following-sibling::div//span`);
    const statusLocator = await this.page.locator(`${emailSelector}/following-sibling::div//aside`);
    await expect(emailLocator).toHaveText(email);
    await expect(roleLocator).toHaveText(role);
    await expect(statusLocator).toHaveText(status);
  }

  async isMultipleMemberRecordDisplayed(name, email, role) {
    const nameSelector = `//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]`;
    const emailLocator = await this.page.locator(`${nameSelector}/following-sibling::div`);
    const roleLocator = await this.page.locator(`${nameSelector}/../../following-sibling::div//span`);
    const nameLocator = await this.page.locator(nameSelector);
    await expect(nameLocator).toContainText(name);
    await expect(emailLocator.first()).toHaveText(email);
    await expect(roleLocator).toHaveText(role);
  }

  async changeInvitationRole(email, role) {
    await this.page.locator(`//div[contains(@class, 'dashboard_team__field-email') and contains(text(), '${email}')]/following-sibling::div//span`).click();
    switch (role) {
      case 'Admin':
        await this.adminRoleSelector.click();
        break;
      case 'Editor':
        await this.editorRoleSelector.click();
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
    }
  }

  async selectInvitationRoleInInvitationRecord(role) {
    await this.invitationRecordRoleSelector.click();
    await this.page.locator(`li:has-text('${role}')`).click();
  }

  async selectMemberRoleInPopUp(name, role) {
    const locator = this.page.locator(`//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div//span`);
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
    }
  }

  async isMemberRoleInPopUpNotDisplayed(name, role) {
    const locator = this.page.locator(`//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div//span`);
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
    }
    await expect(roleLoc).not.toBeVisible();
  }

  async isInvitationRoleInPopUpNotDisplayed(email, role) {
    const locator = this.page.locator(`//div[contains(@class, 'dashboard_team__field-email') and contains(text(), '${email}')]/following-sibling::div//span`);
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
  async resendInvitation() {
    await this.invitationRecordOptionsMenuButton.click();
    await this.invitationRecordResendInvititationMenuItem.click();
  }

  async deleteInvitation() {
    await this.invitationRecordOptionsMenuButton.click();
    await this.invitationRecordDeleteInvititationMenuItem.click();
  }

  async leaveTeam(teamName, role = 'Admin', name) {
    await this.invitationRecordOptionsMenuButton.first().click();
    await this.memberRecordleaveTeamMenuItem.click();
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
    await this.teamInfoSection.hover();
  }

  async deleteTeamMember(name) {
    const locator = await this.page.locator(`//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div/button`);
    await locator.click();
    await this.memberRecordDeleteMemberMenuItem.click();
    await this.clickOnDeleteMemberButton();
    await expect(locator).not.toBeVisible();
  }

  async isDeleteTeamMemberDisabled(name) {
    const locator = await this.page.locator(`//div[contains(@class, 'team__member-name') and contains(text(), '${name}')]/../../following-sibling::div/button`);
    await expect(locator).not.toBeVisible();
  }

  async isInvitationRecordOptionsDisabled(email) {
    const locator = await this.page.locator(`//div[contains(@class, 'dashboard_team__field-email') and contains(text(), '${email}')]/following-sibling::div/button`);
    await expect(locator).not.toBeVisible();
  }

  async selectMember(name) {
    await this.page.locator('span[class*="dropdown-button"]').click();
    await this.page.locator(`li span[class*="components_select"]:has-text("${name}")`).click();
    await this.ownerLeaveTeamButton.click();
  }

  async isInviteMessageDisplayed(message) {
    await expect(this.inviteMessage).toHaveText(message);
  }
};
