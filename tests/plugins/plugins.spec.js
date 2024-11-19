const { mainTest } = require('../../fixtures');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { PluginsPage } = require('../../pages/workspace/plugins-page');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { updateTestResults } = require('../../helpers/saveTestResults');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const pluginsPage = new PluginsPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await pluginsPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const pluginsPage = new PluginsPage(page);
  await pluginsPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.slow();

mainTest(
  qase([1837, 1838, 1839, 1842, 1844], 'Install, open and delete a plugin'),
  async ({ page }) => {
    const pluginsPage = new PluginsPage(page);

    // 1837, Install a plugin by URL (via plugin icon in toolbar)
    await pluginsPage.clickPluginsButton();
    await expect(pluginsPage.pluginPanel).toBeVisible();

    await pluginsPage.setPluginLoremIpsumUrl();
    await pluginsPage.clickOnInstallPluginButton();
    await pluginsPage.clickOnAllowPluginButton();
    await pluginsPage.checkInstalledPluginsCountIs(1);
    await expect(pluginsPage.pluginPanel).toHaveScreenshot(
      'plugin-manager-plugin-installed.png',
    );

    // 1838, Close the "Plugins Manager" modal
    await pluginsPage.clickOnESC();

    // 1844, Open a plugin (via Main menu 3 dots > Plugins > plugin name)
    await pluginsPage.clickMainMenuButton();
    await pluginsPage.clickPluginsMainMenuItem();
    await pluginsPage.clickLoremIpsumButton();
    await pluginsPage.checkLoremIpsumPluginIsVisible();
    await expect(pluginsPage.loremPluginPanel).toHaveScreenshot(
      'lorem-ipsum-plugin-panel.png',
    );

    // 1839, Delete a plugin from the "Plugins Manager" modal (via delete icon button)
    await pluginsPage.clickMainMenuButton();
    await pluginsPage.clickPluginsMainMenuItem();
    await pluginsPage.clickPluginsManagerButton();
    await pluginsPage.clickOnDeletePluginButton();
    await pluginsPage.checkInstalledPluginsCountIs(0);
    await expect(pluginsPage.pluginPanel).toHaveScreenshot(
      'plugin-manager-no-plugins-installed.png',
    );

    // 1842, Close the plugin modal (via "X" icon)
    await pluginsPage.clickClosePluginPanelButton();
  },
);
