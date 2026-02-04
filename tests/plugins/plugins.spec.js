const { mainTest } = require('../../fixtures');
const { expect } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { PluginsPage } = require('../../pages/workspace/plugins-page');
const { qase } = require('playwright-qase-reporter/playwright');

//TO REMOVE
mainTest.skip(true, 'Temporarily disabled due to unrelated to new render');

const teamName = random().concat('autotest');

let pluginsPage, teamPage, dashboardPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  pluginsPage = new PluginsPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await pluginsPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await pluginsPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase([1837, 1838, 1839, 1842, 1844], 'Install, open and delete a plugin'),
  async () => {
    await mainTest.step(
      '1837, Install a plugin by URL (via plugin icon in toolbar)',
      async () => {
        await pluginsPage.clickPluginsButton();
        await pluginsPage.isPluginManagerModalVisible();
        await pluginsPage.setPluginLoremIpsumUrl();
        await pluginsPage.clickOnInstallPluginButton();
        await pluginsPage.clickOnAllowPluginButton();
        await pluginsPage.isInstalledPluginsCount(1);
        await pluginsPage.isOpenPluginButtonVisible();
      },
    );

    await mainTest.step('1838, Close the "Plugins Manager" modal', async () => {
      await pluginsPage.clickOnESC();
    });

    await mainTest.step(
      '1844, Open a plugin (via Main menu 3 dots > Plugins > plugin name)',
      async () => {
        await pluginsPage.clickMainMenuButton();
        await pluginsPage.clickPluginsMainMenuItem();
        await pluginsPage.clickLoremIpsumButton();
        await pluginsPage.isLoremIpsumPluginVisible();
      },
    );

    await mainTest.step(
      '1839, Delete a plugin from the "Plugins Manager" modal (via delete icon button)',
      async () => {
        await pluginsPage.clickMainMenuButton();
        await pluginsPage.clickPluginsMainMenuItem();
        await pluginsPage.clickPluginsManagerButton();
        await pluginsPage.clickOnDeletePluginButton();
        await pluginsPage.isInstalledPluginsCount(0);
        await pluginsPage.isNoPluginMessageVisible();
      },
    );

    await mainTest.step('1842, Close the plugin modal (via "X" icon)', async () => {
      await pluginsPage.clickClosePluginPanelButton();
      await pluginsPage.isPluginManagerModalNotVisible();
    });
  },
);
