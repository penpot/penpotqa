import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * The "MCP" button and its menu (Connect, or the session info with Copy session
 * ID and Disconnect). The same component is shown in the dashboard header
 * (Projects and Drafts pages) and in the workspace toolbar. Its root is that
 * header or toolbar: the button and menu have no container with a role or
 * label, and they are unique there (the menu only exists while open).
 */
export class McpMenuComponent extends BaseComponent {
  readonly mcpButton: Locator;
  /** Green dot of the MCP button, only shown while connected; it has no role or label. */
  readonly connectedMcpButton: Locator;
  readonly menu: Locator;
  readonly connectMenuItem: Locator;
  readonly copySessionIdMenuItem: Locator;
  readonly disconnectMenuItem: Locator;
  readonly connectedText: Locator;
  readonly sessionIdText: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.mcpButton = root.getByRole('button', { name: 'MCP' });
    this.connectedMcpButton = this.mcpButton.filter({
      has: page.locator('[class*="mcp-button-dot"][class*="connected"]'),
    });
    this.menu = root.getByRole('menu');
    this.connectMenuItem = this.menu.getByRole('menuitem', {
      name: 'Connect',
      exact: true,
    });
    this.copySessionIdMenuItem = this.menu.getByRole('menuitem', {
      name: 'Copy session ID',
    });
    this.disconnectMenuItem = this.menu.getByRole('menuitem', {
      name: 'Disconnect',
    });
    this.connectedText = this.menu.getByText('MCP connected', { exact: true });
    this.sessionIdText = this.menu.getByText(/^Session ID: /);
  }

  /** Opens the MCP menu by clicking on the MCP button. */
  async openMenu() {
    await this.mcpButton.click();
    await expect(this.menu, 'MCP menu is open').toBeVisible();
  }

  /** Closes the MCP menu with Escape. */
  async closeMenu() {
    await this.page.keyboard.press('Escape');
    await expect(this.menu, 'MCP menu is closed').toBeHidden();
  }

  /**
   * Clicks on the "Connect" option of the open MCP menu and waits for the green dot
   * of the MCP button. Connecting can take a while, hence the long timeout.
   */
  async clickConnectMenuItem() {
    await this.connectMenuItem.click();
    await expect(
      this.connectedMcpButton,
      'MCP button shows the connected (green) dot',
    ).toBeVisible({ timeout: 60000 });
  }

  /**
   * Reads the session ID shown in the open MCP menu.
   * @returns The session ID, without the "Session ID: " prefix.
   */
  async getSessionId(): Promise<string> {
    const text = await this.sessionIdText.innerText();
    return text.replace(/^Session ID: /, '').trim();
  }

  /**
   * Checks whether the MCP button is shown.
   * @param visible Whether the button is expected to be visible (default true).
   */
  async checkMcpButtonIsVisible(visible = true) {
    visible
      ? await expect(this.mcpButton, 'MCP button is visible').toBeVisible()
      : await expect(this.mcpButton, 'MCP button is hidden').toBeHidden();
  }

  /**
   * Checks the open MCP menu shows no connection: only the "Connect" option, and
   * the MCP button has no green dot.
   */
  async checkMenuIsNotConnected() {
    await expect(
      this.menu.getByRole('menuitem'),
      'MCP menu has one option',
    ).toHaveCount(1);
    await expect(this.connectMenuItem, 'MCP menu shows "Connect"').toBeVisible();
    await expect(
      this.connectedMcpButton,
      'MCP button has no connected (green) dot',
    ).toBeHidden();
  }

  /**
   * Checks the open MCP menu shows an active connection: "MCP connected", the
   * session ID and the "Copy session ID" and "Disconnect" options.
   * @param sessionId Expected session ID; when omitted, any session ID is accepted.
   */
  async checkMenuIsConnected(sessionId?: string) {
    await expect(this.connectedText, 'MCP menu shows "MCP connected"').toBeVisible();
    await expect(
      this.sessionIdText,
      `MCP menu shows the session ID${sessionId ? ` ${sessionId}` : ''}`,
    ).toHaveText(sessionId ? `Session ID: ${sessionId}` : /^Session ID: \S+$/);
    await expect(
      this.copySessionIdMenuItem,
      'MCP menu shows "Copy session ID"',
    ).toBeVisible();
    await expect(
      this.disconnectMenuItem,
      'MCP menu shows "Disconnect"',
    ).toBeVisible();
    await expect(
      this.connectedMcpButton,
      'MCP button shows the connected (green) dot',
    ).toBeVisible();
  }
}
