import { type Locator, type Page, type Response, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Named user-menu item labels, for typed use with
 * AdminConsolePage.isUserMenuItemVisible()/hoverUserMenuItem() instead of
 * hardcoding text in each test. Two entries (AboutPenpot, VersionNotes) are
 * regexes rather than plain strings — both embed the current Penpot version
 * number (e.g. "About Penpot 2.18.0"), which will drift on every release.
 */
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
  // "Community & Contributions" submenu — Community needs the exact-match
  // regex since a plain substring also matches its own parent trigger item,
  // "Community & Contributions".
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
 * Column position (0-indexed) in the Teams tab's table, for typed use with
 * AdminConsolePage's getTeamsTableCell()-based methods instead of a magic
 * number in each test. This table has 7 columns, including a "Last
 * activity" column at the end.
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

/**
 * Column position (0-indexed) in the People tab's table, for typed use with
 * AdminConsolePage's getPeopleTableCell()-based methods instead of a magic
 * number in each test.
 */
export enum PeopleTableColumn {
  User = 0,
  DateAdded = 1,
  Teams = 2,
  Actions = 3,
}

/**
 * Column position (0-indexed) in the Pending tab's table, for typed use
 * with AdminConsolePage's getPendingTableCell()-based methods. The 3rd
 * column has no header text at all — just each row's Cancel button.
 */
export enum PendingTableColumn {
  User = 0,
  DateAdded = 1,
  Actions = 2,
}

/**
 * Covers the Admin Console app section itself (/admin-console/...) —
 * organization management once you're already inside it: the welcome/empty
 * state (reachable either by navigating there directly with no org yet, or
 * by landing there after a successful Enterprise checkout), and (as more
 * cases get automated) the People tab (members, pending invites, invite
 * modal), Teams tab, Advanced Permissions, and SSO Config.
 *
 * The dashboard-side entry points into Enterprise (the "+ Create org"
 * sidebar button, the sidebar promo widget, the org switcher dropdown) live
 * in OrganizationPage instead. Note the "Unlock Enterprise features" modal
 * and the "Create organization" naming modal are NOT necessarily shared
 * between the two: the Admin Console's own Enterprise modal
 * is a genuinely different component from the dashboard's (different title
 * capitalization, different CTA text — "Try 14 days for free" here vs "Try
 * it free for 14 days" there — and no activation-code link at all here) —
 * hence its own locators below rather than reusing OrganizationPage's. The
 * naming modal, by contrast, IS the same shared component in both places
 * (confirmed by PENPOT-3235/3236 and this file's own case both working
 * through OrganizationPage.createOrganization() unchanged).
 */
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

  // Organization logo — same settings modal, its own file input (confirmed
  // live: no visible text, only an aria-label). The logo
  // image itself always carries the organization's name as its alt text
  // once one has been chosen (default placeholder avatar has alt=""), both
  // for the instant local blob: preview (before Save changes) and the real
  // uploaded asset URL (after) — same locator serves both checks.
  readonly orgLogoUploadInput: Locator;

  // "Delete organization" flow — this has TWO different
  // shapes depending on what's actually at stake: (1) the nav item above
  // swaps the modal's right-hand content to an explanation panel with its
  // OWN "Delete organization" button (same text, different button —
  // disambiguated below by DOM order, nav item first); (2a) for an org with
  // no teams/files, clicking that button deletes immediately — no further
  // dialog; (2b) for an org with at least one team/file, it instead opens a
  // SEPARATE "Are you sure?" overlay with the real affected-counts text and
  // an expandable "Affected teams" list, whose own "Delete organization"
  // button is the one that actually deletes.
  readonly deleteOrgExplanationConfirmButton: Locator;
  readonly deleteOrgConfirmDialog: Locator;
  readonly deleteOrgAffectedCountsText: Locator;
  readonly deleteOrgAffectedTeamsToggle: Locator;
  readonly deleteOrgFinalConfirmButton: Locator;
  readonly orgDeletedToast: Locator;
  readonly pageNotFoundHeading: Locator;
  readonly pageNotFoundText: Locator;
  readonly backToHomeButton: Locator;

  // Admin Console's own org switcher (top-left, next to the org name) — a
  // different component from OrganizationPage's dashboard-sidebar switcher:
  // its items are role="menuitemradio" (with a checkmark for
  // the current org), not role="menuitem".
  readonly orgSwitcherButton: Locator;
  readonly orgSwitcherItem: Locator;
  readonly createOrganizationSwitcherItem: Locator;

  // Bottom-left user menu (account/help/logout). No stable testid or class
  // exists to key off (same generic Tailwind utility classes
  // as everything else in this design system) — matching its "Demo User ..."
  // display name is reliable instead, since this suite only ever runs as a
  // demo profile (see the file's own fixture comment above).
  readonly userMenuButton: Locator;
  readonly userMenuItem: Locator;
  readonly logoutMenuItem: Locator;

  // Advanced Permissions tab (sidebar nav item) — its own page object,
  // AdvancedPermissionsPage, covers everything past the click itself.
  readonly advancedPermissionsNavLink: Locator;

  // Teams tab (sidebar nav item) — a table listing every team in the org,
  // one row per team, 7 columns (see TeamsTableColumn).
  readonly teamsNavLink: Locator;
  readonly teamsTable: Locator;

  // People tab (sidebar nav item) — where the invitePeopleButton et al.
  // below actually live; not visible from the Teams tab. Its own table (one
  // row per org member, 4 columns — see PeopleTableColumn) is a different
  // `getByRole('table')` match from teamsTable, since only one of the two
  // tabs is ever open at a time.
  readonly peopleNavLink: Locator;
  readonly peopleTable: Locator;

  // People tab's "invite to the organization" modal — org-level invites,
  // distinct from a single team's own invite flow (TeamPage's), which
  // still works once a team belongs to an org — either kind adds the person to both.
  readonly invitePeopleButton: Locator;
  readonly invitePeopleEmailInput: Locator;
  readonly sendInviteButton: Locator;

  // Pending tab (People's sibling tab) — a table of not-yet-accepted
  // invitations, one row per invitee, 3 columns (see PendingTableColumn;
  // the 3rd has no header text, just each row's Cancel button). Confirmed
  // live the Cancel button only becomes visible on hovering its row.
  readonly pendingTab: Locator;
  readonly pendingTable: Locator;

  // Only shown when the target belongs to at least one team.
  readonly removeMemberConfirmButton: Locator;

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
    // Scoped by its own "Organization info" nav item text — the generic
    // `[class*="fixed inset-0"]` overlay wrapper this modal uses is shared
    // by unrelated overlays too, so it's not enough alone.
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
    // No accessible name at all — the only button in this
    // modal with neither visible text nor an aria-label (the "Close
    // notification" button next to the saved-message banner has an
    // aria-label, so it's excluded by this XPath condition).
    this.settingsModalCloseButton = this.settingsModal.locator(
      'xpath=.//button[not(@aria-label) and not(normalize-space())]',
    );
    this.orgLogoUploadInput = page.getByLabel('Upload avatar');

    // Same "Delete organization" text as deleteOrganizationNavItem above —
    // `.last()` reliably gets this one since the nav item always precedes
    // it in DOM order.
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

    // No accessible name either — there are 2
    // `[aria-haspopup="true"]` elements on the page (one off-screen at x=0,
    // presumably an unused/hidden duplicate), and this is reliably the
    // second/visible one.
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
    this.teamsTable = page.getByRole('table');
    this.peopleNavLink = page.getByRole('link', { name: 'People' });
    this.peopleTable = page.getByRole('table');

    // `.first()` — there are 2 identically-labelled "Invite
    // people" buttons when the People tab is in its empty state (the toolbar
    // one, and the empty-state hero's own copy); the toolbar one is always
    // present regardless of state, the hero one only when there are no
    // members/pending invites yet.
    this.invitePeopleButton = page
      .getByRole('button', { name: 'Invite people' })
      .first();
    this.invitePeopleEmailInput = page.getByPlaceholder(
      'Emails, separated by a comma',
    );
    // The label itself changes with the count: "Send invite"
    // for a single address, "Send N invites" (plural, with the number) for
    // more than one — one regex covers both rather than two locators.
    this.sendInviteButton = page.getByRole('button', {
      name: /^Send( \d+)? invites?$/,
    });

    this.pendingTab = page.getByRole('tab', { name: /^Pending/ });
    this.pendingTable = page.getByRole('table');

    this.removeMemberConfirmButton = page.getByRole('button', {
      name: 'Remove user',
    });
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  /**
   * Matches a user-menu item (top-level or, once its parent submenu item has
   * been hovered, one of its children) by its visible text — same item type
   * for both, hovering a submenu trigger just adds more
   * `role="menuitem"` elements to the same flat list, not a nested one.
   */
  private getUserMenuItemByName(name: AdminConsoleUserMenuItemName): Locator {
    return this.userMenuItem.filter({ hasText: name });
  }

  private getTeamsTableRow(teamName: string): Locator {
    return this.teamsTable.getByRole('row').filter({ hasText: teamName });
  }

  private getTeamsTableCell(teamName: string, column: TeamsTableColumn): Locator {
    return this.getTeamsTableRow(teamName).getByRole('cell').nth(column);
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

  async goToFiles() {
    await this.goToFilesLink.click();
  }

  async openAdvancedPermissionsTab() {
    await this.advancedPermissionsNavLink.click();
    await expect(this.page, 'On the Advanced Permissions tab').toHaveURL(
      /\/permissions$/,
    );
  }

  /** Checks the URL rather than the table itself — an org
   * with zero teams shows an entirely different empty state ("There are no
   * teams yet"), with no `<table>` element at all, not an empty table. */
  async openTeamsTab() {
    await this.teamsNavLink.click();
    await expect(this.page, 'On the Teams tab').toHaveURL(/\/teams$/);
  }

  async openPeopleTab() {
    await this.peopleNavLink.click();
    await expect(
      this.invitePeopleButton,
      '"Invite people" button is visible on the People tab',
    ).toBeVisible();
  }

  /** Types one email into the invite modal's input and confirms it with
   * Enter, adding it to the list of addresses to invite — does not send
   * anything by itself. Assumes the invite modal is already open. */
  async addEmailToInviteList(email: string) {
    await this.invitePeopleEmailInput.fill(email);
    await this.page.keyboard.press('Enter');
  }

  /** Sends every email currently in the invite list. Assumes the invite
   * modal is already open with at least one address added. */
  async sendInvites() {
    await this.sendInviteButton.click();
  }

  /** Opens the "Invite people" modal — self-healing (retries the click)
   * since clicking it right after a fresh navigation can silently no-op if
   * React's handler hasn't attached yet (same race as openSettings()/acceptCookie()). */
  async openInvitePeopleModal() {
    await expect(async () => {
      await this.invitePeopleButton.click();
      await expect(
        this.invitePeopleEmailInput,
        '"Invite people" modal is open',
      ).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 30000 });
  }

  /** Invites one or more emails to the organization (People tab) — pending
   * invitations, not existing members. Navigates to the People tab first,
   * since invitePeopleButton et al. aren't visible from other tabs. */
  async invitePersonToOrganization(emails: string | string[]) {
    await this.openPeopleTab();
    await this.openInvitePeopleModal();
    for (const email of Array.isArray(emails) ? emails : [emails]) {
      await this.addEmailToInviteList(email);
    }
    await this.sendInvites();
  }

  /** Self-healing — same hydration race as openOrgSwitcher()/openSettings()
   * when clicked right after openPeopleTab(). Checked via `aria-selected`,
   * not `pendingTable`'s visibility: that locator is identical to
   * `peopleTable`, so it stays visible even while Members is still active. */
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

  /** Opens the confirmation dialog for canceling one pending invitation —
   * the row's own Cancel button only becomes visible on
   * hover, and the dialog names the invitee by email. Assumes the Pending
   * tab is already open. */
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

  /** The current profile's display name (e.g. "Demo User <uuid>"), stripped
   * of the leading avatar-initials text ("DU") userMenuButton's raw text
   * also includes. */
  async getUserName(): Promise<string> {
    const rawText = (await this.userMenuButton.textContent()) ?? '';
    return rawText.replace(/^\w{2}\n?/, '').trim();
  }

  async clickTryItFreeButton() {
    await this.tryItFreeButton.click();
  }

  /**
   * Opens the organization settings modal. Retries the click if the modal
   * doesn't appear — this is occasionally needed right after
   * a fresh full-page navigation straight into the Admin Console (e.g. via
   * page.goto(adminConsoleUrl)): the button is visibly actionable before its
   * click handler has actually finished attaching, so an isolated click can
   * silently do nothing once in a while.
   */
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

  /**
   * Fills the org name field and saves. Leaves the modal open afterward
   * (showing the "Your changes were saved." message) — the
   * modal does NOT auto-close on save, call closeSettingsModal() after if
   * you need to interact with the page behind it.
   */
  async renameOrganization(newName: string) {
    await this.orgNameInput.fill(newName);
    await this.saveChangesButton.click();
    await expect(
      this.settingsSavedMessage,
      'Rename success message is shown after saving',
    ).toBeVisible();
  }

  /** Selects a local image file for the org logo — this
   * shows an instant local preview (no upload yet, Save changes only
   * becomes enabled at this point); nothing is actually saved until
   * saveSettingsChanges() is called separately. */
  async uploadOrgLogo(filePath: string) {
    await this.orgLogoUploadInput.setInputFiles(filePath);
  }

  /** Clicks Save changes and waits for the same "Your changes were saved."
   * message renameOrganization() uses — this settings modal has one shared
   * Save changes button/toast for both the name and the logo. */
  async saveSettingsChanges() {
    await this.saveChangesButton.click();
    await expect(
      this.settingsSavedMessage,
      'Success message is shown after saving',
    ).toBeVisible();
  }

  /** Opens the org switcher, unless it's already open — clicking the trigger
   * again would just toggle it closed instead (this broke
   * switchToOrg() when a prior step had already opened it).
   *
   * Retries the click: right after a fresh navigation, `orgSwitcherButton`'s
   * `aria-haspopup` attribute can attach after the button is already
   * clickable, so an early click lands on the user-menu button (the only
   * other, already-hydrated `aria-haspopup` element) instead — same
   * hydration race as openSettings() above, different button. */
  async openOrgSwitcher() {
    await expect(async () => {
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

  /**
   * Clicks the explanation panel's own confirm button. This
   * does NOT reliably open the "Are you sure?" dialog — for an org with
   * nothing at stake (no teams/files) it deletes immediately instead, right
   * here. No assertion on what happens next; callers that need the dialog
   * (because they know the org has a team/file) should assert
   * deleteOrgConfirmDialog's visibility themselves, or use
   * deleteOrganization() which handles either outcome.
   */
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

  /**
   * Full delete flow, handling either shape: nav item → explanation panel's
   * confirm → (if the org has a team/file) the "Are you sure?" dialog's own
   * final confirm, otherwise the explanation panel's click already deleted
   * it. Either way, ends with the deleted toast visible. Assumes the
   * settings modal is already open (via openSettings()).
   */
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

  /**
   * Matches /admin-console/organization/{slug}/{uuid}(/...)? URLs. The
   * trailing segment is optional — navigating straight to
   * .../organization/{slug}/{id} with no further path (no /people) is a
   * valid, real state the app leaves the URL in, not just an
   * always-redirects-to-/people shape.
   */
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

  /** Matches the bare /admin-console URL (no organization in the path) —
   * this is the real state left in the URL bar both for a
   * profile with no organization yet (the welcome screen) and, more
   * generally, right after logging back in from a redirect that originated
   * there. */
  async isOnAdminConsoleRootUrl() {
    await expect(
      this.page,
      'On the bare Admin Console URL (no organization in the path)',
    ).toHaveURL(/\/admin-console\/?$/);
  }

  /**
   * Checks the org name heading itself rather than the URL — use this when
   * the URL's slug segment isn't guaranteed to self-correct (confirmed
   * live: navigating with a deliberately wrong slug but a valid org id
   * reliably resolves to the right organization's content, but doesn't
   * always rewrite the URL bar back to the real slug — inconsistent, not a
   * bug in this helper).
   */
  async isDisplayingOrganization(orgName: string) {
    // Not a semantic heading — it's a styled div, same
    // pattern as the newer Tailwind components elsewhere (no ARIA role).
    await expect(
      this.page.getByText(orgName, { exact: true }),
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
    await expect(
      this.teamsTable.getByRole('columnheader'),
      'Teams table has the expected columns, in order',
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

  /** Checks the Team column shows both an avatar (initials) and the team's
   * name — the avatar is a styled `aria-hidden` span with the
   * team's initials, not a real `<img>`. */
  async isTeamAvatarShownInTeamsTable(teamName: string) {
    const avatar = this.getTeamsTableCell(teamName, TeamsTableColumn.Team).locator(
      'span[aria-hidden="true"]',
    );
    await expect(
      avatar,
      `Team "${teamName}" has an avatar shown in the Team column`,
    ).toBeVisible();
  }

  /** Checks the Created column shows a standard "D Mon YYYY" date (e.g.
   * "9 Sep 2026"), not asserting the exact date — the team could have been
   * created moments before the check runs. */
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

  /** Clicks the row's "Remove" action (hover to reveal). No team → removed
   * immediately, verify via `isMemberListedInPeopleTable(name, false)` (no
   * reliable toast). Belongs to a team → see `isRemoveMemberDialogShown()`. */
  async removeMemberFromPeopleTable(memberName: string) {
    const row = this.getPeopleTableRow(memberName);
    await row.hover();
    await row.getByRole('button', { name: /remove/i }).click();
  }

  /** Body text differs by case: sole team member warns of deletion,
   * otherwise it's a plain "removed from all teams" notice. */
  async isRemoveMemberDialogShown(memberName: string, bodyText: string) {
    await expect(
      this.page.getByRole('heading', {
        name: `Remove ${memberName} from the organization?`,
      }),
      `Remove-member confirmation dialog for "${memberName}" is shown`,
    ).toBeVisible();
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

  /** Checks a chosen org logo is shown — matched by alt text (the org's own
   * name), which the image only carries once a real logo has been chosen;
   * the untouched default placeholder avatar has alt="". Works both for the
   * instant local preview (before Save changes) and the real uploaded
   * image (after) — same alt text either way. */
  async isOrgLogoShown(orgName: string, visible = true) {
    const logo = this.page.getByAltText(orgName, { exact: true }).first();
    visible
      ? await expect(logo, `Logo for "${orgName}" is shown`).toBeVisible()
      : await expect(logo, `Logo for "${orgName}" is not shown`).not.toBeVisible();
  }

  /** Checks whether an email appears anywhere in the invite modal's own
   * list of addresses to invite (before sending) — not the Pending tab's
   * table, which only reflects invitations that have actually been sent. */
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
}
