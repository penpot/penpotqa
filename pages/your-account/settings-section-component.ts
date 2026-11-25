import { BaseComponent } from '@pages/base-component';
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
export class SettingsSectionComponent extends BaseComponent {
  readonly uiThemePicker: Locator;
  readonly updateSettingsButton: Locator;
  /** "Status" switch of the "WebGL rendering" section; saves as soon as it's clicked. */
  readonly webglRenderingSwitch: Locator;
  /** Toast shown after saving; it renders in a portal. */
  readonly toast: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    // The pickers have no accessible name: take the one after its heading
    this.uiThemePicker = root
      .getByRole('heading', { name: 'UI theme' })
      .locator('xpath=following-sibling::div[1]')
      .getByRole('combobox');
    this.updateSettingsButton = root.getByRole('button', {
      name: 'Update settings',
    });
    this.webglRenderingSwitch = root.getByRole('switch');
    this.toast = page.locator('div[class*="shared_notification_pill__type-toast"]');
  }

  /**
   * Checks the toast shown after saving.
   * @param message Expected toast text.
   */
  private async checkToast(message: string) {
    await expect(this.toast, `Toast is "${message}"`).toHaveText(message);
  }

  /**
   * Picks a UI theme and saves it with "Update settings".
   * @param theme Theme to pick, e.g. UiTheme.Light.
   */
  async selectUiTheme(theme: UiThemeName) {
    await this.uiThemePicker.click();
    await this.root.getByRole('option', { name: theme, exact: true }).click();
    await this.updateSettingsButton.click();
    await this.checkToast('Profile saved successfully!');
  }

  /**
   * Clicks the WebGL rendering switch and checks the toast that confirms the
   * change.
   * @param enabled `true` to enable WebGL rendering, `false` to disable it.
   */
  async toggleWebglRendering(enabled: boolean) {
    await this.checkWebglRenderingStatus(enabled ? 'Disabled' : 'Enabled');
    await this.webglRenderingSwitch.click();
    await this.checkToast(`WebGL rendering ${enabled ? 'enabled' : 'disabled'}`);
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
