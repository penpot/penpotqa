import { ProfilePage } from '@pages/profile-page';
import { integrationsTest } from '../your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';

let mainPage: MainPage;
let dashboardPage: DashboardPage;

integrationsTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
});

integrationsTest(
  qase(
    [2771, 2770, 2775, 2782, 2783, 2784, 2787, 2791, 3065],
    'Enable MCP generating key, disable MCP, enable MCP with an existing key and delete key',
  ),
  async ({ profilePage }: { profilePage: ProfilePage }) => {
    await integrationsTest.step(
      '2771 Enable MCP integration generating MCP key',
      async () => {
        await integrationsTest.step('Enable MCP', async () => {
          await profilePage.enableMCPServerWithoutKey();
        });
        await integrationsTest.step('Generate MCP key', async () => {
          await profilePage.generateMCPKey();
        });
      },
    );

    await integrationsTest.step('2787 Disable MCP integration', async () => {
      await integrationsTest.step('Disable MCP', async () => {
        await profilePage.disableMCPServer();
      });
    });

    await integrationsTest.step(
      '2782 MCP Workspace menu displays the "Disabled" status when the MCP server is not enabled',
      async () => {
        await integrationsTest.step(
          'Create a new file and open it in the workspace',
          async () => {
            await profilePage.backToDashboardFromAccount();
            await dashboardPage.createFileViaPlaceholder();
            await mainPage.isMainPageLoaded();
          },
        );

        await integrationsTest.step(
          'Check if MCP server status is disabled',
          async () => {
            await mainPage.clickMainMenuButton();
            await mainPage.isMCPServerStatusIndicatorActive(false);
          },
        );
      },
    );

    await integrationsTest.step(
      '2770 Enable MCP server with an existing MCP key',
      async () => {
        await integrationsTest.step(
          'Go back to the integrations page from file editor',
          async () => {
            await mainPage.backToDashboardFromFileEditor();
            await profilePage.openYourAccountIntegrationsPage();
          },
        );

        await integrationsTest.step('Enable MCP server', async () => {
          await profilePage.enableMCPServerWithKey();
        });
      },
    );

    await integrationsTest.step(
      '2791 Disconnect with the MCP Server from the MCP Workspace menu',
      async () => {
        await integrationsTest.step(
          'Re-open the file from the Integrations page',
          async () => {
            await profilePage.backToDashboardFromAccount();
            await dashboardPage.openFileWithName('New File 1');
            await mainPage.isMainPageLoaded();
          },
        );

        await integrationsTest.step(
          'Disconnect from the MCP Workspace menu',
          async () => {
            await mainPage.clickMainMenuButton();
            await mainPage.hoverMCPServerMenuItem();
            await mainPage.isDisconnectMCPServerMenuSubItemVisible();
            await mainPage.isMCPServerStatusIndicatorActive(true);
            await mainPage.clickDisconnectMCPServerMenuSubItem();
          },
        );
      },
    );

    await integrationsTest.step(
      '2784 MCP Workspace menu displays the "Enabled" status when the MCP server is enabled (with no active connection)',
      async () => {
        // The status indicator can take a while to be updated after disconnecting
        await mainPage.refreshPage();
        await mainPage.isMainPageLoaded();

        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.isConnectMCPServerMenuSubItemVisible();
        await mainPage.isManageMCPServerStatusMenuSubItemVisible('enabled');
        await mainPage.clickViewportByCoordinates(300, 300);
      },
    );

    await integrationsTest.step(
      '2783 Connect with the MCP Server from the MCP Workspace menu',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.clickConnectMCPServerMenuSubItem();

        // The status indicator can take a while to be updated after connecting
        await mainPage.refreshPage();
        await mainPage.isMainPageLoaded();

        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.isDisconnectMCPServerMenuSubItemVisible();
        await mainPage.isManageMCPServerStatusMenuSubItemVisible('enabled');
      },
    );

    await integrationsTest.step(
      '3065 Connect with the MCP Server from the MCP button in workspace toolbar',
      async () => {
        await integrationsTest.step(
          'Disconnect from the MCP Workspace menu',
          async () => {
            await mainPage.clickDisconnectMCPServerMenuSubItem();
          },
        );

        await integrationsTest.step(
          'Click MCP button from toolbar and click Connect here',
          async () => {
            await mainPage.connectMCPButtonFromToolbar();
          },
        );

        await integrationsTest.step(
          'Assert MCP Connected message is visible',
          async () => {
            await mainPage.reloadPage();
            await mainPage.clickMCPButtonFromToolbar();
            await mainPage.isMCPConnectedButtonVisible();
          },
        );
      },
    );

    await integrationsTest.step('2775 Delete MCP key', async () => {
      await integrationsTest.step(
        'Go back to the integrations page from file editor',
        async () => {
          await mainPage.backToDashboardFromFileEditor();
          await profilePage.openYourAccountIntegrationsPage();
        },
      );

      await integrationsTest.step('Delete MCP key', async () => {
        await profilePage.deleteMCPKey();
      });

      await integrationsTest.step(
        'Verify state persistence after reload',
        async () => {
          await profilePage.reloadPage();
          await profilePage.checkNoMCPKey();
          await profilePage.backToDashboardFromAccount();
        },
      );
    });
  },
);
