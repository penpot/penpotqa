import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { PluginsPage } from '@pages/workspace/plugins-page';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let pluginsPage: PluginsPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  pluginsPage = new PluginsPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await pluginsPage.isMainPageLoaded();
});

mainTest(qase([1837, 1839, 1844], 'Install, open and delete a plugin'), async () => {
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
});
