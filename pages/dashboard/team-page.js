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

    // Shown after SELECTING (not just considering) a restricted org that the
    // team's members all belong to, but whose pending invitations don't —
    // advisory only, doesn't block the submit button below.
    this.externalInvitationsCancelWarning = page.getByText(
      'Pending invitations to external users will be canceled.',
      { exact: true },
    );
    // A separate, blocking `.main_ui_alert__` modal — shown instead of the
    // combobox entirely when NO organization would accept the team. Distinct
    // wording from noPermissionToAddTeamMessage above (that one gates on the
    // "Create Teams" permission, "teams" plural, no "this").
    this.noOrgAllowsTeamMoveMessage = page.getByText(
      "You don't have permission to add this team to any of your organizations.",
      { exact: true },
    );

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

    // "New team members: Organization members only" — sending a mix of
    // org-member and non-member addresses replaces the invite dialog with
    // this modal instead of sending anything; the blocked addresses are
    // listed only once the toggle below is expanded.
    this.blockedInvitationsModalHeading = page.getByRole('heading', {
      name: "Some invitations can't be sent",
    });
    this.blockedInvitationsToggle = page.getByRole('button', {
      name: "Addresses that won't receive an invitation",
    });
    this.blockedInvitationsList = page
      .locator('[class*="restricted-email-list"]')
      .getByRole('listitem');
    this.blockedInvitationsCancelButton = page.getByRole('button', {
      name: 'Cancel',
      exact: true,
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
    // Per-row action, not gated behind the options menu.
    this.copyInvitationLinkButton = page.getByRole('button', { name: 'Copy link' });
    // Substring without the apostrophe — the live UI uses a curly one (’).
    this.noPermissionToInviteMessage = page.getByText(
      'have permission to invite people to join this team or to edit or delete invitations',
    );
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

  async isTeamSelected(teamName, timeout) {
    await expect(this.teamCurrentBtnText).toHaveText(teamName, { timeout });
  }

  /** Navigates to the dashboard root, same as OrganizationPage.goto() —
   * use before switchTeam() when the currently-active team/org context
   * doesn't matter yet. */
  async goto() {
    await this.page.goto(`${process.env.BASE_URL}`);
  }

  /** Direct-URL navigation to a team's own dashboard, by id — an
   * alternative to switchTeam() when the switcher's own list can't be
   * relied on yet (e.g. right after registering a brand-new manually
   * created account). Built explicitly from BASE_URL, not a relative
   * goto() — see LoginPage.goto()'s own comment for why that matters on
   * manually-created contexts. */
  async goToTeamDashboard(teamId) {
    await this.page.goto(
      `${process.env.BASE_URL}#/dashboard/recent?team-id=${teamId}`,
    );
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
    await this.openAddTeamToOrgComboboxOptions();
    await this.selectOrgInPicker(orgName);
    await this.submitAddToOrg();
  }

  /** Submits the "Add to an organization" form for an already-selected org
   * — split out from addTeamToOrganization() so a caller can inspect picker
   * state (e.g. the cancel-invitations warning) between selecting an option
   * and submitting. */
  async submitAddToOrg() {
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
    await this.selectOrgInPicker(orgName);
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

  async isMoveTeamBlockedModalVisible(orgName) {
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
   * of the org combobox (see isNoPermissionToAddTeamMessageVisible()/
   * isNoOrgAllowsTeamMoveMessageVisible() for the two different gates that
   * can short-circuit straight to a message here). */
  async openAddTeamToOrgModal() {
    await this.addTeamToOrgLink.click();
  }

  /** Opens "Add to an organization" up to its org combobox, without
   * selecting anything — for inspecting picker option state (enabled/
   * disabled, tooltip) before choosing one. */
  async openAddTeamToOrgComboboxOptions() {
    await this.openAddTeamToOrgModal();
    await this.addTeamToOrgCombobox.click();
  }

  /** Picks an option from an already-open org combobox, without submitting
   * — lets a caller inspect state (e.g. the cancel-invitations warning)
   * before deciding to go through with addTeamToOrgSubmitButton/
   * moveTeamSubmitButton. */
  async selectOrgInPicker(orgName) {
    await this.page.getByRole('option', { name: orgName }).click();
  }

  async isNoPermissionToAddTeamMessageVisible() {
    await expect(
      this.noPermissionToAddTeamMessage,
      'No-permission-to-add-team message is shown',
    ).toBeVisible();
  }

  async isNoOrgAllowsTeamMoveMessageVisible() {
    await expect(
      this.noOrgAllowsTeamMoveMessage,
      'No-organization-allows-this-move message is shown',
    ).toBeVisible();
  }

  /** Checks a picker option's disabled state — set when not all of the
   * team's actual members belong to that organization. Disabled options are
   * inert (clicking one selects nothing) and carry a native `title` tooltip,
   * not an ARIA tooltip element. */
  async isOrgPickerOptionDisabled(orgName, disabled = true) {
    const restrictedOrgPickerOptionTooltip =
      'Only people within your organization can be invited.';
    const option = this.page.getByRole('option', { name: orgName });
    await expect(
      option,
      `"${orgName}" option is ${disabled ? '' : 'not '}disabled in the org picker`,
    ).toHaveAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (disabled) {
      await expect(
        option,
        `"${orgName}" option shows the restricted-org tooltip`,
      ).toHaveAttribute('title', restrictedOrgPickerOptionTooltip);
    }
  }

  async isExternalInvitationsCancelWarningVisible(visible = true) {
    visible
      ? await expect(
          this.externalInvitationsCancelWarning,
          'Pending-external-invitations-will-be-canceled warning is shown',
        ).toBeVisible()
      : await expect(
          this.externalInvitationsCancelWarning,
          'Pending-external-invitations-will-be-canceled warning is not shown',
        ).not.toBeVisible();
  }

  async isBlockedInvitationsModalVisible(visible = true) {
    visible
      ? await expect(
          this.blockedInvitationsModalHeading,
          '"Some invitations can\'t be sent" modal is shown',
        ).toBeVisible()
      : await expect(
          this.blockedInvitationsModalHeading,
          '"Some invitations can\'t be sent" modal is not shown',
        ).not.toBeVisible();
  }

  async openBlockedInvitationsList() {
    await this.blockedInvitationsToggle.click();
  }

  async isEmailBlockedFromInvitation(email) {
    await expect(
      this.blockedInvitationsList.filter({ hasText: email }),
      `"${email}" is listed as blocked from the invitation`,
    ).toBeVisible();
  }

  async cancelBlockedInvitationsModal() {
    await this.blockedInvitationsCancelButton.click();
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

  /** Self-heals by navigating back to the dashboard root (not a reload —
   * the switcher's list can go stale after a heavy navigation, e.g. Admin
   * Console or accepting an org invite, and a fresh root navigation
   * clears that). Also
   * retries the click itself, not just the list check: confirmed live
   * that clicking the target team can silently land back on Personal
   * Projects instead (a structurally different view with no
   * team-management button at all — waiting for one there would time out
   * indefinitely, not just briefly race). isTeamSelected()'s own check
   * gets a short timeout here so a full click-and-check cycle stays quick
   * enough to actually get several real attempts within the 30s budget,
   * rather than one attempt eating most of it via the default 15s wait. */
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
        await this.goto();
        throw new Error(`"${teamName}" not yet listed in the team switcher`);
      }
      await teamOption.click();
      await this.isTeamSelected(teamName, 3000);
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
      await this.openTeamOptionsMenuItem(this.deleteTeamMenuItem);
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

  /** Self-healing — clicking right after an action that re-renders the
   * header (e.g. switchTeam()) can catch this button, or the menu item it
   * opens, mid-replacement and detach it from under an in-flight click.
   * Checks whether the target item is already visible first, same as
   * openOrgSwitcher() — re-clicking the trigger when the menu is already
   * open would just toggle it closed instead of helping. Confirmed live
   * (CI and remote runs) with the "element was detached from the DOM"
   * signature, on this exact button, across several of its callers —
   * every caller that clicks a specific menu item now goes through this.
   * openTeamOptionsMenu() is the one exception: it only opens the menu
   * with no destination item, so it doesn't fit this method's contract
   * and still clicks the button directly (no evidence of the race there). */
  async openTeamOptionsMenuItem(menuItem) {
    await expect(async () => {
      if (!(await menuItem.isVisible())) {
        await this.teamOptionsMenuButton.click();
      }
      await menuItem.click({ timeout: 5000 });
    }).toPass({ timeout: 30000 });
  }

  async openMembersPageViaOptionsMenu() {
    await this.openTeamOptionsMenuItem(this.membersMenuItem);
    await this.isHeaderDisplayed('Members');
  }

  async openInvitationsPageViaOptionsMenu() {
    await this.openTeamOptionsMenuItem(this.invitationsMenuItem);
    await this.isHeaderDisplayed('Invitations');
  }

  async clickInviteMembersToTeamButton() {
    await this.inviteMembersToTeamButton.click();
  }

  // Button isn't rendered at all (e.g. a plain non-admin member).
  async isInviteMembersToTeamButtonHidden() {
    await expect(this.inviteMembersToTeamButton).not.toBeVisible();
  }

  // Button stays rendered but disabled (e.g. "Team owners only" permission).
  async isInviteMembersToTeamButtonDisabled() {
    await expect(
      this.inviteMembersToTeamButton,
      'Invite people button is visible but disabled',
    ).toBeDisabled();
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
    await this.openTeamOptionsMenuItem(this.teamSettingsMenuItem);
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
    await this.openTeamOptionsMenuItem(this.renameTeamMenuItem);
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

  async isCopyInvitationLinkButtonVisible(email, visible = true) {
    const emailSelector = `[class*="dashboard_team__field-email"]:has-text("${email}")`;
    const locator = this.page
      .locator(`[class*="table-row-invitations"]:has(${emailSelector})`)
      .getByRole('button', { name: 'Copy link' });
    visible
      ? await expect(
          locator,
          `Copy link button is visible for ${email}`,
        ).toBeVisible()
      : await expect(
          locator,
          `Copy link button is not visible for ${email}`,
        ).not.toBeVisible();
  }

  async isNoPermissionToInviteMessageVisible() {
    await expect(
      this.noPermissionToInviteMessage,
      'No-permission-to-invite message is shown',
    ).toBeVisible();
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
