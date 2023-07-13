const { BasePage } = require("./base-page");
const { expect } = require("@playwright/test");

exports.TeamPage = class TeamPage extends BasePage {

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Teams
    this.teamCurrentBtn = page.locator('.current-team');
    this.teamList = page.locator('ul[class*="teams-dropdown"]');
    this.createNewTeamMenuItem = page.locator('#teams-selector-create-team');
    this.teamNameInput = page.locator('#name');
    this.createNewTeamButton = page.locator('input[value="Create new team"]');
    this.teamCurrentNameDiv = page.locator('.current-team .team-name');
    this.teamListItem = page.locator('li[class="team-name"] span[class="team-text"]');
    this.teamOptionsMenuButton = page.locator('.switch-options .icon-actions');
    this.deleteTeamMenuItem = page.locator('li[data-test="delete-team"]');
    this.deleteTeamButton = page.locator('input[value="Delete team"]');
    this.teamSettingsMenuItem = page.locator('li[data-test="team-settings"]');
    this.renameTeamMenuItem = page.locator('li[data-test="rename-team"]');
    this.uploadTeamImageButton = page.locator('input[type="file"]');
    this.renameTeamInput = page.locator("#name");
    this.updateTeamButton = page.locator('input[value="Update team"]');
    this.teamOwnerSpan = page.locator('div.owner-block .owner span.text');
    this.teamMembersSpan = page.locator('div.owner-block .summary span.text');
    this.teamProjectsSpan = page.locator('div.stats-block .projects span.text');
    this.teamFilesSpan = page.locator('div.stats-block .files span.text');
    this.teamInfoSection = page.locator('div[class="block info-block"]');
    this.teamOwnerSection = page.locator('div[class="block owner-block"]');
    this.teamStatsSection = page.locator('div[class="block stats-block"]');

    //Invitations
    this.invitationsMenuItem = page.locator('li[data-test="team-invitations"]');
    this.inviteMembersToTeamButton = page.locator('a[data-test="invite-member"]');
    this.inviteMembersPopUpHeader = page.locator(
      'div[class^="modal dashboard-invite-modal form-container "] div[class="title"]'
    );
    this.inviteMembersTeamHeroButton = page.locator('button[class="btn-primary invite"]');
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
    this.invitationWarningSpan = page.locator('div.dashboard-invite-modal .warning span.text');
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
    if (!await this.teamList.isVisible()) {
      await this.teamCurrentBtn.click();
    }
    await expect(this.teamList).toBeVisible();
  }

  async switchTeam(teamName) {
    await this.openTeamsListIfClosed();
    const teamOption = this.page.locator(`li.team-name span.team-text:has-text("${teamName}")`);
    await teamOption.click();
    await this.isTeamSelected(teamName);
  }

  async deleteTeam(teamName) {
    await this.openTeamsListIfClosed();
    for (const el of await this.teamCurrentNameDiv.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      if (text.includes(teamName)) {
        await el.click();
        await this.isTeamSelected(teamName);
        await this.teamOptionsMenuButton.click();
        await this.deleteTeamMenuItem.click();
        await this.deleteTeamButton.click();
        await expect(this.teamCurrentBtn).not.toHaveText(teamName);
      }
    }
  }

  async deleteTeamsIfExist() {
    await this.openTeamsListIfClosed();
    for (const teamName of await this.teamListItem.allInnerTexts()) {
      if (!teamName.includes("Your Penpot")) {
        const teamSel = this.page.locator(`li.team-name span.team-text:text-is("${teamName}")`).last();
        await teamSel.click();
        await this.teamOptionsMenuButton.waitFor();
        await this.teamOptionsMenuButton.click();
        await this.deleteTeamMenuItem.click();
        await this.deleteTeamButton.click();
        await expect(this.teamCurrentBtn).toHaveText("Your Penpot");
        await this.openTeamsListIfClosed();
      }
    }
  }

  async isTeamDeleted(teamName) {
    await this.openTeamsListIfClosed();
    for (const el of await this.teamCurrentNameDiv.elementHandles()) {
      const text = (await el.innerText()).valueOf();
      await expect(text).not.toEqual(teamName);
    }
  }

  async openInvitationsPageViaOptionsMenu() {
    await this.teamOptionsMenuButton.click();
    await this.invitationsMenuItem.click();
    await this.isHeaderDisplayed("Invitations");
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
    await this.isHeaderDisplayed("Settings");
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
    await this.clearInput(this.renameTeamInput);
    await this.renameTeamInput.fill(teamName);
    await this.updateTeamButton.click();
  }

}
