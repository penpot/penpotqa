const { MainPage } = require('../workspace/main-page');
const { expect } = require('@playwright/test');

const LOREM_IPSUM_PLUGIN_URL =  'https://lorem-ipsum-penpot-plugin.pages.dev/assets/manifest.json';

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
    this.pluginsManagerButton = page.getByRole('menuitem').getByText('Plugins Manager');;
    this.loremIpsumPluginButton = page.getByRole('menuitem').getByText('Lorem ipsum');;

    // Plugin Manager panel
    this.pluginPanel = page.locator('div[class$="workspace_plugins__plugin-management"]');
    this.closePluginPanelButton = page.locator('button[class$="plugins__close-btn"]');
    this.urlPluginPanelInput = page.getByRole('textbox').and(page.getByPlaceholder('Write a plugin URL'));
    this.installPluginPanelButton = page.getByRole('button', { name: 'Install' }).first()
    this.deletePluginPanelButton = page.locator('button[class$="plugins__trash-button"]').first();
    this.allowPluginPanelButton = page.getByRole('button', { name: 'Allow' })
    this.openPluginPanelButton = page.locator('button', {name: 'Open'});
    this.installedPluginPanelListElements = page.locator('div[class$="workspace_plugins__plugins-list-element"]')

    // Lorem Ipsum panel
    this.loremPluginPanel = page.getByTitle('LOREM IPSUM PLUGIN').locator('div').first()
    this.loremIpsumPluginGenerateButton  = page.frameLocator('[src*="https://lorem-ipsum-penpot-plugin.pages.dev"]').getByRole('button', { name: /Generate/i});;
  }

  // POM Methods
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
    await expect(this.pluginPanel).not.toBeVisible();
  }

  async checkInstalledPluginsCountIs(count) {
    expect(await this.installedPluginPanelListElements.count()).toBe(count);
  }

  async setPluginLoremIpsumUrl() {
    await this.setPluginUrl(LOREM_IPSUM_PLUGIN_URL);
  }
  
  async checkLoremIpsumPluginIsVisible() {
    await (expect(this.loremIpsumPluginGenerateButton).toBeVisible());
  }
};
