import { BasePage } from '@pages/base-page';
import { type Locator, type Page, expect } from '@playwright/test';

/** Status of the WebGL rendering switch, which is also its accessible name. */
export type WebglRenderingStatus = 'Enabled' | 'Disabled';

/** Options of the "UI theme" picker. */
export const UiTheme = {
  Dark: 'Penpot Dark (default)',
  Light: 'Penpot Light',
  System: 'System theme',
} as const;

export type UiThemeName = (typeof UiTheme)[keyof typeof UiTheme];

/**
 * Your account > Settings (`?screen=settings-options`): language, UI theme and
 * the "WebGL rendering" section.
 */
export class SettingsPage extends BasePage {
  readonly settingsSidebarOption: Locator;
  readonly settingsRegion: Locator;
  readonly uiThemePicker: Locator;
  readonly updateSettingsButton: Locator;
  /** "Status" switch of the "WebGL rendering" section; saves as soon as it's clicked. */
  readonly webglRenderingSwitch: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsSidebarOption = page
      .getByRole('navigation', { name: 'Settings' })
      .getByRole('listitem')
      .filter({ hasText: 'Settings' });
    this.settingsRegion = page.getByRole('region', { name: 'Settings' });
    // The pickers have no accessible name: take the one after its heading
    this.uiThemePicker = this.settingsRegion
      .getByRole('heading', { name: 'UI theme' })
      .locator('xpath=following-sibling::div[1]')
      .getByRole('combobox');
    this.updateSettingsButton = this.settingsRegion.getByRole('button', {
      name: 'Update settings',
    });
    this.webglRenderingSwitch = this.settingsRegion.getByRole('switch');
  }

  /** Opens Settings from Your account's sidebar. */
  async open() {
    await this.settingsSidebarOption.click();
    await expect(this.settingsRegion, 'Settings page is shown').toBeVisible();
  }

  /** Opens Your account > Settings by its URL, from anywhere in Penpot. */
  async goto() {
    await this.page.goto('/?screen=settings-options');
    await expect(this.settingsRegion, 'Settings page is shown').toBeVisible();
  }

  /**
   * Picks a UI theme and saves it with "Update settings".
   * @param theme Theme to pick, e.g. UiTheme.Light.
   */
  async selectUiTheme(theme: UiThemeName) {
    await this.uiThemePicker.click();
    await this.settingsRegion
      .getByRole('option', { name: theme, exact: true })
      .click();
    await this.updateSettingsButton.click();
    await this.isSuccessMessageDisplayed('Profile saved successfully!');
  }

  /**
   * Clicks the WebGL rendering switch and checks the toast that confirms the
   * change.
   * @param enabled `true` to enable WebGL rendering, `false` to disable it.
   */
  async toggleWebglRendering(enabled: boolean) {
    await this.checkWebglRenderingStatus(enabled ? 'Disabled' : 'Enabled');
    await this.webglRenderingSwitch.click();
    await this.isSuccessMessageDisplayed(
      `WebGL rendering ${enabled ? 'enabled' : 'disabled'}`,
    );
    await this.checkWebglRenderingStatus(enabled ? 'Enabled' : 'Disabled');
  }

  /**
   * Checks the status shown by the WebGL rendering switch.
   * @param status 'Enabled' (switch on) or 'Disabled' (switch off).
   */
  async checkWebglRenderingStatus(status: WebglRenderingStatus) {
    await expect(
      this.webglRenderingSwitch,
      `WebGL rendering is ${status.toLowerCase()} in Settings`,
    ).toHaveAccessibleName(status);
    await expect(
      this.webglRenderingSwitch,
      `WebGL rendering switch is ${status === 'Enabled' ? 'on' : 'off'}`,
    ).toHaveAttribute('aria-checked', String(status === 'Enabled'));
  }
}
