import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';
import { waitSecondMessage, getRegisterMessage } from 'helpers/gmail';

/**
 * Covers the Enterprise-only "Organization" concept: the dashboard sidebar's
 * org switcher/creation entry points, the "Unlock Enterprise features"
 * modal, and the (Tailwind/design-system, not the older BEM-styled modal)
 * "Create organization" naming dialog reached either from the Admin Console
 * welcome screen (first org, right after a Stripe checkout) or from the org
 * switcher dropdown's "Create org" item (subsequent orgs, no checkout).
 *
 * Once the browser has actually navigated into an organization's Admin
 * Console, that's AdminConsolePage's territory instead
 * (pages/admin-console/admin-console-page.ts) — this page stops at the
 * entry points into it.
 */
export class OrganizationPage extends BasePage {
  // Sidebar entry points
  readonly createOrgSidebarButton: Locator;
  readonly orgSwitcherButton: Locator;
  readonly sidebarPromoWidget: Locator;
  // Two state-dependent buttons inside sidebarPromoWidget: unlicensed it
  // reads "Try it free for 14 days" (opens the "Unlock Enterprise features"
  // modal); already-licensed but orgless (e.g. via
  // `enterpriseActivatedPageTest`), it reads "Create organization" and
  // jumps straight to the naming modal. Scoping both to sidebarPromoWidget
  // lets getByRole tell them apart from the modal's own identically-named
  // CTA.
  readonly sidebarPromoTryItFreeButton: Locator;
  readonly sidebarPromoCreateOrgButton: Locator;

  // "Unlock Enterprise features" modal (older BEM-styled component). No
  // reliable locator for the modal's own generic wrapper exists — see the
  // constructor comment — so these are scoped directly by their own classes,
  // each unique to this modal, and "the modal is open" is asserted via
  // `tryItFreeButton`'s visibility rather than a wrapper element.
  readonly tryItFreeButton: Locator;
  readonly activationCodeLink: Locator;
  readonly currentPlanLink: Locator;

  // Settings > Subscription page (reached via currentPlanLink above) — the
  // Enterprise plan card's own CTA, a real `<button>` this time. Its own
  // confirmation modal (a third, separate component from the two "Unlock
  // Enterprise features" modals above) has no reliable wrapper locator
  // either, so it's scoped the same way: by its own unique primary-button
  // class, an `<input type="button">` rather than a `<button>`.
  readonly subscriptionsPageEnterpriseTryButton: Locator;
  readonly subscriptionConfirmModalPrimaryButton: Locator;

  // Org switcher dropdown (sidebar)
  readonly orgDropdown: Locator;
  readonly orgDropdownItem: Locator;
  readonly createOrgDropdownItem: Locator;
  readonly goToAdminConsoleDropdownItem: Locator;
  readonly otherTeamsDropdownItem: Locator;

  // "Create organization" naming modal (newer design-system component, no
  // BEM class/testid — scoped by the <form> containing the name input so it
  // resolves correctly regardless of which entry point opened it, since the
  // page behind it can have its own identically-labelled "Create organization"
  // button still in the DOM)
  readonly createOrgModalForm: Locator;
  readonly orgNameInput: Locator;
  readonly createOrgSubmitButton: Locator;
  readonly maybeLaterButton: Locator;

  constructor(page: Page) {
    super(page);

    this.createOrgSidebarButton = page.locator(
      '.main_ui_dashboard_sidebar__create-organization',
    );
    this.orgSwitcherButton = page.locator(
      '.main_ui_dashboard_sidebar__current-organization',
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

    // `.main_ui_modal__modal-wrapper` is a generic portal container reused
    // app-wide by many unrelated modal types (it matches 8-12
    // elements at once, almost all hidden), so it's not usable to scope or
    // identify "the Enterprise modal" itself.
    //
    // tryItFreeButton is deliberately CSS-class-based, not getByRole — the
    // dashboard's own "Unlock Enterprise features" sidebar promo widget has
    // its own separate, real `<button>Try it free for 14 days</button>`
    // with the exact same accessible name, and an unscoped
    // getByRole('button', { name: 'Try it free for 14 days' }) resolves to
    // THAT one, not the modal's CTA — the visibility check
    // passed (the widget button is visible too) but the actual click failed,
    // obscured by the modal overlay. The modal's own CTA class below is the
    // only reliable way to target it specifically (sidebarPromoTryItFreeButton
    // above avoids the same collision by scoping getByRole to
    // sidebarPromoWidget instead).
    this.tryItFreeButton = page.locator(
      '.main_ui_nitrate_nitrate_form__modal-button',
    );
    // `<a class="link">Subscribe with an activation code</a>` has no `href`
    // in the real markup, so it gets no implicit ARIA link
    // role and getByRole('link', ...) never matches it — getByText is the
    // best available option, not a downgrade of choice.
    this.activationCodeLink = page.getByText('Subscribe with an activation code');
    this.currentPlanLink = page.getByRole('link', {
      name: 'See my current plan',
    });
    this.subscriptionsPageEnterpriseTryButton = page.getByRole('button', {
      name: 'Try 14 days for free',
      exact: true,
    });
    this.subscriptionConfirmModalPrimaryButton = page.locator(
      'input.main_ui_settings_subscription__primary-button',
    );

    this.orgDropdown = page.getByRole('menu');
    this.orgDropdownItem = this.orgDropdown.getByRole('menuitem');
    this.createOrgDropdownItem = this.orgDropdownItem.filter({
      hasText: 'Create org',
    });
    this.goToAdminConsoleDropdownItem = this.orgDropdownItem.filter({
      hasText: 'Go to Admin Console',
    });
    this.otherTeamsDropdownItem = this.orgDropdownItem.filter({
      hasText: 'Other teams',
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
    await this.createOrgSidebarButton.click();
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

  /** Opens the org switcher, unless it's already open — clicking the trigger
   * again would just toggle it closed instead. */
  async openOrgSwitcher() {
    if (!(await this.orgDropdownItem.first().isVisible())) {
      await this.orgSwitcherButton.click();
    }
    await expect(
      this.orgDropdownItem.first(),
      'Org switcher dropdown items are visible after opening it',
    ).toBeVisible();
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

  async fillOrgName(orgName: string) {
    await this.orgNameInput.fill(orgName);
  }

  async submitCreateOrgModal() {
    await this.createOrgSubmitButton.click();
  }

  /**
   * Fills and submits the "Create organization" naming modal. Assumes the
   * modal is already open (via the Admin Console welcome CTA or the org
   * switcher dropdown's "Create org" item).
   */
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

  /** No reliable locator exists for the modal's own wrapper (see the
   * constructor comment), so this checks its CTA button instead — visible
   * only while the modal is genuinely open. */
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

  /** No reliable wrapper locator exists for this modal either — same
   * situation as isEnterpriseModalVisible() above, checked via its own
   * primary button instead. */
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

  async isCreateOrgDropdownItemVisible(visible = true) {
    visible
      ? await expect(
          this.createOrgDropdownItem,
          '"Create org" dropdown item is visible',
        ).toBeVisible()
      : await expect(
          this.createOrgDropdownItem,
          '"Create org" dropdown item is not visible',
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

  /** The confirmation modal's own CTA is an `<input type="button">`, not a
   * `<button>` — its label lives in the `value` attribute, not text
   * content, hence toHaveValue() rather than toHaveText(). */
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

  /** Asserts the browser is on the org subscriptions settings page, reached
   * via the "See my current plan" link. */
  async isOnSubscriptionsSettingsPage() {
    await expect(
      this.page,
      'Redirected to the subscriptions settings page',
    ).toHaveURL(/\/settings\/subscriptions/);
  }

  /** Asserts the post-checkout redirect landed back on Penpot with the
   * dashboard entry point's own subscription-confirmation URL marker. */
  async isSubscriptionConfirmedInUrl() {
    await expect(
      this.page,
      'Redirected back to Penpot with the subscription-confirmation URL marker',
    ).toHaveURL(/subscription=subscribed-to-penpot-nitrate/);
  }

  /**
   * Accepts a pending org invitation from the invitee's own inbox. `page`
   * must already be logged in as the invitee (see `registerNewAccount()`)
   * — accepting while unauthenticated goes through a different code path
   * that never actually grants membership (invite stays Pending forever).
   *
   * Uses `waitSecondMessage()` (waits for the message COUNT to grow), not
   * `waitMessage()` (returns whatever's already there) — this account's
   * inbox already has its own registration email in it by the time the org
   * invite arrives, so "wait for any message" can return the stale one.
   */
  async acceptOrgInviteFromInbox(email: string, orgName: string) {
    await waitSecondMessage(this.page, email, 60);
    const invite = await getRegisterMessage(email);
    await this.page.goto(invite!.inviteUrl);
    await this.isSuccessMessageDisplayed(`You're now part of ${orgName}`);
  }

  /** Removing a member pushes this notice to their
   * dashboard immediately over the live connection — no reload needed,
   * unlike the owner-side People/Pending lists (see acceptOrgInviteFromInbox's
   * sibling discoveries). */
  async isNoLongerOrgMemberMessageShown(orgName: string) {
    // A live push over the websocket connection — it can
    // take longer than the default timeout to arrive.
    await expect(
      this.page.getByText(
        `You are no longer a member of the organization ${orgName}`,
      ),
      'No-longer-a-member notice is shown',
    ).toBeVisible({ timeout: 15000 });
  }

  /** A zero-org account has no org switcher trigger at all
   * (nothing to switch between) — the "+ Create org" sidebar button is the
   * reliable signal instead of trying to open a switcher that doesn't exist. */
  async isZeroOrgAccountStateShown() {
    await expect(
      this.createOrgSidebarButton,
      'Back to a zero-org account — "+ Create org" sidebar entry point shown',
    ).toBeVisible();
  }
}
