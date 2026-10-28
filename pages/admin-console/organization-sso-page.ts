import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Named Identity Provider option labels for OrganizationSsoPage's
 * selectProvider() — confirmed live: all 3 are `role="radio"` inputs whose
 * own input is visually covered by a styled sibling, same pattern as
 * AdvancedPermissionsPage's permission radios, so the label text (not the
 * radio itself) is the real click target.
 */
export const SsoProvider = {
  Generic: 'Generic (OpenID Connect)',
  AzureAd: 'Azure Active Directory (OpenID Connect)',
  Google: 'Google (OAuth)',
} as const;

export type SsoProviderValue = (typeof SsoProvider)[keyof typeof SsoProvider];

export interface SsoConfig {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Covers the Admin Console's SSO Config tab
 * (/admin-console/organization/{slug}/{id}/sso) — confirmed live against a
 * real Auth0 test tenant (see PENPOT-3527's Qase data): provider selection,
 * the Generic (OpenID Connect) config form, activate/deactivate + their
 * confirmation dialogs, and the resulting toast.
 *
 * The activate/deactivate success toast is NOT the shared
 * `shared_notification_pill__type-toast` component `BasePage.successMessage`
 * matches — this screen uses a newer, differently-styled toast (confirmed
 * live: a `bg-ds-background-status-success` banner with its own "Close
 * notification" button) that also auto-dismisses within a few seconds.
 * Assert it right after activateSso()/deactivateSso() returns, not after any
 * further steps, or it may already be gone.
 */
export class OrganizationSsoPage extends BasePage {
  // Sidebar nav item — its own text carries the current state, e.g.
  // "SSO Config\n(Inactive)" / "SSO Config\n(Active)".
  readonly ssoConfigNavLink: Locator;

  // Config form (shown once a provider is selected)
  readonly issuerUrlInput: Locator;
  readonly clientIdInput: Locator;
  readonly clientSecretInput: Locator;

  // Activate/Deactivate triggers — each also has a same-named confirm
  // button inside confirmDialog, disambiguated by scoping to it. Both use
  // `exact: true` — "Deactivate SSO" contains "Activate SSO" as a plain
  // substring, so a non-exact match on one also matches the other whenever
  // both linger in the DOM together (confirmed live).
  readonly activateSsoButton: Locator;
  readonly deactivateSsoButton: Locator;
  readonly confirmDialog: Locator;

  constructor(page: Page) {
    super(page);

    this.ssoConfigNavLink = page.getByRole('link', { name: 'SSO Config' });

    this.issuerUrlInput = page.getByRole('textbox', {
      name: 'Issuer / authority URL',
    });
    this.clientIdInput = page.getByRole('textbox', { name: 'Client ID' });
    this.clientSecretInput = page.getByRole('textbox', {
      name: 'Client Secret',
    });

    this.activateSsoButton = page.getByRole('button', {
      name: 'Activate SSO',
      exact: true,
    });
    this.deactivateSsoButton = page.getByRole('button', {
      name: 'Deactivate SSO',
      exact: true,
    });
    this.confirmDialog = page.getByRole('dialog');
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  /** The provider's own label text — the real click target (see the
   * exported SsoProvider doc comment for why). */
  private getProviderLabel(provider: SsoProviderValue): Locator {
    return this.page.getByText(provider, { exact: true });
  }

  private getProviderRadio(provider: SsoProviderValue): Locator {
    return this.page.getByRole('radio', { name: provider, exact: true });
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  /** Self-healing — same hydration race as AdminConsolePage's
   * openSettings()/openOrgSwitcher(): clicking a nav item right after a
   * fresh navigation into the Admin Console can silently no-op before its
   * click handler has attached. */
  async openSsoConfigTab() {
    await expect(async () => {
      if (!/\/sso$/.test(this.page.url())) {
        await this.ssoConfigNavLink.click();
      }
      await expect(this.page, 'On the SSO Config tab').toHaveURL(/\/sso$/, {
        timeout: 3000,
      });
    }).toPass({ timeout: 15000 });
  }

  async selectProvider(provider: SsoProviderValue) {
    await expect(async () => {
      if (!(await this.getProviderRadio(provider).isChecked())) {
        await this.getProviderLabel(provider).click();
      }
      await expect(
        this.getProviderRadio(provider),
        `"${provider}" provider is selected`,
      ).toBeChecked({ timeout: 3000 });
    }).toPass({ timeout: 15000 });
  }

  /** Fills the Generic (OpenID Connect) config form fields. Assumes
   * selectProvider(SsoProvider.Generic) already ran.
   *
   * Confirmed live: the config form's own fields can occasionally lag well
   * behind the provider radio's checked state (a separate render than the
   * one selectProvider() already waits for) — self-healing, re-clicking the
   * provider label if the fields still aren't there, is more reliable than
   * a single longer wait. */
  async fillSsoConfig(config: SsoConfig) {
    await expect(async () => {
      if (!(await this.issuerUrlInput.isVisible())) {
        await this.getProviderLabel(SsoProvider.Generic).click();
      }
      await expect(this.issuerUrlInput, 'SSO config form is shown').toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 20000 });

    await this.issuerUrlInput.fill(config.issuerUrl);
    await this.clientIdInput.fill(config.clientId);
    await this.clientSecretInput.fill(config.clientSecret);
  }

  /** Clicks "Activate SSO" and confirms the resulting dialog — leaves the
   * activated-state toast for the caller to assert immediately after (see
   * the class doc comment on why "immediately" matters here). Self-healing,
   * same hydration-race rationale as openSsoConfigTab(). */
  async activateSso() {
    await expect(async () => {
      if (!(await this.confirmDialog.isVisible())) {
        await this.activateSsoButton.click();
      }
      await expect(
        this.confirmDialog,
        'Activate-SSO confirmation dialog is shown',
      ).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });
    await this.confirmDialog
      .getByRole('button', { name: 'Activate SSO', exact: true })
      .click();
  }

  /** Clicks "Deactivate SSO" and confirms the resulting dialog — same
   * self-healing rationale as activateSso(). */
  async deactivateSso() {
    await expect(async () => {
      if (!(await this.confirmDialog.isVisible())) {
        await this.deactivateSsoButton.click();
      }
      await expect(
        this.confirmDialog,
        'Deactivate-SSO confirmation dialog is shown',
      ).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });
    await this.confirmDialog
      .getByRole('button', { name: 'Deactivate SSO', exact: true })
      .click();
  }

  /* -------------------------------------------------
   * Assertions
   * ------------------------------------------------- */

  async isActivateSsoConfirmDialogVisible(orgName: string) {
    await expect(
      this.confirmDialog.getByText(`Turn on SSO for ${orgName}?`),
      `Activate-SSO confirmation dialog names "${orgName}"`,
    ).toBeVisible();
  }

  async isDeactivateSsoConfirmDialogVisible(orgName: string) {
    await expect(
      this.confirmDialog.getByText(`Deactivate SSO for ${orgName}?`),
      `Deactivate-SSO confirmation dialog names "${orgName}"`,
    ).toBeVisible();
  }

  /** Checks the (auto-dismissing) toast — call right after activateSso(). */
  async isSsoActivatedNotificationVisible(orgName: string) {
    await expect(
      this.page.getByText(`SSO is enabled for ${orgName} organization.`),
      `"SSO is enabled for ${orgName} organization." notification is shown`,
    ).toBeVisible();
  }

  /** Checks the (auto-dismissing) toast — call right after deactivateSso(). */
  async isSsoDeactivatedNotificationVisible(orgName: string) {
    await expect(
      this.page.getByText(`SSO is disabled for ${orgName} organization.`),
      `"SSO is disabled for ${orgName} organization." notification is shown`,
    ).toBeVisible();
  }

  async isDeactivateSsoButtonVisible(visible = true) {
    visible
      ? await expect(
          this.deactivateSsoButton,
          '"Deactivate SSO" button is shown',
        ).toBeVisible()
      : await expect(
          this.deactivateSsoButton,
          '"Deactivate SSO" button is not shown',
        ).not.toBeVisible();
  }

  async isActivateSsoButtonVisible(visible = true) {
    visible
      ? await expect(
          this.activateSsoButton,
          '"Activate SSO" button is shown',
        ).toBeVisible()
      : await expect(
          this.activateSsoButton,
          '"Activate SSO" button is not shown',
        ).not.toBeVisible();
  }

  /** Checks the sidebar nav item's own "(Active)"/"(Inactive)" state text —
   * confirmed live this is a stable, always-present indicator regardless of
   * which tab is currently open. */
  async isSsoConfigActive(active = true) {
    await expect(
      this.ssoConfigNavLink,
      `SSO Config nav item shows "${active ? 'Active' : 'Inactive'}"`,
    ).toContainText(active ? 'Active' : 'Inactive');
  }
}
