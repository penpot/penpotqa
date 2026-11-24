import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * External links of the profile menu, each with the submenu that holds it.
 * `exclude` drops items whose text also contains `item` (e.g. "Community" is
 * also part of "Community & Contributions").
 */
export const ProfileMenuLink = {
  HelpCenter: { submenu: 'Help & Learning', item: 'Help Center' },
  LearningCenter: { submenu: 'Help & Learning', item: 'Learning Center' },
  PenpotHub: { submenu: 'Help & Learning', item: 'Penpot hub' },
  GithubRepository: {
    submenu: 'Community & Contributions',
    item: 'Github repository',
  },
  Community: {
    submenu: 'Community & Contributions',
    item: 'Community',
    exclude: 'Contributions',
  },
  PenpotChangelog: { submenu: 'About Penpot', item: 'Penpot Changelog' },
  TermsOfService: { submenu: 'About Penpot', item: 'Terms of service' },
} as const;

export type ProfileMenuLinkName = keyof typeof ProfileMenuLink;

/**
 * Profile menu: the account button at the bottom of the dashboard sidebar
 * (also shown in Your account) and the dropdown it opens.
 */
export class ProfileMenuComponent extends BaseComponent {
  readonly menuButton: Locator;
  readonly yourAccountMenuItem: Locator;
  readonly logoutMenuItem: Locator;
  readonly helpAndLearningMenuItem: Locator;
  readonly giveFeedbackMenuItem: Locator;

  constructor(page: Page) {
    super(page);
    this.menuButton = page.getByTestId('profile-btn');
    // The dropdown renders in a portal, outside the button's container
    this.yourAccountMenuItem = page.getByTestId('profile-profile-opt');
    this.logoutMenuItem = page.getByTestId('logout-profile-opt');
    this.helpAndLearningMenuItem = this.getMenuItem('Help & Learning');
    this.giveFeedbackMenuItem = this.getMenuItem('Give feedback');
  }

  /**
   * Menu item by its text.
   * @param text Text the item contains.
   * @param exclude Text the item must not contain, to tell apart items whose
   * text includes `text`.
   */
  private getMenuItem(text: string, exclude?: string): Locator {
    return this.page
      .getByRole('menuitem')
      .filter(exclude ? { hasText: text, hasNotText: exclude } : { hasText: text });
  }

  /** Opens the profile menu. */
  async open() {
    await this.menuButton.click();
  }

  /** Opens Your account (Profile section) from the profile menu. */
  async openYourAccount() {
    await this.open();
    await this.yourAccountMenuItem.click();
  }

  /** Opens Help & Learning > Give feedback from the profile menu. */
  async openGiveFeedback() {
    await this.open();
    await this.helpAndLearningMenuItem.hover();
    await this.giveFeedbackMenuItem.click();
  }

  /**
   * Logs out from the profile menu and waits for the logout request, since
   * navigating away before it completes aborts it and leaves the session active.
   */
  async logout() {
    await this.open();
    const logoutResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/main/methods/logout') &&
        response.request().method() === 'POST',
    );
    await this.logoutMenuItem.click();
    await logoutResponse;
  }

  /**
   * Opens an external link of the profile menu, which opens in a new tab.
   * @param link Link to open, e.g. 'HelpCenter'.
   * @returns The new tab.
   */
  async openLink(link: ProfileMenuLinkName): Promise<Page> {
    const { submenu, item, ...rest } = ProfileMenuLink[link];
    const exclude = 'exclude' in rest ? rest.exclude : undefined;
    await this.open();
    await this.getMenuItem(submenu).hover();
    const popupPromise = this.page.waitForEvent('popup');
    await this.getMenuItem(item, exclude).click();
    return popupPromise;
  }

  /**
   * Opens an external link of the profile menu and checks the URL of the tab
   * it opens, then closes that tab.
   * @param link Link to open, e.g. 'HelpCenter'.
   * @param url URL the new tab must show.
   */
  async checkLinkOpensUrl(link: ProfileMenuLinkName, url: string) {
    const popup = await this.openLink(link);
    await expect(popup, `"${link}" opens ${url}`).toHaveURL(url);
    await popup.close();
  }

  /**
   * Checks the name shown on the profile menu button.
   * @param name Expected account name.
   */
  async checkAccountName(name: string) {
    await expect(this.menuButton, `Account name is "${name}"`).toHaveText(name);
  }

  /**
   * Reads the account name shown on the profile menu button.
   * @returns The account name, or an empty string if there is none.
   */
  async getAccountName(): Promise<string> {
    return (await this.menuButton.textContent()) ?? '';
  }
}
