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

    // Team Settings > "Team organization" section (Enterprise) — add/remove
    // this team from an organization. The "not part of any
    // organization" text and "Add to an organization" link only show when
    // the team truly has no org; once it does, this section instead shows
    // the org's name and an icon-only options button (no aria-label) whose
    // one menu item is a plain `role="listitem"`, not `menuitem`.
    this.teamOrganizationSection = page.locator(
      '//div[text()="Team organization"]/..',
    );
    this.teamNotInOrgText = page.getByText(
      'This team is not part of any organization',
    );
    this.addTeamToOrgLink = page.getByText('Add to an organization');
    this.addTeamToOrgCombobox = page.getByRole('combobox');
    this.addTeamToOrgSubmitButton = page.getByRole('button', {
      name: 'Add to organization',
    });
    this.addedToOrgMessage = page.getByText(
      /This team is now part of the organization/,
    );
    // Shown inside the same modal instead of the org combobox when
    // "Create Teams" is 'Only me' and the actor isn't the owner (PENPOT-3333).
    this.noPermissionToAddTeamMessage = page.getByText(
      "You don't have permission to add teams to any of your organizations.",
    );
    this.teamOrgOptionsButton = this.teamOrganizationSection.locator('button');
    this.changeTeamOrgMenuItem = page.getByText('Change team organization');
    this.moveTeamSubmitButton = page.getByRole('button', { name: 'Move team' });
    this.removeTeamFromOrgMenuItem = page.getByText('Remove team from organization');
    this.removeTeamFromOrgConfirmButton = page.getByRole('button', {
      name: 'Remove from organization',
    });
    this.removedFromOrgMessage = page.getByText(
      /This team is no longer part of the organization/,
    );
    this.moveTeamBlockedModalHeading = page.getByRole('heading', {
      name: "Change team's organization",
    });

    this.membersMenuItem = page.getByRole('menuitem', { name: 'Members' });

    //Invitations
    this.teamModalContainer = page.locator(
      '.main_ui_dashboard_team__modal-team-container',
    );
    this.invitationsMenuItem = page.getByRole('menuitem', { name: 'Invitations' });
    this.inviteMembersToTeamButton = page.getByTestId('invite-member');
    this.inviteMembersPopUpHeader = page.getByRole('heading', {
      name: 'Invite members to the team',
    });
    this.inviteMembersTeamHeroButton = page.getByRole('button', {
      name: 'Invite members',
    });
    this.inviteMembersToTeamRoleSelector = page.getByRole('combobox');
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
      name: 'Go to Personal Projects',
    });

    // Request Access dialog Locators
    this.requestAccessDialog = page.locator('.main_ui_static__dialog').first();
    this.requestAccessButton = page.getByRole('button', { name: 'REQUEST ACCESS' });
    this.returnHomeButton = page.getByRole('button', {
      name: 'Go to Personal Projects',
    });
    this.requestSentCorrectlyText = this.requestAccessDialog.getByText(
      'Your request has been sent correctly!',
    );
    this.requestSentCorrectlyDescribe = this.requestAccessDialog.getByText(
      "Remember that, if the owner allows it, you're going to be invited to the team.",
    );
    this.closeModalButton = page.getByRole('button', { name: 'Close' });
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
      'use[href="#icon-character-e"]',
    );
    this.unlimitedIcon = this.subscriptionIcon.locator(
      'use[href="#icon-character-u"]',
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
    await this.isTeamSelected(teamName);
  }

  async isTeamSelected(teamName) {
    await expect(this.teamCurrentBtnText).toHaveText(teamName);
  }

  /** Checks the URL itself shows a team's own dashboard
   * (/dashboard/recent?team-id=...) — use alongside isTeamSelected(), which
   * only checks the displayed team name, not the URL. */
  async isOnTeamDashboardUrl() {
    await expect(this.page, "On a team's own dashboard URL").toHaveURL(
      /\/dashboard\/recent\?team-id=/,
    );
  }

  /** Extracts the team's id from its own dashboard URL — more reliable
   * than the team/org switchers once a team belongs to an organization. */
  getTeamIdFromUrl() {
    const match = this.page.url().match(/[?&]team-id=([^&]+)/);
    if (!match) {
      throw new Error(`Not on a team dashboard URL: ${this.page.url()}`);
    }
    return match[1];
  }

  async isTeamListed(teamName, listed = true) {
    const item = this.teamList.getByText(teamName);
    listed
      ? await expect(item, `Team "${teamName}" is listed`).toBeVisible()
      : await expect(item, `Team "${teamName}" is not listed`).toHaveCount(0);
  }

  /**
   * Adds the current team to an organization via Team Settings' "Add to an
   * organization" flow. Assumes Team Settings is already open and the team
   * genuinely has no organization yet.
   */
  async addTeamToOrganization(orgName) {
    await this.addTeamToOrgLink.click();
    await this.addTeamToOrgCombobox.click();
    await this.page.getByRole('option', { name: orgName }).click();
    await this.addTeamToOrgSubmitButton.click();
    await expect(
      this.addedToOrgMessage,
      'Team-added-to-organization message is shown',
    ).toBeVisible();
  }

  /** Moves the team to a different org via "Change team organization".
   * Assumes Team Settings is open; reuses addedToOrgMessage's toast text. */
  async changeTeamOrganization(orgName) {
    await this.openChangeTeamOrgModal();
    await this.addTeamToOrgCombobox.click();
    await this.page.getByRole('option', { name: orgName }).click();
    await this.moveTeamSubmitButton.click();
    await expect(
      this.addedToOrgMessage,
      'Team-moved-to-organization message is shown',
    ).toBeVisible();
  }

  /** Doesn't assume success — a disallowed move shows a blocking modal here instead of the org combobox. */
  async openChangeTeamOrgModal() {
    await this.teamOrgOptionsButton.click();
    await this.changeTeamOrgMenuItem.click();
  }

  async isMoveTeamBlockedModalShown(orgName) {
    await expect(
      this.page.getByText(
        `You are not allowed to move teams that are part of ${orgName} organization. If you need more information, contact the organization's owner.`,
      ),
      `Move-team blocked modal names "${orgName}"`,
    ).toBeVisible();
  }

  /** Its overlay otherwise intercepts every later click on the page. */
  async closeMoveTeamBlockedModal() {
    await this.clickOnESC();
    await expect(
      this.moveTeamBlockedModalHeading,
      'Move-team blocked modal is closed',
    ).not.toBeVisible();
  }

  /** Opens the "Add team to an organization" modal without assuming success
   * — a restricted non-owner sees a permission-denied message here instead
   * of the org combobox (see isNoPermissionToAddTeamMessageVisible()). */
  async openAddTeamToOrgModal() {
    await this.addTeamToOrgLink.click();
  }

  async isNoPermissionToAddTeamMessageVisible() {
    await expect(
      this.noPermissionToAddTeamMessage,
      'No-permission-to-add-team message is shown',
    ).toBeVisible();
  }

  /**
   * Removes the current team from its organization via Team Settings'
   * options menu next to the org name. Assumes Team Settings is already
   * open and the team genuinely belongs to an organization.
   */
  async removeTeamFromOrganization() {
    await this.openRemoveTeamFromOrgDialog();
    await this.removeTeamFromOrgConfirmButton.click();
    await expect(
      this.removedFromOrgMessage,
      'Team-removed-from-organization message is shown',
    ).toBeVisible();
  }

  /** Opens the org options menu and clicks its one item, reaching the "Are
   * you sure?" confirmation dialog without confirming it — use this
   * directly (instead of removeTeamFromOrganization()) when a test also
   * wants to check the dialog's own text first. */
  async openRemoveTeamFromOrgDialog() {
    await this.teamOrgOptionsButton.click();
    await this.removeTeamFromOrgMenuItem.click();
  }

  async isRemoveTeamConfirmDialogShown(teamName, orgName) {
    await expect(
      this.page.getByText(
        `Are you sure you want to remove the '${teamName}' team from the '${orgName}' organization?`,
      ),
      `Remove-team confirmation dialog names "${teamName}" and "${orgName}"`,
    ).toBeVisible();
  }

  async isRemovedFromOrgMessageShown() {
    await expect(
      this.removedFromOrgMessage,
      'Team-removed-from-organization message is shown',
    ).toBeVisible();
  }

  async isTeamNotPartOfAnyOrg(notPartOf = true) {
    notPartOf
      ? await expect(
          this.teamNotInOrgText,
          'Team organization section shows "not part of any organization"',
        ).toBeVisible()
      : await expect(
          this.teamNotInOrgText,
          'Team organization section does not show "not part of any organization"',
        ).not.toBeVisible();
  }

  async isTeamPartOfOrganization(orgName) {
    await expect(
      this.teamOrganizationSection.getByText(orgName, { exact: true }),
      `Team organization section shows "${orgName}"`,
    ).toBeVisible();
  }

  async waitForTeamBtn(timeout = 10000) {
    await this.teamCurrentBtnText.waitFor({ state: 'visible', timeout: timeout });
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

  /** Self-heals with a reload — the switcher's list can go stale after a heavy navigation (Admin Console, accepting an org invite). */
  async switchTeam(teamName) {
    await expect(async () => {
      await this.openTeamsListIfClosed();
      const teamOption = this.teamList
        .getByRole('menuitem')
        .filter({ hasText: teamName })
        .first();
      try {
        await expect(
          teamOption,
          `"${teamName}" is listed in the team switcher`,
        ).toBeVisible({ timeout: 2000 });
      } catch {
        await this.page.goto('/');
        throw new Error(`"${teamName}" not yet listed in the team switcher`);
      }
      await teamOption.click();
      await this.isTeamSelected(teamName);
    }).toPass({ timeout: 30000 });
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
    }
  }

  async deleteTeams(teams) {
    for (const team of teams) {
      await this.deleteTeam(team);
    }
  }

  async isTeamDeleted(teamName) {
    await expect(this.page.getByText('Personal Projects')).toBeVisible({
      timeout: 8000,
    });
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

  async isInviteMembersPopUpHeaderVisible() {
    await expect(this.inviteMembersPopUpHeader).toBeVisible();
  }

  async clickInviteMembersTeamHeroButton() {
    await this.inviteMembersTeamHeroButton.click();
  }

  async enterEmailToInviteMembersPopUp(emails) {
    const emailString = Array.isArray(emails) ? emails.join(', ') : emails;
    await this.inviteMembersToTeamEmailInput.type(emailString, { delay: 50 });
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

  async isInvitationRecordDisplayed(invitations) {
    for (const invitation of invitations) {
      await this.isMultipleInvitationRecordDisplayed(
        invitation.email,
        invitation.role,
        invitation.status,
      );
    }
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
    await this.inviteMembersToTeamRoleSelector.click();
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
  async resendInvitation(emails) {
    const emailList = Array.isArray(emails) ? emails : [emails];
    for (const email of emailList) {
      await this.selectInvitationByEmail(email);
    }

    await this.resendInvitationButton.click();
    await this.resendButton.click();
  }

  async deleteInvitation(emails) {
    const emailList = Array.isArray(emails) ? emails : [emails];
    for (const email of emailList) {
      await this.selectInvitationByEmail(email);
    }

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
    await expect(this.teamCurrentBtn).toHaveText('Personal Projects');
  }

  /**
   * @param {string | string[] | null} emails
   */
  async isInvitationRecordRemoved(emails = null) {
    if (emails !== null && emails !== undefined && emails !== '') {
      const emailList = Array.isArray(emails) ? emails : [emails];

      if (emailList.length > 0) {
        for (const email of emailList) {
          await expect(
            this.page.locator(
              `[class*="dashboard_team__field-email"]:has-text("${email}")`,
            ),
          ).not.toBeVisible();
        }
        return;
      }
    }

    await expect(this.page.locator('text=No pending invitations')).toBeVisible();
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
    await expect(this.teamOwnerSpan, `Team owner info is "${name}"`).toHaveText(
      name,
    );
  }

  async isTeamMembersInfoDisplayed(text) {
    await expect(this.teamMembersSpan, `Team members info is "${text}"`).toHaveText(
      text,
    );
  }

  async isTeamProjectsInfoDisplayed(text) {
    await expect(
      this.teamProjectsSpan,
      `Team projects info is "${text}"`,
    ).toHaveText(text);
  }

  async isTeamFilesInfoDisplayed(text) {
    await expect(this.teamFilesSpan, `Team files info is "${text}"`).toHaveText(
      text,
    );
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
    await expect(
      this.teamModalContainer.getByText(email, { exact: true }),
    ).toBeVisible();
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

  async isSubscriptionIconVisible(subscriptionPlan) {
    if (subscriptionPlan === 'Unlimited') {
      await expect(
        this.unlimitedIcon,
        'Unlimited Plan icon is visible',
      ).toBeVisible();
    } else if (subscriptionPlan === 'Enterprise') {
      await expect(
        this.enterpriseIcon,
        'Enterprise Plan icon is visible',
      ).toBeVisible();
    } else {
      return;
    }
  }

  async isSubscriptionIconNotVisible() {
    await expect(
      this.subscriptionIcon,
      'Subscription icon is not visible',
    ).not.toBeVisible();
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

  async isInvitationSelectionDisabled(email) {
    const checkboxLocator = this.page.locator(
      `label:has([value="${email}"]) input[type="checkbox"]`,
    );
    await expect(checkboxLocator).not.toBeVisible();
  }
};
