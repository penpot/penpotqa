const { MainPage } = require('../workspace/main-page');
const { expect } = require('@playwright/test');

const LOREM_IPSUM_PLUGIN_URL =
  'https://lorem-ipsum-penpot-plugin.pages.dev/assets/manifest.json';

exports.PluginsPage = class PluginsPage extends MainPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Main Toolbar
    this.pluginsButton = page.getByRole('button', { name: /plugins/i });

    // Main Menu - first level
    this.pluginsMainMenuItem = page.getByRole('menuitem').getByText('Plugins');

    // Main Menu - second level
    this.pluginsManagerButton = page
      .getByRole('menuitem')
      .getByText('Plugins Manager');
    this.loremIpsumPluginButton = page
      .getByRole('menuitem')
      .getByText('Lorem ipsum');

    // Plugin Manager panel
    this.pluginManagementModal = page.locator(
      '.main_ui_workspace_plugins__plugin-management',
    );
    this.closePluginPanelButton = this.pluginManagementModal.locator(
      '.main_ui_workspace_plugins__close-btn',
    );
    this.urlPluginPanelInput =
      this.pluginManagementModal.getByPlaceholder('Write a plugin URL');
    this.installPluginPanelButton = this.pluginManagementModal
      .getByRole('button', { name: 'Install' })
      .first();
    this.deletePluginPanelButton = this.pluginManagementModal
      .getByRole('button', { name: 'Remove plugin' })
      .first();
    this.pluginList = this.pluginManagementModal.locator(
      '.main_ui_workspace_plugins__plugins-list',
    );
    this.pluginItem = this.pluginManagementModal.locator(
      '.main_ui_workspace_plugins__plugins-list-element',
    );
    this.noPluginsText = this.pluginManagementModal.getByText(
      'No plugins installed yet',
    );

    // Permissions Modal
    this.allowPluginPanelButton = this.page.getByRole('button', { name: 'Allow' });
    this.openPluginPanelButton = this.pluginManagementModal.getByRole('button', {
      name: 'Open',
    });

    // Lorem Ipsum Plugin Panel
    this.loremPluginPanel = page
      .getByTitle('LOREM IPSUM PLUGIN')
      .locator('div')
      .first();
    this.loremIpsumFrame = page.frameLocator(
      '[src*="https://lorem-ipsum-penpot-plugin.pages.dev"]',
    );
    this.loremIpsumPluginGenerationOptions =
      this.loremIpsumFrame.locator('.generation-options');
    this.loremIpsumPluginGenerateButton = this.loremIpsumFrame.getByRole('button', {
      name: /Generate/i,
    });
  }

  async clickPluginsButton() {
    await this.pluginsButton.click();
  }

  async clickPluginsMainMenuItem() {
    await this.pluginsMainMenuItem.click();
  }

  async clickPluginsManagerButton() {
    await this.pluginsManagerButton.click();
  }

  async clickLoremIpsumButton() {
    await this.loremIpsumPluginButton.click();
  }

  async setPluginUrl(url) {
    await this.urlPluginPanelInput.clear();
    await this.urlPluginPanelInput.fill(url);
  }

  async clickOnInstallPluginButton() {
    await this.installPluginPanelButton.click();
  }

  async clickOnDeletePluginButton() {
    await this.deletePluginPanelButton.click();
  }

  async clickOnAllowPluginButton() {
    await this.allowPluginPanelButton.click();
  }

  async clickClosePluginPanelButton() {
    await this.closePluginPanelButton.click();
  }

  async isInstalledPluginsCount(count) {
    await expect(this.pluginItem, `Plugin count is ${count}`).toHaveCount(count);
  }

  async setPluginLoremIpsumUrl() {
    await this.setPluginUrl(LOREM_IPSUM_PLUGIN_URL);
  }

  async isLoremIpsumPluginVisible() {
    await expect(
      this.loremIpsumPluginGenerationOptions,
      'Plugin generation options is visible',
    ).toBeVisible();
    await expect(
      this.loremIpsumPluginGenerateButton,
      'Generate button is visible',
    ).toBeVisible();
  }

  async isPluginManagerModalVisible() {
    await expect(
      this.pluginManagementModal,
      'Plugin Manager modal is visible',
    ).toBeVisible();
  }

  async isPluginManagerModalNotVisible() {
    await expect(
      this.pluginManagementModal,
      'Plugin Manager modal is not visible',
    ).not.toBeVisible();
  }

  async isOpenPluginButtonVisible() {
    await expect(
      this.openPluginPanelButton,
      'Open plugin button is visible',
    ).toBeVisible();
  }

  async isNoPluginMessageVisible() {
    await expect(
      this.noPluginsText,
      `"No plugins installed yet" message is visible`,
    ).toBeVisible();
  }
};
