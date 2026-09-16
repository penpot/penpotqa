import { PluginsPage } from '@pages/workspace/plugins-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let pluginsPage: PluginsPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  pluginsPage = new PluginsPage(page);
});

demoAccountFileTest(
  qase([1837, 1839, 1844], 'Install, open and delete a plugin'),
  async () => {
    await demoAccountFileTest.step(
      '1837, Install a plugin by URL (via plugin icon in toolbar)',
      async () => {
        await pluginsPage.clickPluginsButton();
        await pluginsPage.isPluginManagerModalVisible();
        await pluginsPage.setPluginLoremIpsumUrl();
        await pluginsPage.clickOnInstallPluginButton();
        await pluginsPage.clickOnAllowPluginButton();
        await pluginsPage.isInstalledPluginsCount(1);
        await pluginsPage.isOpenPluginButtonVisible();
        await pluginsPage.clickClosePluginPanelButton();
        await pluginsPage.isPluginManagerModalNotVisible();
      },
    );

    await demoAccountFileTest.step(
      '1844, Open a plugin (via Main menu 3 dots > Plugins > plugin name)',
      async () => {
        await pluginsPage.clickMainMenuButton();
        await pluginsPage.clickPluginsMainMenuItem();
        await pluginsPage.clickLoremIpsumButton();
        await pluginsPage.isLoremIpsumPluginVisible();
      },
    );

    await demoAccountFileTest.step(
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
  },
);
