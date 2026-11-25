import { BasePage } from '@pages/base-page';
import { ProfileMenuComponent } from '@pages/components/profile-menu-component';
import { GiveFeedbackSectionComponent } from '@pages/your-account/give-feedback-section-component';
import { IntegrationsSectionComponent } from '@pages/your-account/integrations-section-component';
import { PasswordSectionComponent } from '@pages/your-account/password-section-component';
import { ProfileSectionComponent } from '@pages/your-account/profile-section-component';
import { SettingsSectionComponent } from '@pages/your-account/settings-section-component';
import { ShortcutsSectionComponent } from '@pages/your-account/shortcuts-section-component';
import { SubscriptionSectionComponent } from '@pages/your-account/subscription-section-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Sections of Your account: sidebar label and `?screen=` route of each. */
export const YourAccountSection = {
  Profile: { label: 'Profile', screen: 'settings-profile' },
  Password: { label: 'Password', screen: 'settings-password' },
  Notifications: { label: 'Notifications', screen: 'settings-notifications' },
  Shortcuts: { label: 'Shortcuts', screen: 'settings-shortcuts' },
  Settings: { label: 'Settings', screen: 'settings-options' },
  Subscription: { label: 'Subscription', screen: 'settings-subscription' },
  Integrations: { label: 'Integrations', screen: 'settings-integrations' },
  GiveFeedback: { label: 'Contact us', screen: 'settings-feedback' },
} as const;

export type YourAccountSectionName = keyof typeof YourAccountSection;

/**
 * Your account (`?screen=settings-*`): the sidebar, the "Dashboard" back
 * button and one component per section. Each section is a <section> labelled
 * by its heading, so it's rooted on its region.
 */
export class YourAccountPage extends BasePage {
  readonly sidebar: Locator;
  readonly backToDashboardButton: Locator;

  readonly profileMenu: ProfileMenuComponent;
  readonly profile: ProfileSectionComponent;
  readonly password: PasswordSectionComponent;
  readonly shortcuts: ShortcutsSectionComponent;
  readonly settings: SettingsSectionComponent;
  readonly subscription: SubscriptionSectionComponent;
  readonly integrations: IntegrationsSectionComponent;
  readonly giveFeedback: GiveFeedbackSectionComponent;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.getByRole('navigation', { name: 'Settings' });
    this.backToDashboardButton = page.getByRole('button', { name: 'Dashboard' });

    const region = (name: string) => page.getByRole('region', { name, exact: true });
    this.profileMenu = new ProfileMenuComponent(page);
    this.profile = new ProfileSectionComponent(page, region('Profile'));
    this.password = new PasswordSectionComponent(page, region('Change password'));
    this.shortcuts = new ShortcutsSectionComponent(page, region('Shortcuts page'));
    this.settings = new SettingsSectionComponent(page, region('Settings'));
    this.subscription = new SubscriptionSectionComponent(
      page,
      region('Subscription'),
    );
    this.integrations = new IntegrationsSectionComponent(
      page,
      region('Integrations'),
    );
    this.giveFeedback = new GiveFeedbackSectionComponent(page, region('Contact us'));
  }

  /**
   * Opens a section of Your account by its URL, from anywhere in Penpot.
   * @param section Section to open; defaults to 'Profile'.
   */
  async goto(section: YourAccountSectionName = 'Profile') {
    await this.page.goto(`/?screen=${YourAccountSection[section].screen}`);
    await this.checkIsVisible();
  }

  /** Opens Your account from the profile menu (it lands on Profile). */
  async open() {
    await this.profileMenu.openYourAccount();
    await this.checkIsVisible();
  }

  /**
   * Opens a section from the sidebar (Your account already open).
   * @param section Section to open, e.g. 'Password'.
   */
  async openSection(section: YourAccountSectionName) {
    await this.sidebar
      .getByRole('listitem')
      .filter({ hasText: YourAccountSection[section].label })
      .click();
    await expect(
      this.page,
      `Your account > ${YourAccountSection[section].label} is open`,
    ).toHaveURL(new RegExp(`screen=${YourAccountSection[section].screen}`));
  }

  /** Goes back to the dashboard with the "Dashboard" button. */
  async backToDashboard() {
    await this.backToDashboardButton.click();
    await this.isHeaderDisplayed('Personal Projects');
  }

  /** Checks Your account is shown, by its "Your account" title. */
  async checkIsVisible() {
    await this.isHeaderDisplayed('Your account');
  }
}
