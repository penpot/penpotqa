import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Your account > Integrations > MCP Server: the status switch and the MCP key.
 * The key modals, its options dropdown and the toasts render in a portal.
 */
export class McpServerComponent extends BaseComponent {
  /**
   * Overlay on the switch while there's no key: clicking it opens "Generate MCP
   * key". It has no role or label, so it's matched by its class.
   */
  readonly switchWithoutKey: Locator;
  /** "Status" switch, off (`aria-checked="false"`). */
  readonly switchOff: Locator;
  /** "Status" switch, on (`aria-checked="true"`). */
  readonly switchOn: Locator;
  readonly mcpKey: Locator;
  readonly keyOptionsButton: Locator;

  readonly generateKeyModalHeading: Locator;
  readonly generateKeySubmitButton: Locator;
  readonly keyGeneratedModalHeading: Locator;
  readonly keyCreatedMessage: Locator;
  readonly closeModalButton: Locator;
  readonly deleteKeyOption: Locator;
  readonly deleteKeyModalHeading: Locator;
  readonly deleteKeyButton: Locator;
  readonly serverDisabledMessage: Locator;
  readonly serverEnabledMessage: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.switchWithoutKey = root.locator(
      '.main_ui_settings_integrations__mcp-server-switch-cover',
    );
    this.switchOff = root.getByRole('switch', { checked: false });
    this.switchOn = root.getByRole('switch', { checked: true });
    this.mcpKey = root.getByTitle('MCP key');
    this.keyOptionsButton = root.getByRole('button', { name: 'Options' });

    this.generateKeyModalHeading = page.getByRole('heading', {
      name: 'Generate MCP key',
    });
    this.generateKeySubmitButton = page.getByRole('button', {
      name: 'Generate MCP key',
    });
    this.keyGeneratedModalHeading = page.getByRole('heading', {
      name: 'MCP key generated',
    });
    this.keyCreatedMessage = page.getByText('Token created successfully', {
      exact: true,
    });
    // The toast's and the modal's ✕ icons are also named "Close": match the
    // modal's text button instead
    this.closeModalButton = page.getByRole('button').filter({ hasText: 'Close' });
    this.deleteKeyOption = page.getByTestId('token-delete');
    this.deleteKeyModalHeading = page.getByRole('heading', { name: 'Delete token' });
    this.deleteKeyButton = page.getByRole('button', { name: 'Delete token' });
    this.serverDisabledMessage = page.getByText('MCP server disabled', {
      exact: true,
    });
    this.serverEnabledMessage = page.getByText('MCP server enabled', {
      exact: true,
    });
  }

  /** Clicks the switch while there's no key, which opens "Generate MCP key". */
  async enableWithoutKey() {
    await expect(
      this.switchWithoutKey,
      'MCP switch (no key) is visible',
    ).toBeVisible();
    await this.switchWithoutKey.click();
  }

  /** Generates the key from its modal, closes it and checks MCP ends up enabled. */
  async generateKey() {
    await expect(
      this.generateKeyModalHeading,
      'Generate MCP key modal is open',
    ).toBeVisible();
    await this.generateKeySubmitButton.click();
    await expect(
      this.keyGeneratedModalHeading,
      'MCP key generated modal is open',
    ).toBeVisible();
    await expect(this.keyCreatedMessage, 'Key created toast is shown').toBeVisible();
    await this.closeModalButton.click();
    await expect(this.mcpKey, 'MCP key is listed').toBeVisible();
    await expect(this.switchOn, 'MCP switch is on').toBeVisible();
  }

  /**
   * Waits for the profile-props POST that sets `mcp-enabled` to the given value.
   * @param enabled Value the request must set.
   * @returns The matching response.
   */
  private waitForMcpPropsUpdate(enabled: boolean) {
    const pattern = new RegExp(`~?:?mcp-enabled["']?\\s*:\\s*${enabled}`);
    return this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/main/methods/update-profile-props') &&
        response.request().method() === 'POST' &&
        pattern.test(response.request().postData() ?? ''),
    );
  }

  /** Turns the server off (with a key) and waits for the toast and the switch. */
  async disable() {
    await expect(this.switchOn, 'MCP switch is on').toBeVisible();
    await Promise.all([this.waitForMcpPropsUpdate(false), this.switchOn.click()]);
    await expect(
      this.serverDisabledMessage,
      'MCP disabled toast is shown',
    ).toBeVisible();
    await expect(this.switchOff, 'MCP switch is off').toBeVisible();
  }

  /** Turns the server on with the existing key and waits for the toast and the switch. */
  async enableWithKey() {
    await expect(this.switchOff, 'MCP switch is off').toBeVisible();
    await Promise.all([this.waitForMcpPropsUpdate(true), this.switchOff.click()]);
    await expect(
      this.serverEnabledMessage,
      'MCP enabled toast is shown',
    ).toBeVisible();
    await expect(this.switchOn, 'MCP switch is on').toBeVisible();
  }

  /** Deletes the MCP key from its options and confirms it in the modal. */
  async deleteKey() {
    await this.keyOptionsButton.click();
    await this.deleteKeyOption.click();
    await expect(
      this.deleteKeyModalHeading,
      'Delete key modal is open',
    ).toBeVisible();
    await this.deleteKeyButton.click();
  }

  /** Checks there's no MCP key and the switch is back to its no-key state. */
  async checkNoKey() {
    await expect(this.mcpKey, 'No MCP key is listed').toBeHidden();
    await expect(
      this.switchWithoutKey,
      'MCP switch (no key) is visible',
    ).toBeVisible();
  }
}
