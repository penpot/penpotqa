import {
  integrationsTest,
  yourAccountFileTest,
  yourAccountMcpEnabledTest,
} from '@tests/profile-menu/your-account/your-account-fixture';
import { createFile } from 'helpers/files/create-file';
import { openFileInWorkspace } from 'helpers/files/open-file-in-workspace';
import { qase } from 'playwright-qase-reporter/playwright';

integrationsTest(
  qase(
    [2771, 2787, 2770, 2775],
    'Enable MCP generating a key, disable it, enable it again with the existing key and delete the key',
  ),
  async ({ yourAccountPage }) => {
    const { mcpServer } = yourAccountPage.integrations;

    await integrationsTest.step(
      '(2771) Enable MCP integration generating MCP key',
      async () => {
        await mcpServer.enableWithoutKey();
        await mcpServer.generateKey();
      },
    );

    await integrationsTest.step('(2787) Disable MCP integration', async () => {
      await mcpServer.disable();
    });

    await integrationsTest.step(
      '(2770) Enable MCP server with an existing MCP key',
      async () => {
        await mcpServer.enableWithKey();
      },
    );

    await integrationsTest.step('(2775) Delete MCP key', async () => {
      await mcpServer.deleteKey();
    });

    await integrationsTest.step(
      'The key is still deleted after reloading',
      async () => {
        await yourAccountPage.reloadPage();
        await mcpServer.checkNoKey();
      },
    );
  },
);

// yourAccountFileTest: a new account, whose MCP server has never been enabled,
// with a file open
yourAccountFileTest(
  qase(
    [2782],
    'MCP Workspace menu displays the "Disabled" status when the MCP server is not enabled',
  ),
  async ({ mainPage }) => {
    await yourAccountFileTest.step(
      'Open the main menu → MCP server status is disabled',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.isMCPServerStatusIndicatorActive(false);
      },
    );
  },
);

yourAccountMcpEnabledTest(
  qase(
    [2791, 2784, 2783, 3065],
    'Connect to and disconnect from the MCP server from the workspace',
  ),
  async ({ page, mainPage }) => {
    await yourAccountMcpEnabledTest.step(
      'Setup: create a file and open it in the workspace',
      async () => {
        const request = page.context().request;
        const { teamId, fileId } = await createFile(request);
        await openFileInWorkspace(page, teamId, fileId);
        await mainPage.isMainPageLoaded();
      },
    );

    await yourAccountMcpEnabledTest.step(
      '(2791) Connect and disconnect from the MCP Workspace menu',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.isConnectMCPServerMenuSubItemVisible();
        await mainPage.clickConnectMCPServerMenuSubItem();

        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.isDisconnectMCPServerMenuSubItemVisible(60000);
        await mainPage.isMCPServerStatusIndicatorActive(true);
        await mainPage.clickDisconnectMCPServerMenuSubItem();
      },
    );

    await yourAccountMcpEnabledTest.step(
      '(2784) MCP Workspace menu displays the "Enabled" status with no active connection',
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

    await yourAccountMcpEnabledTest.step(
      '(2783) Connect with the MCP Server from the MCP Workspace menu',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.clickConnectMCPServerMenuSubItem();

        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.isDisconnectMCPServerMenuSubItemVisible(60000);
        await mainPage.isMCPServerStatusIndicatorActive(true);
        await mainPage.isManageMCPServerStatusMenuSubItemVisible('enabled');
        await mainPage.clickViewportByCoordinates(300, 300);
      },
    );

    await yourAccountMcpEnabledTest.step(
      '(3065) Connect with the MCP Server from the MCP button in workspace toolbar',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.clickDisconnectMCPServerMenuSubItem();

        await mainPage.connectMCPButtonFromToolbar();

        await mainPage.clickMCPButtonFromToolbar();
        await mainPage.isMCPConnectedButtonVisible();
        await mainPage.checkMCPSessionIdVisible();
      },
    );
  },
);
