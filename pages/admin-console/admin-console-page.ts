import { type Locator, type Page, type Response, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/** Named user-menu item labels, typed for isUserMenuItemVisible()/
 * hoverUserMenuItem(). AboutPenpot/VersionNotes are regexes since both embed a version number that drifts every release. */
export const AdminConsoleUserMenuItem = {
  YourAccount: 'Your account',
  DownloadUsageReport: 'Download usage report',
  HelpAndLearning: 'Help & Learning',
  CommunityAndContributions: 'Community & Contributions',
  AboutPenpot: /^About Penpot/,
  Logout: 'Logout',
  // "Help & Learning" submenu
  HelpCenter: 'Help Center',
  LearningCenter: 'Learning Center',
  PenpotHub: 'Penpot Hub',
  GiveFeedback: 'Give Feedback',
  // Community needs the exact-match regex — a plain substring also matches its own parent trigger item.
  GithubRepository: 'Github repository',
  Community: /^Community$/,
  // "About Penpot" submenu
  VersionNotes: /^Version .+ notes$/,
  PenpotChangelog: 'Penpot Changelog',
  TermsOfService: 'Terms of service',
} as const;

export type AdminConsoleUserMenuItemName =
  (typeof AdminConsoleUserMenuItem)[keyof typeof AdminConsoleUserMenuItem];

/**
 * Column position (0-indexed) in the Teams tab's table, for use with
 * getTeamsTableCell(). Excludes the trailing, unlabeled actions column.
 */
export enum TeamsTableColumn {
  Team = 0,
  Created = 1,
  Owner = 2,
  Projects = 3,
  Files = 4,
  Members = 5,
  LastActivity = 6,
}

/** Column position (0-indexed) in the People tab's table, for use with
 * getPeopleTableCell(). */
export enum PeopleTableColumn {
  User = 0,
  DateAdded = 1,
  Teams = 2,
  Actions = 3,
}

/** Column position (0-indexed) in the Pending tab's table, for use with
 * getPendingTableCell(). The 3rd column has no header, just the Cancel button. */
export enum PendingTableColumn {
  User = 0,
  DateAdded = 1,
  Actions = 2,
}

/** The Admin Console app (/admin-console/...): welcome state, People/Teams
 * tabs, Advanced Permissions, SSO. Its "Unlock Enterprise" modal is a genuinely different component from OrganizationPage's. */
export class AdminConsolePage extends BasePage {
  // Welcome / empty state — shown right after a successful Enterprise
  // checkout, before the profile owns any organization yet
  readonly welcomeCreateOrganizationButton: Locator;
  readonly goToFilesLink: Locator;

  // Admin Console's own "Unlock Enterprise Features" modal — see the class
  // doc comment for why this isn't shared with OrganizationPage's version.
  readonly tryItFreeButton: Locator;
  readonly currentPlanLink: Locator;

  // Organization settings modal (gear icon, top-right of the Admin Console
  // header) — rename/delete organization.
  readonly settingsButton: Locator;
  readonly settingsModal: Locator;
  readonly organizationInfoNavItem: Locator;
  readonly deleteOrganizationNavItem: Locator;
  readonly orgNameInput: Locator;
  readonly orgCreatedDateText: Locator;
  readonly saveChangesButton: Locator;
  readonly settingsSavedMessage: Locator;
  readonly settingsModalCloseButton: Locator;

  // Organization logo — its file input has no visible text, only an
  // aria-label; the image carries the org name as alt text once chosen.
  readonly orgLogoUploadInput: Locator;

  // Delete flow has 2 shapes: no teams/files deletes immediately; a team/file at stake opens a confirm overlay.
  readonly deleteOrgExplanationConfirmButton: Locator;
  readonly deleteOrgConfirmDialog: Locator;
  readonly deleteOrgAffectedCountsText: Locator;
  readonly deleteOrgAffectedTeamsToggle: Locator;
  readonly deleteOrgFinalConfirmButton: Locator;
  readonly orgDeletedToast: Locator;
  readonly pageNotFoundHeading: Locator;
  readonly pageNotFoundText: Locator;
  readonly backToHomeButton: Locator;

  // Admin Console's own org switcher — a different component from
  // OrganizationPage's: items are role="menuitemradio", not role="menuitem".
  readonly orgSwitcherButton: Locator;
  readonly orgSwitcherItem: Locator;
  readonly createOrganizationSwitcherItem: Locator;

  // Bottom-left user menu — no stable testid, so matched by its
  // "Demo User ..." display name instead (this suite only runs as a demo profile).
  readonly userMenuButton: Locator;
  readonly userMenuItem: Locator;
  readonly logoutMenuItem: Locator;

  // Advanced Permissions tab (sidebar nav item) — its own page object,
  // AdvancedPermissionsPage, covers everything past the click itself.
  readonly advancedPermissionsNavLink: Locator;

  // Teams tab (sidebar nav item) — a table listing every team in the org,
  // one row per team (see TeamsTableColumn).
  readonly teamsNavLink: Locator;
  readonly teamsTable: Locator;
  readonly teamsEmptyState: Locator;

  // People tab's own table, scoped by its "People" accessible name so a
  // stale Teams table mid-transition can't be mistaken for it.
  readonly peopleNavLink: Locator;
  readonly peopleTable: Locator;

  // People tab's "invite to the organization" modal — org-level invites,
  // distinct from a team's own invite flow (TeamPage's); either adds the person to both.
  readonly invitePeopleButton: Locator;
  readonly invitePeopleEmailInput: Locator;
  readonly sendInviteButton: Locator;

  // Pending tab — not-yet-accepted invitations (see PendingTableColumn).
  // Cancel button only becomes visible on hovering its row.
  readonly pendingTab: Locator;
  readonly pendingTable: Locator;

  // Only shown when the target belongs to at least one team.
  readonly removeMemberConfirmButton: Locator;

  // Teams row's "Team options" menu and its "Move to another org" dialog
  // (destinations: the user's own orgs, minus the team's current one).
  readonly moveTeamMenuItem: Locator;
  readonly removeTeamFromOrgMenuItem: Locator;
  readonly moveTeamDialog: Locator;
  readonly moveTeamDestinations: Locator;
  readonly moveTeamCancelButton: Locator;
  readonly moveTeamSubmitButton: Locator;

  // Same row menu's "Remove from org" confirmation dialog.
  readonly removeTeamDialog: Locator;
  readonly removeTeamConfirmButton: Locator;

  constructor(page: Page) {
    super(page);

    this.welcomeCreateOrganizationButton = page.getByRole('button', {
      name: 'Create organization',
    });
    this.goToFilesLink = page.getByRole('link', { name: 'Go to Files' });

    this.tryItFreeButton = page.getByRole('button', {
      name: 'Try 14 days for free',
    });
    this.currentPlanLink = page.getByRole('link', {
      name: 'See my current plan',
    });

    this.settingsButton = page.getByRole('button', { name: 'Settings' });
    // Scoped by "Organization info" text — the overlay wrapper class alone is shared by unrelated overlays.
    this.settingsModal = page
      .locator('[class*="fixed inset-0"]')
      .filter({ hasText: 'Organization info' });
    this.organizationInfoNavItem = this.settingsModal.getByRole('button', {
      name: 'Organization info',
    });
    this.deleteOrganizationNavItem = this.settingsModal
      .getByRole('button', { name: 'Delete organization' })
      .first();
    this.orgNameInput = page.getByLabel('Organization name', { exact: true });
    this.orgCreatedDateText = this.settingsModal.getByText(/^Created /);
    this.saveChangesButton = this.settingsModal.getByRole('button', {
      name: 'Save changes',
    });
    this.settingsSavedMessage = page.getByText('Your changes were saved.');
    // The only button here with neither visible text nor an aria-label
    // (the "Close notification" button has an aria-label, so it's excluded).
    this.settingsModalCloseButton = this.settingsModal.locator(
      'xpath=.//button[not(@aria-label) and not(normalize-space())]',
    );
    this.orgLogoUploadInput = page.getByLabel('Upload avatar');

    // Same text as deleteOrganizationNavItem above — `.last()` gets this one
    // since the nav item always precedes it in DOM order.
    this.deleteOrgExplanationConfirmButton = this.settingsModal
      .getByRole('button', { name: 'Delete organization' })
      .last();
    this.deleteOrgConfirmDialog = page
      .locator('[class*="fixed inset-0"]')
      .filter({ hasText: 'Are you sure?' });
    this.deleteOrgAffectedCountsText =
      this.deleteOrgConfirmDialog.getByText(/will be affected/);
    this.deleteOrgAffectedTeamsToggle =
      this.deleteOrgConfirmDialog.getByText('Affected teams');
    this.deleteOrgFinalConfirmButton = this.deleteOrgConfirmDialog.getByRole(
      'button',
      { name: 'Delete organization' },
    );
    this.orgDeletedToast = page.getByText(/has been deleted\.$/);

    this.pageNotFoundHeading = page.getByText('404', { exact: true });
    this.pageNotFoundText = page.getByText("This page doesn't exist", {
      exact: true,
    });
    this.backToHomeButton = page.getByRole('button', {
      name: 'Back to home',
      exact: true,
    });

    // 2 `[aria-haspopup="true"]` elements exist (one off-screen, unused) — this is the visible one.
    this.orgSwitcherButton = page.locator('[aria-haspopup="true"]').visible().last();
    this.orgSwitcherItem = page.getByRole('menuitemradio');
    this.createOrganizationSwitcherItem = this.orgSwitcherItem.filter({
      hasText: 'Create organization',
    });

    this.userMenuButton = page.getByRole('button', { name: /Demo User/ });
    this.userMenuItem = page.getByRole('menuitem');
    this.logoutMenuItem = this.userMenuItem.filter({ hasText: 'Logout' });

    this.advancedPermissionsNavLink = page.getByRole('link', {
      name: 'Advanced Permissions',
    });
    this.teamsNavLink = page.getByRole('link', { name: 'Teams' });
    this.teamsTable = page.getByRole('table', { name: 'Teams' });
    this.teamsEmptyState = page.getByText('There are no teams yet');
    this.peopleNavLink = page.getByRole('link', { name: 'People' });
    this.peopleTable = page.getByRole('table', { name: 'People' });

    // `.first()` — the empty state shows 2 identically-labelled buttons (toolbar + hero copy).
    this.invitePeopleButton = page
      .getByRole('button', { name: 'Invite people' })
      .first();
    this.invitePeopleEmailInput = page.getByPlaceholder(
      'Emails, separated by a comma',
    );
    // Label changes with count ("Send invite" vs "Send N invites") — one regex covers both.
    this.sendInviteButton = page.getByRole('button', {
      name: /^Send( \d+)? invites?$/,
    });

    this.pendingTab = page.getByRole('tab', { name: /^Pending/ });
    this.pendingTable = page.getByRole('table');

    this.removeMemberConfirmButton = page.getByRole('button', {
      name: 'Remove user',
    });

    this.moveTeamMenuItem = page.getByRole('menuitem', {
      name: 'Move to another org',
    });
    this.removeTeamFromOrgMenuItem = page.getByRole('menuitem', {
      name: 'Remove from org',
    });
    this.moveTeamDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', {
        name: /to another of your organizations\?$/,
      }),
    });
    this.moveTeamDestinations = this.moveTeamDialog.getByRole('radio');
    this.moveTeamCancelButton = this.moveTeamDialog.getByRole('button', {
      name: 'Cancel',
    });
    this.moveTeamSubmitButton = this.moveTeamDialog.getByRole('button', {
      name: 'Move team',
    });
    this.removeTeamDialog = page.getByRole('dialog').filter({
      has: page.getByRole('button', { name: 'Remove from organization' }),
    });
    this.removeTeamConfirmButton = this.removeTeamDialog.getByRole('button', {
      name: 'Remove from organization',
    });
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  /** Matches a user-menu item by text — hovering a submenu trigger just adds
   * more role="menuitem" elements to the same flat list, not a nested one. */
  private getUserMenuItemByName(name: AdminConsoleUserMenuItemName): Locator {
    return this.userMenuItem.filter({ hasText: name });
  }

  private getTeamsTableRow(teamName: string): Locator {
    return this.teamsTable.getByRole('row').filter({ hasText: teamName });
  }

  private getTeamsTableCell(teamName: string, column: TeamsTableColumn): Locator {
    return this.getTeamsTableRow(teamName).getByRole('cell').nth(column);
  }

  /** Matches by label rather than the radio itself — the real <input> is
   * visually hidden, so the label is what actually takes the click. */
  private getMoveTeamDestinationLabel(orgName: string): Locator {
    return this.moveTeamDialog.locator('label').filter({ hasText: orgName });
  }

  private getPeopleTableRow(memberName: string): Locator {
    return this.peopleTable.getByRole('row').filter({ hasText: memberName });
  }

  private getPeopleTableCell(
    memberName: string,
    column: PeopleTableColumn,
  ): Locator {
    return this.getPeopleTableRow(memberName).getByRole('cell').nth(column);
  }

  private getPendingTableRow(email: string): Locator {
    return this.pendingTable.getByRole('row').filter({ hasText: email });
  }

  private getPendingTableCell(email: string, column: PendingTableColumn): Locator {
    return this.getPendingTableRow(email).getByRole('cell').nth(column);
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  async clickWelcomeCreateOrganizationButton() {
    await this.welcomeCreateOrganizationButton.click();
  }

  /** Waits for the link to carry the org's team-id, then confirms the
   * dashboard lands inside `orgName` — clicked too early it lands outside any org. */
  async goToFiles(orgName: string) {
    await expect(
      this.goToFilesLink,
      '"Go to Files" links to a team of the current organization',
    ).toHaveAttribute('href', /team-id=/);
    await this.goToFilesLink.click();
    await expect(
      this.page.getByRole('button', { name: orgName }),
      `Dashboard is inside organization "${orgName}"`,
    ).toBeVisible();
  }

  async openAdvancedPermissionsTab() {
    await this.advancedPermissionsNavLink.click();
    await expect(this.page, 'On the Advanced Permissions tab').toHaveURL(
      /\/permissions$/,
    );
  }

  async openTeamsTab() {
    await this.teamsNavLink.click();
    await expect(this.page, 'On the Teams tab').toHaveURL(/\/teams$/);
    await expect(
      this.teamsTable.or(this.teamsEmptyState),
      'Teams tab has finished rendering',
    ).toBeVisible();
  }

  async openPeopleTab() {
    await this.peopleNavLink.click();
    await expect(
      this.invitePeopleButton,
      '"Invite people" button is visible on the People tab',
    ).toBeVisible();
  }

  /** Adds one email to the invite list via Enter — doesn't send.
   * Assumes the invite modal is already open. */
  async addEmailToInviteList(email: string) {
    await this.invitePeopleEmailInput.fill(email);
    await this.page.keyboard.press('Enter');
  }

  /** Sends every email currently in the invite list. Assumes the invite
   * modal is already open with at least one address added. */
  async sendInvites() {
    await this.sendInviteButton.click();
  }

  /** Self-healing — a click right after a fresh navigation can silently
   * no-op before React's handler attaches (same race as openSettings()). */
  async openInvitePeopleModal() {
    await expect(async () => {
      await this.invitePeopleButton.click();
      await expect(
        this.invitePeopleEmailInput,
        '"Invite people" modal is open',
      ).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 30000 });
  }

  /** Invites emails to the organization (pending, not members) — navigates
   * to the People tab first, since invitePeopleButton isn't visible elsewhere. */
  async invitePersonToOrganization(emails: string | string[]) {
    await this.openPeopleTab();
    await this.openInvitePeopleModal();
    for (const email of Array.isArray(emails) ? emails : [emails]) {
      await this.addEmailToInviteList(email);
    }
    await this.sendInvites();
  }

  /** Self-healing, same hydration race as openOrgSwitcher(). Checked via
   * `aria-selected`, not visibility — `pendingTable` is identical to `peopleTable`. */
  async openPendingTab() {
    await expect(async () => {
      if ((await this.pendingTab.getAttribute('aria-selected')) !== 'true') {
        await this.pendingTab.click();
      }
      await expect(this.pendingTab, 'Pending tab is the active one').toHaveAttribute(
        'aria-selected',
        'true',
        { timeout: 2000 },
      );
    }).toPass({ timeout: 15000 });
  }

  /** Opens a Teams table row's "Team options" menu — its button only shows
   * on row hover. Self-healing, same hydration race as openPendingTab(). */
  async openTeamOptionsMenu(teamName: string) {
    const row = this.getTeamsTableRow(teamName);
    await expect(async () => {
      await row.hover();
      await row
        .getByRole('button', { name: `Team options for ${teamName}` })
        .click();
      await expect(
        this.moveTeamMenuItem,
        `"Team options" menu for "${teamName}" is open`,
      ).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  }

  async openMoveTeamDialog(teamName: string) {
    await this.openTeamOptionsMenu(teamName);
    await this.moveTeamMenuItem.click();
    await expect(
      this.moveTeamDialog,
      `"Move ${teamName} to another org" dialog is open`,
    ).toBeVisible();
  }

  async selectMoveTeamDestination(orgName: string) {
    await this.getMoveTeamDestinationLabel(orgName).click();
  }

  async cancelMoveTeam() {
    await this.moveTeamCancelButton.click();
    await expect(this.moveTeamDialog, 'Move team dialog is closed').toBeHidden();
  }

  /** Confirms the move and waits for its "<team> moved to <org>" toast. */
  async confirmMoveTeam(teamName: string, orgName: string) {
    await this.moveTeamSubmitButton.click();
    await expect(
      this.page.getByText(`${teamName} moved to ${orgName}`, { exact: true }),
      `"${teamName} moved to ${orgName}" toast is shown`,
    ).toBeVisible();
  }

  async openRemoveTeamFromOrgDialog(teamName: string) {
    await this.openTeamOptionsMenu(teamName);
    await this.removeTeamFromOrgMenuItem.click();
    await expect(
      this.removeTeamDialog,
      `"Remove ${teamName} from the organization" dialog is open`,
    ).toBeVisible();
  }

  async confirmRemoveTeamFromOrg() {
    await this.removeTeamConfirmButton.click();
    await expect(this.removeTeamDialog, 'Remove team dialog is closed').toBeHidden();
  }

  /** Opens the cancel-invitation dialog — the row's Cancel button only
   * shows on hover. Assumes the Pending tab is already open. */
  async openCancelPendingInvitationDialog(email: string) {
    const row = this.getPendingTableRow(email);
    await row.hover();
    await row.getByRole('button', { name: 'Cancel' }).click();
    await expect(
      this.page.getByText(`Cancel the invitation to ${email}?`),
      `Cancel-invitation dialog names "${email}"`,
    ).toBeVisible();
  }

  /** Confirms canceling the invitation from the already-open dialog. */
  async confirmCancelPendingInvitation() {
    await this.page
      .getByRole('button', { name: 'Cancel the invitation', exact: true })
      .click();
    await expect(
      this.page.getByText(
        'The user will no longer be able to join your organization.',
      ),
      'Invitation-canceled message is shown',
    ).toBeVisible();
  }

  /** The profile's display name, stripped of userMenuButton's leading avatar-initials text ("DU"). */
  async getUserName(): Promise<string> {
    const rawText = (await this.userMenuButton.textContent()) ?? '';
    return rawText.replace(/^\w{2}\n?/, '').trim();
  }

  async clickTryItFreeButton() {
    await this.tryItFreeButton.click();
  }

  /** Retries the click if the modal doesn't appear — needed occasionally
   * right after a fresh navigation, before the click handler has attached. */
  async openSettings() {
    await expect(async () => {
      await this.settingsButton.click();
      await expect(
        this.settingsModal,
        'Organization settings modal is visible after clicking Settings',
      ).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  }

  async closeSettingsModal() {
    await this.settingsModalCloseButton.click();
    await expect(
      this.settingsModal,
      'Organization settings modal is closed',
    ).not.toBeVisible();
  }

  /** Fills the name and saves. Leaves the modal open afterward — it does
   * NOT auto-close; call closeSettingsModal() if you need the page behind it. */
  async renameOrganization(newName: string) {
    await this.orgNameInput.fill(newName);
    await this.saveChangesButton.click();
    await expect(
      this.settingsSavedMessage,
      'Rename success message is shown after saving',
    ).toBeVisible();
  }

  /** Selects a local image for the org logo — shows an instant local
   * preview only; nothing saves until saveSettingsChanges() is called. */
  async uploadOrgLogo(filePath: string) {
    await this.orgLogoUploadInput.setInputFiles(filePath);
  }

  /** One shared Save changes button/toast for both the name and the logo, same as renameOrganization(). */
  async saveSettingsChanges() {
    await this.saveChangesButton.click();
    await expect(
      this.settingsSavedMessage,
      'Success message is shown after saving',
    ).toBeVisible();
  }

  /** Opens the org switcher unless already open. Retries because an early click can
   * open the user menu instead (hydration race), so that menu is closed first. */
  async openOrgSwitcher() {
    await expect(async () => {
      if (await this.userMenuItem.first().isVisible()) {
        await this.page.keyboard.press('Escape');
      }
      if (!(await this.orgSwitcherItem.first().isVisible())) {
        await this.orgSwitcherButton.click();
      }
      await expect(
        this.orgSwitcherItem.first(),
        'Org switcher dropdown items are visible after opening it',
      ).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  }

  /** Opens the org switcher and picks the given org. */
  async switchToOrg(orgName: string) {
    await this.openOrgSwitcher();
    await this.orgSwitcherItem.filter({ hasText: orgName }).click();
  }

  async openUserMenu() {
    await this.userMenuButton.click();
    await expect(
      this.userMenuItem.first(),
      'User menu items are visible after opening it',
    ).toBeVisible();
  }

  async clickLogout() {
    await this.logoutMenuItem.click();
  }

  /** Hovers a top-level submenu trigger (e.g. AdminConsoleUserMenuItem.HelpAndLearning)
   * to reveal its children in the same flat menuitem list. */
  async hoverUserMenuItem(name: AdminConsoleUserMenuItemName) {
    await this.getUserMenuItemByName(name).hover();
  }

  /** Opens the user menu and clicks Logout. Leaves the assertion of where
   * this lands (the login page) to the caller, via LoginPage. */
  async logout() {
    await this.openUserMenu();
    await this.clickLogout();
  }

  /** Opens the explanation panel ("What happens if you delete..."). */
  async openDeleteOrganizationPanel() {
    await this.deleteOrganizationNavItem.click();
    await expect(
      this.deleteOrgExplanationConfirmButton,
      'Delete-organization explanation panel is open',
    ).toBeVisible();
  }

  /** Doesn't reliably open the "Are you sure?" dialog — an org with
   * nothing at stake deletes immediately instead. Use deleteOrganization() for either outcome. */
  async clickDeleteOrganizationExplanationConfirm() {
    await this.deleteOrgExplanationConfirmButton.click();
  }

  async expandAffectedTeams() {
    await this.deleteOrgAffectedTeamsToggle.click();
  }

  /** Clicks the "Are you sure?" dialog's own final confirm button. */
  async confirmDeleteOrganization() {
    await this.deleteOrgFinalConfirmButton.click();
    await expect(
      this.orgDeletedToast,
      'Organization-deleted toast is shown after confirming',
    ).toBeVisible();
  }

  /** Full delete flow, handling either shape (see
   * clickDeleteOrganizationExplanationConfirm()). Assumes the settings modal is already open. */
  async deleteOrganization() {
    await this.openDeleteOrganizationPanel();
    await this.clickDeleteOrganizationExplanationConfirm();
    const dialogAppeared = await this.deleteOrgConfirmDialog
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    if (dialogAppeared) {
      await this.confirmDeleteOrganization();
    } else {
      await expect(
        this.orgDeletedToast,
        'Organization-deleted toast is shown (explanation-panel click deleted it immediately, no team/file was at stake)',
      ).toBeVisible();
    }
  }

  /* -------------------------------------------------
   * Assertions
   * ------------------------------------------------- */

  async isSaveChangesButtonDisabled(disabled = true) {
    disabled
      ? await expect(
          this.saveChangesButton,
          '"Save changes" button is disabled',
        ).toBeDisabled()
      : await expect(
          this.saveChangesButton,
          '"Save changes" button is enabled',
        ).toBeEnabled();
  }

  async isOrgListedInSwitcher(orgName: string, listed = true) {
    const item = this.orgSwitcherItem.filter({ hasText: orgName });
    listed
      ? await expect(
          item,
          `Organization "${orgName}" is listed in the org switcher`,
        ).toBeVisible()
      : await expect(
          item,
          `Organization "${orgName}" is not listed in the org switcher`,
        ).toHaveCount(0);
  }

  /** Matches /admin-console/organization/{slug}/{uuid}(/...)? — the trailing
   * segment is optional, a valid real state, not just a redirect-to-/people shape. */
  async isOnOrganizationAdminConsole(orgSlug?: string) {
    const pattern = orgSlug
      ? new RegExp(`/admin-console/organization/${orgSlug}/[^/]+(/|$)`)
      : /\/admin-console\/organization\/[^/]+\/[^/]+(\/|$)/;
    await expect(
      this.page,
      orgSlug
        ? `On the Admin Console URL for organization "${orgSlug}"`
        : 'On an organization Admin Console URL',
    ).toHaveURL(pattern);
  }

  /** Matches the bare /admin-console URL — real state for a profile with no
   * org yet, or after logging back in from a redirect that originated there. */
  async isOnAdminConsoleRootUrl() {
    await expect(
      this.page,
      'On the bare Admin Console URL (no organization in the path)',
    ).toHaveURL(/\/admin-console\/?$/);
  }

  /** Checks the org name heading rather than the URL — the URL's slug
   * segment isn't guaranteed to self-correct after a wrong-slug navigation. */
  async isDisplayingOrganization(orgName: string) {
    // Scoped to `main` — the closing org switcher dropdown (outside it) still lists the same name right after switching.
    await expect(
      this.page.getByRole('main').getByText(orgName, { exact: true }),
      `Organization "${orgName}" is the one displayed`,
    ).toBeVisible();
  }

  /** Asserts the HTTP status of a direct navigation to an Admin Console
   * URL (e.g. a non-member's org URL should resolve to a 404). */
  hasNavigationStatusCode(response: Response | null, status: number) {
    expect(
      response?.status(),
      `Admin Console navigation returns an HTTP ${status} response`,
    ).toBe(status);
  }

  async isPageNotFoundVisible() {
    await expect(this.pageNotFoundHeading, '404 page is shown').toBeVisible();
    await expect(
      this.pageNotFoundText,
      '"This page doesn\'t exist" message is shown',
    ).toBeVisible();
    await expect(
      this.backToHomeButton,
      '"Back to home" button is shown',
    ).toBeVisible();
  }

  /** Extracts {slug, orgId} from the current /admin-console/organization/... URL. */
  getOrgSlugAndIdFromUrl(): { slug: string; orgId: string } {
    const match = new URL(this.page.url()).pathname.match(
      /\/admin-console\/organization\/([^/]+)\/([^/]+)/,
    );
    if (!match) {
      throw new Error(
        `Not on an organization Admin Console URL: ${this.page.url()}`,
      );
    }
    const [, slug, orgId] = match;
    return { slug, orgId };
  }

  async isEnterpriseModalVisible(visible = true) {
    visible
      ? await expect(
          this.tryItFreeButton,
          '"Unlock Enterprise Features" modal is visible',
        ).toBeVisible()
      : await expect(
          this.tryItFreeButton,
          '"Unlock Enterprise Features" modal is not visible',
        ).not.toBeVisible();
  }

  async isCurrentPlanLinkVisible(visible = true) {
    visible
      ? await expect(
          this.currentPlanLink,
          '"See my current plan" link is visible',
        ).toBeVisible()
      : await expect(
          this.currentPlanLink,
          '"See my current plan" link is not visible',
        ).not.toBeVisible();
  }

  async isWelcomeCreateOrganizationButtonVisible(visible = true) {
    visible
      ? await expect(
          this.welcomeCreateOrganizationButton,
          'Admin Console welcome empty state shows "Create organization"',
        ).toBeVisible()
      : await expect(
          this.welcomeCreateOrganizationButton,
          'Admin Console welcome "Create organization" button is not visible',
        ).not.toBeVisible();
  }

  async isOrgNameInputValue(expectedName: string) {
    await expect(
      this.orgNameInput,
      `Name field is pre-filled with "${expectedName}"`,
    ).toHaveValue(expectedName);
  }

  async isOrgCreatedDateVisible(visible = true) {
    visible
      ? await expect(
          this.orgCreatedDateText,
          'Organization creation date is shown',
        ).toBeVisible()
      : await expect(
          this.orgCreatedDateText,
          'Organization creation date is not shown',
        ).not.toBeVisible();
  }

  async isDeleteOrgConfirmDialogVisible(visible = true) {
    visible
      ? await expect(
          this.deleteOrgConfirmDialog,
          '"Are you sure?" confirmation dialog is shown (org has a team/file at stake)',
        ).toBeVisible()
      : await expect(
          this.deleteOrgConfirmDialog,
          '"Are you sure?" confirmation dialog is not shown',
        ).not.toBeVisible();
  }

  /** Checks the "Are you sure?" dialog's affected member/team/file counts text. */
  async hasDeleteOrgAffectedCountsText(expectedText: string) {
    await expect(
      this.deleteOrgAffectedCountsText,
      'Affected member/team/file counts match the expected data',
    ).toHaveText(expectedText);
  }

  async isTeamListedInAffectedTeams(teamName: string, listed = true) {
    const item = this.deleteOrgConfirmDialog.getByText(teamName);
    listed
      ? await expect(
          item,
          `Team "${teamName}" is listed in the affected teams`,
        ).toBeVisible()
      : await expect(
          item,
          `Team "${teamName}" is not listed in the affected teams`,
        ).toHaveCount(0);
  }

  async isLogoutMenuItemVisible(visible = true) {
    visible
      ? await expect(
          this.logoutMenuItem,
          'Logout option is shown in the user menu',
        ).toBeVisible()
      : await expect(
          this.logoutMenuItem,
          'Logout option is not shown in the user menu',
        ).not.toBeVisible();
  }

  async isUserMenuItemVisible(name: AdminConsoleUserMenuItemName, visible = true) {
    const item = this.getUserMenuItemByName(name);
    visible
      ? await expect(item, `"${name}" is shown in the user menu`).toBeVisible()
      : await expect(
          item,
          `"${name}" is not shown in the user menu`,
        ).not.toBeVisible();
  }

  /** Checks the Teams table has exactly the expected columns, in order. */
  async hasExpectedTeamsTableColumns() {
    const headers = this.teamsTable.getByRole('columnheader');
    // 8th column is the unlabeled per-row actions (kebab menu) column.
    await expect(
      headers,
      'Teams table has the expected number of columns',
    ).toHaveCount(8);
    await expect(
      headers.filter({ hasText: /\S/ }),
      'Teams table has the expected labeled columns, in order',
    ).toHaveText([
      'Team',
      'Created',
      'Owner',
      'Projects',
      'Files',
      'Members',
      'Last activity',
    ]);
  }

  async isTeamListedInTeamsTable(teamName: string, listed = true) {
    const row = this.getTeamsTableRow(teamName);
    listed
      ? await expect(row, `Team "${teamName}" is listed`).toBeVisible()
      : await expect(row, `Team "${teamName}" is not listed`).toHaveCount(0);
  }

  /** Checks the Team column's avatar — a styled `aria-hidden` span with initials, not a real `<img>`. */
  async isTeamAvatarShownInTeamsTable(teamName: string) {
    const avatar = this.getTeamsTableCell(teamName, TeamsTableColumn.Team).locator(
      'span[aria-hidden="true"]',
    );
    await expect(
      avatar,
      `Team "${teamName}" has an avatar shown in the Team column`,
    ).toBeVisible();
  }

  /** Checks the Created column's date format (e.g. "9 Sep 2026"), not the exact date. */
  async hasStandardCreatedDateFormat(teamName: string) {
    await expect(
      this.getTeamsTableCell(teamName, TeamsTableColumn.Created),
      'Created column shows a standard "D Mon YYYY" date',
    ).toHaveText(/^\d{1,2} \w{3} \d{4}$/);
  }

  /** Checks the Owner column shows both an avatar (initials) and the given
   * owner's full name. */
  async hasTeamOwnerInTeamsTable(teamName: string, ownerName: string) {
    const ownerCell = this.getTeamsTableCell(teamName, TeamsTableColumn.Owner);
    await expect(
      ownerCell.locator('span[aria-hidden="true"]'),
      `Owner column has an avatar for "${ownerName}"`,
    ).toBeVisible();
    await expect(ownerCell, `Owner column shows "${ownerName}"`).toContainText(
      ownerName,
    );
  }

  /** Checks the Projects/Files/Members counts for a team's row. */
  async hasTeamCountsInTeamsTable(
    teamName: string,
    counts: { projects: number; files: number; members: number },
  ) {
    await expect(
      this.getTeamsTableCell(teamName, TeamsTableColumn.Projects),
      `Projects count is ${counts.projects}`,
    ).toHaveText(String(counts.projects));
    await expect(
      this.getTeamsTableCell(teamName, TeamsTableColumn.Files),
      `Files count is ${counts.files}`,
    ).toHaveText(String(counts.files));
    await expect(
      this.getTeamsTableCell(teamName, TeamsTableColumn.Members),
      `Members count is ${counts.members}`,
    ).toHaveText(String(counts.members));
  }

  async isMemberListedInPeopleTable(memberName: string, listed = true) {
    const row = this.getPeopleTableRow(memberName);
    listed
      ? await expect(row, `Member "${memberName}" is listed`).toBeVisible()
      : await expect(row, `Member "${memberName}" is not listed`).toHaveCount(0);
  }

  /** Clicks the row's "Remove" action — self-healing, same hydration race
   * as openPendingTab(). No team → removed immediately; belongs to a team → see isRemoveMemberDialogShown(). */
  async removeMemberFromPeopleTable(memberName: string) {
    const row = this.getPeopleTableRow(memberName);
    await expect(async () => {
      await row.hover();
      await row.getByRole('button', { name: /remove/i }).click();
      // Matches isRemoveMemberDialogShown()'s 15000ms — shorter risks misreading a slow dialog as "no effect" and re-clicking.
      const acted = await Promise.race([
        this.removeMemberConfirmButton
          .waitFor({ state: 'visible', timeout: 15000 })
          .then(() => true)
          .catch(() => false),
        row
          .waitFor({ state: 'detached', timeout: 15000 })
          .then(() => true)
          .catch(() => false),
      ]);
      if (!acted) {
        throw new Error(`Remove action for "${memberName}" had no visible effect`);
      }
    }).toPass({ timeout: 45000 });
  }

  /** Body text differs by case: sole team member warns of deletion,
   * otherwise it's a plain "removed from all teams" notice. */
  async isRemoveMemberDialogShown(memberName: string, bodyText: string) {
    // Deciding dialog-vs-immediate-removal needs a backend team-membership
    // check first — can outrun the default timeout under CI load.
    await expect(
      this.page.getByRole('heading', {
        name: `Remove ${memberName} from the organization?`,
      }),
      `Remove-member confirmation dialog for "${memberName}" is shown`,
    ).toBeVisible({ timeout: 15000 });
    await expect(
      this.page.getByText(bodyText, { exact: true }),
      `Remove-member dialog body is "${bodyText}"`,
    ).toBeVisible();
  }

  /** Confirms the remove-member dialog and waits for its success message. */
  async confirmRemoveMember(memberName: string) {
    await this.removeMemberConfirmButton.click();
    await expect(
      this.page.getByText(`${memberName} has been removed`),
      `"${memberName} has been removed" message is shown`,
    ).toBeVisible();
  }

  /** Checks the Teams column count for a member's row in the People table
   * (e.g. after deleting one of their teams, this should drop). */
  async hasMemberTeamsCountInPeopleTable(memberName: string, count: number) {
    await expect(
      this.getPeopleTableCell(memberName, PeopleTableColumn.Teams),
      `Teams count for "${memberName}" is ${count}`,
    ).toHaveText(String(count));
  }

  /** Matched by alt text (the org name) — only set once a real logo is
   * chosen; the default placeholder has alt="". Same either way, before or after saving. */
  async isOrgLogoShown(orgName: string, visible = true) {
    const logo = this.page.getByAltText(orgName, { exact: true }).first();
    visible
      ? await expect(logo, `Logo for "${orgName}" is shown`).toBeVisible()
      : await expect(logo, `Logo for "${orgName}" is not shown`).not.toBeVisible();
  }

  /** Checks the invite modal's own address list (before sending), not the Pending tab's sent-invites table. */
  async isEmailInInviteList(email: string, listed = true) {
    const item = this.page.getByText(email, { exact: true });
    listed
      ? await expect(item, `"${email}" is in the invite list`).toBeVisible()
      : await expect(item, `"${email}" is not in the invite list`).toHaveCount(0);
  }

  async isPendingInvitationListed(email: string, listed = true) {
    const row = this.getPendingTableRow(email);
    listed
      ? await expect(
          row,
          `Pending invitation for "${email}" is listed`,
        ).toBeVisible()
      : await expect(
          row,
          `Pending invitation for "${email}" is not listed`,
        ).toHaveCount(0);
  }

  /** Checks the Date added column has some real content — not an exact
   * value, since it's always a relative "Just now"-style timestamp. */
  async hasPendingInvitationDateAdded(email: string) {
    await expect(
      this.getPendingTableCell(email, PendingTableColumn.DateAdded),
      `Pending invitation for "${email}" shows a date added`,
    ).not.toBeEmpty();
  }

  async isTeamOptionsMenuShown() {
    await expect(
      this.moveTeamMenuItem,
      '"Move to another org" option is shown',
    ).toBeVisible();
    await expect(
      this.removeTeamFromOrgMenuItem,
      '"Remove from org" option is shown',
    ).toBeVisible();
  }

  async isMoveTeamDialogShown(teamName: string) {
    await expect(
      this.moveTeamDialog.getByRole('heading'),
      'Move team dialog title names the team',
    ).toHaveText(`Move ${teamName} to another of your organizations?`);
    await expect(
      this.moveTeamDialog.getByText(
        'Projects and files will remain available to team members. The team will get the configuration from the new organization.',
        { exact: true },
      ),
      'Move team dialog explains what happens to the team',
    ).toBeVisible();
    await expect(this.moveTeamCancelButton, 'Cancel button is shown').toBeVisible();
    await expect(
      this.moveTeamSubmitButton,
      '"Move team" button is shown',
    ).toBeVisible();
  }

  /** Checks the dialog offers exactly these destinations, in any order. */
  async hasMoveTeamDestinations(orgNames: string[]) {
    await expect(
      this.moveTeamDestinations,
      `Move team dialog lists ${orgNames.length} destination(s)`,
    ).toHaveCount(orgNames.length);
    for (const orgName of orgNames) {
      await expect(
        this.getMoveTeamDestinationLabel(orgName),
        `"${orgName}" is listed as a destination`,
      ).toBeVisible();
    }
  }

  async isMoveTeamDestinationSelected(orgName: string, selected = true) {
    const radio = this.getMoveTeamDestinationLabel(orgName).getByRole('radio');
    selected
      ? await expect(radio, `"${orgName}" is selected`).toBeChecked()
      : await expect(radio, `"${orgName}" is not selected`).not.toBeChecked();
  }

  async isNoMoveTeamDestinationSelected() {
    await expect(
      this.moveTeamDialog.getByRole('radio', { checked: true }),
      'No destination is selected',
    ).toHaveCount(0);
  }

  async isMoveTeamButtonEnabled(enabled = true) {
    enabled
      ? await expect(
          this.moveTeamSubmitButton,
          '"Move team" is enabled',
        ).toBeEnabled()
      : await expect(
          this.moveTeamSubmitButton,
          '"Move team" is disabled',
        ).toBeDisabled();
  }

  /** The alert shown when the selected destination only allows its own
   * members in teams and the team has pending invitations to outsiders. */
  async isMoveTeamRevokeInvitationsAlertShown(
    teamName: string,
    orgName: string,
    visible = true,
  ) {
    const alert = this.moveTeamDialog.getByText(
      `${teamName} has pending invitations to people outside ${orgName}. Moving it will revoke those invitations.`,
      { exact: true },
    );
    visible
      ? await expect(alert, 'Revoke-invitations alert is shown').toBeVisible()
      : await expect(alert, 'Revoke-invitations alert is not shown').toBeHidden();
  }

  /** `notMember`: the user isn't in the team, so the dialog also warns that
   * they'll lose access to it. */
  async isRemoveTeamDialogShown(
    teamName: string,
    orgName: string,
    { notMember = false } = {},
  ) {
    await expect(
      this.removeTeamDialog.getByRole('heading'),
      'Remove team dialog title names the team and the org',
    ).toHaveText(`Remove ${teamName} from ${orgName}?`);
    await expect(
      this.removeTeamDialog.getByText(
        `${teamName} will leave ${orgName}. The team, its projects and files are not deleted and will keep working. You will find them under 'Other teams'`,
        { exact: true },
      ),
      'Remove team dialog explains the team keeps working',
    ).toBeVisible();
    const accessWarning = this.removeTeamDialog.getByText(
      `You are not a member of ${teamName}, so you will lose access to its projects and files.`,
      { exact: true },
    );
    notMember
      ? await expect(accessWarning, 'Access-loss warning is shown').toBeVisible()
      : await expect(accessWarning, 'Access-loss warning is not shown').toBeHidden();
  }
}
