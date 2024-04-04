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
    this.teamList = page.locator('ul[class*="teams-dropdown"]');
    this.createNewTeamMenuItem = page.locator('#teams-selector-create-team');
    this.teamNameInput = page.locator('#name');
    this.createNewTeamButton = page.locator(
      'button[name="submit"] span:text-is("Create new team")',
    );
    this.teamCurrentNameDiv = page.locator(
      'button[class*="current-team"] div[class*="team-name"]',
    );
    this.teamNameLabel = page.locator('//div[text()="Team info"]/following-sibling::div[1]');
    this.teamOptionsMenuButton = page.locator('button[class*="switch-options"]');
    this.deleteTeamMenuItem = page.locator('#teams-options-delete-team');
    this.deleteTeamButton = page.locator('input[value="Delete team"]');
    this.teamSettingsMenuItem = page.locator('li[data-test="team-settings"]');
    this.renameTeamMenuItem = page.locator('li[data-test="rename-team"]');
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

    //Invitations
    this.invitationsMenuItem = page.locator('li[data-test="team-invitations"]');
    this.inviteMembersToTeamButton = page.locator('a[data-test="invite-member"]');
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
    this.invitationWarningSpan = page.locator(
      'aside[class*="warning"] div[class*="context_notification"]',
    );
    this.teamSettingsSection = page.locator('.main_ui_dashboard__dashboard-content');
    this.teamIcon = page.locator(`div[class*='team-icon'] img`);
  }

  async createTeam(teamName) {
    await this.openTeamsListIfClosed();
    await this.createNewTeamMenuItem.click();
    await this.teamNameInput.fill(teamName);
    await this.createNewTeamButton.click();
  }

  async isTeamSelected(teamName) {
    await expect(this.teamCurrentBtn).toHaveText(teamName);
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

  async openInvitationsPageViaOptionsMenu() {
    await this.teamOptionsMenuButton.click();
    await this.invitationsMenuItem.click();
    await this.isHeaderDisplayed('Invitations');
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
};
