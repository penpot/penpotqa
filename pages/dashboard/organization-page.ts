import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';
import { waitSecondMessage, getRegisterMessage } from 'helpers/gmail';

/** Enterprise "Organization" entry points on the dashboard: org switcher, promo
 * widget, "Unlock Enterprise features" modal and "Create organization" modal. */
export class OrganizationPage extends BasePage {
  // Sidebar entry points
  readonly orgSwitcherButton: Locator;
  readonly sidebarPromoWidget: Locator;
  // Promo widget CTA: "Try it free…" when unlicensed, "Create organization" when
  // licensed but org-less. Scoped to the widget to avoid the modal's same-named CTA.
  readonly sidebarPromoTryItFreeButton: Locator;
  readonly sidebarPromoCreateOrgButton: Locator;

  // "Unlock Enterprise features" modal: no usable wrapper, so its parts are scoped
  // by their own classes and "open" is checked via tryItFreeButton.
  readonly tryItFreeButton: Locator;
  readonly activationCodeLink: Locator;
  readonly currentPlanLink: Locator;

  // Manual activation-code flow, reached via activationCodeLink (Qase 3437)
  readonly activationCodeInput: Locator;
  readonly activateCodeButton: Locator;
  readonly welcomeModalCloseButton: Locator;
  readonly subscriptionsPageActivationCodeButton: Locator;

  // Sidebar current-plan label ("Professional"/"Enterprise").
  readonly currentPlanSidebarText: Locator;

  // Settings > Subscription: Enterprise card CTA and its confirmation modal (no
  // wrapper; its primary button is an <input type="button">).
  readonly subscriptionsPageEnterpriseTryButton: Locator;
  readonly subscriptionConfirmModalPrimaryButton: Locator;

  // Org switcher dropdown (sidebar)
  readonly orgDropdown: Locator;
  readonly orgDropdownItem: Locator;
  readonly createOrgDropdownItem: Locator;
  readonly goToAdminConsoleDropdownItem: Locator;
  readonly otherTeamsDropdownItem: Locator;
  readonly createTeamDropdownItem: Locator;

  // Closed switcher: line 1 is the current team, line 2 its organization.
  readonly currentTeamName: Locator;
  readonly currentOrganizationName: Locator;

  // "Team management" menu (three-dot button next to the org/team switcher)
  readonly organizationOptionsButton: Locator;
  readonly leaveOrgMenuItem: Locator;
  readonly promoteAndLeaveButton: Locator;

  // "Create organization" modal: scoped by its <form>, since the page behind it
  // can have its own "Create organization" button.
  readonly createOrgModalForm: Locator;
  readonly orgNameInput: Locator;
  readonly createOrgSubmitButton: Locator;
  readonly maybeLaterButton: Locator;

  constructor(page: Page) {
    super(page);

    // Same combined org/team switcher button as TeamPage.teamCurrentBtn —
    // organizations and teams share one dropdown.
    this.orgSwitcherButton = page.locator(
      'button[class*="organization_team_switch__current-selection"]',
    );
    this.sidebarPromoWidget = page.locator(
      '.main_ui_dashboard_subscription__nitrate-banner',
    );
    this.sidebarPromoTryItFreeButton = this.sidebarPromoWidget.getByRole('button', {
      name: 'Try it free for 14 days',
    });
    this.sidebarPromoCreateOrgButton = this.sidebarPromoWidget.getByRole('button', {
      name: 'Create organization',
    });

    // CSS class on purpose: getByRole would match the sidebar widget's identical
    // "Try it free for 14 days" button, hidden behind the modal overlay.
    this.tryItFreeButton = page.locator(
      '.main_ui_nitrate_nitrate_form__modal-button',
    );
    // The link has no href, so it has no link role: getByText is the only option.
    this.activationCodeLink = page.getByText('Subscribe with an activation code');
    this.currentPlanLink = page.getByRole('link', {
      name: 'See my current plan',
    });

    this.activationCodeInput = page.getByPlaceholder(
      'Paste your activation code here',
    );
    this.activateCodeButton = page.getByRole('button', {
      name: 'Activate',
      exact: true,
    });
    this.welcomeModalCloseButton = page.locator(
      '.main_ui_nitrate_nitrate_activation_success_modal__close-btn',
    );
    this.currentPlanSidebarText = page
      .locator('.main_ui_dashboard_subscription__nitrate-current-plan-text')
      .first();
    this.subscriptionsPageActivationCodeButton = page.getByRole('button', {
      name: 'Enter activation code',
    });
    this.subscriptionsPageEnterpriseTryButton = page.getByRole('button', {
      name: 'Try 14 days for free',
      exact: true,
    });
    this.subscriptionConfirmModalPrimaryButton = page.locator(
      'input.main_ui_settings_subscription__primary-button',
    );

    // Scoped by its "Create new organization" item so it isn't confused with
    // the "Team management" options menu, which is also `role="menu"`.
    this.orgDropdown = page.getByRole('menu').filter({
      has: page.getByRole('menuitem', { name: 'Create new organization' }),
    });
    this.orgDropdownItem = this.orgDropdown.getByRole('menuitem');
    this.createOrgDropdownItem = this.orgDropdownItem.filter({
      hasText: 'Create new organization',
    });
    this.goToAdminConsoleDropdownItem = this.orgDropdownItem.filter({
      hasText: 'Go to Admin Console',
    });
    this.otherTeamsDropdownItem = this.orgDropdownItem.filter({
      hasText: 'Other teams',
    });
    this.createTeamDropdownItem = this.orgDropdownItem.filter({
      hasText: 'Create new team',
    });
    this.currentTeamName = this.orgSwitcherButton.locator(
      'span[class*="current-team-name"]',
    );
    this.currentOrganizationName = this.orgSwitcherButton.locator(
      'span[class*="current-organization-name"]',
    );

    this.organizationOptionsButton = page.getByTestId('team-options-button');
    this.leaveOrgMenuItem = page.getByRole('menuitem', { name: 'Leave org' });
    this.promoteAndLeaveButton = page.getByRole('button', {
      name: 'Promote and leave',
    });

    this.orgNameInput = page.getByLabel('Organization name', { exact: true });
    this.createOrgModalForm = page
      .locator('form')
      .filter({ has: this.orgNameInput });
    this.createOrgSubmitButton = this.createOrgModalForm.getByRole('button', {
      name: 'Create organization',
    });
    this.maybeLaterButton = this.createOrgModalForm.getByRole('button', {
      name: 'Maybe later',
    });
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  private getOrgDropdownItemByName(orgName: string): Locator {
    return this.orgDropdownItem.filter({ hasText: orgName });
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  async clickCreateOrgFromSidebar() {
    await this.openOrgSwitcher();
    await this.clickCreateOrgFromDropdown();
  }

  async clickTryItFreeButton() {
    await this.tryItFreeButton.click();
  }

  async clickSubscriptionsPageEnterpriseTryButton() {
    await this.subscriptionsPageEnterpriseTryButton.click();
  }

  async clickSubscriptionConfirmModalPrimaryButton() {
    await this.subscriptionConfirmModalPrimaryButton.click();
  }

  /** Assumes `activationCodeLink` is already visible. */
  async clickActivationCodeLink() {
    await this.activationCodeLink.click();
  }

  async enterActivationCode(code: string) {
    await this.activationCodeInput.fill(code);
  }

  async clickActivateCode() {
    await this.activateCodeButton.click();
  }

  async closeWelcomeToEnterpriseModal() {
    await this.welcomeModalCloseButton.click();
  }

  /** Built from BASE_URL (not a relative goto) so it works from any context. */
  async goto() {
    await this.page.goto(`${process.env.BASE_URL}`);
  }

  /** Opens the org switcher unless already open (clicking again would close it). */
  async openOrgSwitcher() {
    if (!(await this.orgDropdownItem.first().isVisible())) {
      await this.orgSwitcherButton.click();
    }
    await expect(
      this.orgDropdownItem.first(),
      'Org switcher dropdown items are visible after opening it',
    ).toBeVisible();
  }

  /** Right-clicks an org in the open switcher, opening its context menu. */
  async openOrgContextMenu(orgName: string) {
    await this.getOrgDropdownItemByName(orgName).click({ button: 'right' });
  }

  async clickCreateOrgFromDropdown() {
    await this.createOrgDropdownItem.click();
  }

  async clickGoToAdminConsole() {
    await this.goToAdminConsoleDropdownItem.click();
  }

  async switchToOrg(orgName: string) {
    await this.openOrgSwitcher();
    await this.getOrgDropdownItemByName(orgName).click();
  }

  /** The org's three-dot options menu (not the switcher); needs that org's context. */
  async openOrganizationOptionsMenu() {
    await this.organizationOptionsButton.click();
    await expect(
      this.leaveOrgMenuItem,
      'Organization options menu is open',
    ).toBeVisible();
  }

  async clickLeaveOrg() {
    await this.leaveOrgMenuItem.click();
  }

  /** Needs a page that reflects recent team changes (reload first), or the backend
   * rejects it with "not-valid-teams". */
  async confirmPromoteAndLeave() {
    await this.promoteAndLeaveButton.click();
  }

  async fillOrgName(orgName: string) {
    await this.orgNameInput.fill(orgName);
  }

  async submitCreateOrgModal() {
    await this.createOrgSubmitButton.click();
  }

  /** Fills and submits the "Create organization" modal (already open). */
  async createOrganization(orgName: string) {
    await this.fillOrgName(orgName);
    await this.submitCreateOrgModal();
    await expect(
      this.createOrgModalForm,
      '"Create organization" naming modal is closed after submitting',
    ).not.toBeVisible();
  }

  /* -------------------------------------------------
   * Assertions
   * ------------------------------------------------- */

  /** No usable modal wrapper, so the CTA's visibility stands in for the modal. */
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

  /** Same as isEnterpriseModalVisible(): checked via the modal's primary button. */
  async isSubscriptionConfirmModalVisible(visible = true) {
    visible
      ? await expect(
          this.subscriptionConfirmModalPrimaryButton,
          'Subscription confirmation modal is visible',
        ).toBeVisible()
      : await expect(
          this.subscriptionConfirmModalPrimaryButton,
          'Subscription confirmation modal is not visible',
        ).not.toBeVisible();
  }

  async isOrgListedInDropdown(orgName: string, listed = true) {
    listed
      ? await expect(
          this.getOrgDropdownItemByName(orgName),
          `Organization "${orgName}" is listed in the dropdown`,
        ).toBeVisible()
      : await expect(
          this.getOrgDropdownItemByName(orgName),
          `Organization "${orgName}" is not listed in the dropdown`,
        ).toHaveCount(0);
  }

  async hasCurrentTeamAndOrganization(teamName: string, orgName: string) {
    await expect(
      this.currentTeamName,
      `Switcher line 1 is "${teamName}"`,
    ).toHaveText(teamName);
    await expect(
      this.currentOrganizationName,
      `Switcher line 2 is "${orgName}"`,
    ).toHaveText(orgName);
  }

  async isCreateTeamDropdownItemVisible() {
    await expect(
      this.createTeamDropdownItem,
      '"Create new team" dropdown item is visible',
    ).toBeVisible();
  }

  async isGoToAdminConsoleOutboundArrowVisible() {
    await expect(
      this.goToAdminConsoleDropdownItem.locator(
        'svg:has(use[href="#icon-arrow-up-right"])',
      ),
      '"Go to Admin Console" shows an outbound arrow',
    ).toBeVisible();
  }

  async isLeaveOrgMenuItemVisible() {
    await expect(
      this.leaveOrgMenuItem,
      '"Leave org" option is visible',
    ).toBeVisible();
  }

  async isCreateOrgDropdownItemVisible(visible = true) {
    visible
      ? await expect(
          this.createOrgDropdownItem,
          '"Create new organization" dropdown item is visible',
        ).toBeVisible()
      : await expect(
          this.createOrgDropdownItem,
          '"Create new organization" dropdown item is not visible',
        ).toHaveCount(0);
  }

  async isSidebarPromoVisible(visible = true) {
    visible
      ? await expect(
          this.sidebarPromoTryItFreeButton,
          'Sidebar "Unlock Enterprise features" promo widget is visible',
        ).toBeVisible()
      : await expect(
          this.sidebarPromoTryItFreeButton,
          'Sidebar "Unlock Enterprise features" promo widget is not visible',
        ).not.toBeVisible();
  }

  async isGoToAdminConsoleDropdownItemVisible(visible = true) {
    visible
      ? await expect(
          this.goToAdminConsoleDropdownItem,
          '"Go to Admin Console" dropdown item is shown for a team that belongs to an org',
        ).toBeVisible()
      : await expect(
          this.goToAdminConsoleDropdownItem,
          '"Go to Admin Console" dropdown item is not shown',
        ).not.toBeVisible();
  }

  async isActivationCodeLinkVisible(visible = true) {
    visible
      ? await expect(
          this.activationCodeLink,
          '"Subscribe with an activation code" link is visible',
        ).toBeVisible()
      : await expect(
          this.activationCodeLink,
          '"Subscribe with an activation code" link is not visible',
        ).not.toBeVisible();
  }

  async isSubscriptionsPageActivationCodeButtonVisible() {
    await expect(
      this.subscriptionsPageActivationCodeButton,
      '"Enter activation code" button is visible on the subscriptions settings page',
    ).toBeVisible();
  }

  async isWelcomeToEnterpriseModalShown() {
    await expect(
      this.page.getByText('Welcome to Enterprise!'),
      '"Welcome to Enterprise!" modal is shown',
    ).toBeVisible();
  }

  /** "Professional" is the default before any Enterprise entitlement. */
  async hasCurrentPlanSidebarText(text: string) {
    await expect(
      this.currentPlanSidebarText,
      `Sidebar current-plan label reads "${text}"`,
    ).toHaveText(text);
  }

  async hasSidebarPromoTryButtonText(text: string) {
    await expect(
      this.sidebarPromoTryItFreeButton,
      `Sidebar promo button reads "${text}"`,
    ).toHaveText(text);
  }

  async hasTryItFreeButtonText(text: string) {
    await expect(
      this.tryItFreeButton,
      `"Unlock Enterprise features" modal button reads "${text}"`,
    ).toHaveText(text);
  }

  async hasSubscriptionsPageEnterpriseTryButtonText(text: string) {
    await expect(
      this.subscriptionsPageEnterpriseTryButton,
      `Subscriptions page's Enterprise plan button reads "${text}"`,
    ).toHaveText(text);
  }

  /** The CTA is an <input type="button">, so its label is checked with toHaveValue(). */
  async hasSubscriptionConfirmModalTryButtonValue(text: string) {
    await expect(
      this.subscriptionConfirmModalPrimaryButton,
      `Subscription confirmation modal's button reads "${text}"`,
    ).toHaveValue(text);
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

  async isOnSubscriptionsSettingsPage() {
    await expect(
      this.page,
      'Redirected to the subscriptions settings page',
    ).toHaveURL(/\?screen=settings-subscription/);
  }

  /** Checks the post-checkout redirect landed on Penpot's confirmation URL. */
  async isSubscriptionConfirmedInUrl() {
    await expect(
      this.page,
      'Redirected back to Penpot with the subscription-confirmation URL marker',
    ).toHaveURL(/subscription=subscribed-to-penpot-nitrate/);
  }

  /** `page` must be logged in as the invitee, or the invite is never granted.
   * Waits for the 2nd email: the inbox already holds the registration one. */
  async acceptOrgInviteFromInbox(email: string, orgName: string) {
    await waitSecondMessage(this.page, email, 60);
    const invite = await getRegisterMessage(email);
    await this.page.goto(invite!.inviteUrl);
    await this.isSuccessMessageDisplayed(`You're now part of ${orgName}`);
  }

  async isNoLongerOrgMemberMessageShown(orgName: string) {
    // Live push over the websocket: can take longer than the default timeout.
    await expect(
      this.page.getByText(
        `You are no longer a member of the organization ${orgName}`,
      ),
      'No-longer-a-member notice is shown',
    ).toBeVisible({ timeout: 15000 });
  }

  /** Activating SSO pushes members straight to the identity provider's login page
   * (no reload). `issuerUrl` is the authority URL set in OrganizationSsoPage. */
  async isRedirectedToSsoLogin(issuerUrl: string) {
    const issuerOrigin = new URL(issuerUrl).origin;
    await expect(
      this.page,
      `Redirected to the identity provider's login page (${issuerOrigin})`,
    ).toHaveURL(
      new RegExp(`^${issuerOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`),
      {
        timeout: 30000,
      },
    );
  }

  /** A zero-org account shows no org name under the current team in the switcher. */
  async isZeroOrgAccountStateShown() {
    await expect(this.orgSwitcherButton, 'Org/team switcher is shown').toBeVisible();
    await expect(
      this.orgSwitcherButton.locator('[class*="current-organization-name"]'),
      'Back to a zero-org account — no organization name in the switcher',
    ).toHaveCount(0);
  }

  /** Shown when leaving would orphan a team you own; the other member is promoted. */
  async isLeaveOrgDialogShown() {
    await expect(
      this.page.getByRole('heading', {
        name: 'BEFORE YOU LEAVE THE ORGANIZATION',
      }),
      'Leave-org confirmation dialog is shown',
    ).toBeVisible();
    await expect(
      this.page.getByText(
        "You are the owner of some organization's teams. Please promote another member to become an owner.",
      ),
      'Leave-org dialog explains a team owner must be promoted first',
    ).toBeVisible();
  }

  /** For leaving voluntarily (isNoLongerOrgMemberMessageShown() is for being removed). */
  async isLeftOrganizationMessageShown(orgName: string) {
    await expect(
      this.page.getByText(`You're no longer part of the ${orgName} organization.`),
      'Left-organization notice is shown',
    ).toBeVisible();
  }
}
