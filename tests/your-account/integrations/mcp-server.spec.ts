import { ProfilePage } from '@pages/profile-page';
import { integrationsTest } from '../your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { expect, Page } from '@playwright/test';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;

integrationsTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);

  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

integrationsTest.afterEach(async ({ profilePage }) => {
  await teamPage.deleteTeam(teamName);
});

integrationsTest(
  qase(
    [2771, 2770, 2775, 2783, 2785, 2787, 2791],
    'Enable MCP generating key, disable MCP, enable MCP with an existing key and delete key',
  ),
  async ({ profilePage }: { profilePage: ProfilePage }) => {
    await integrationsTest.step('2771 Enable MCP', async () => {
      await profilePage.enableMCPServerWithoutKey();
    });
    await integrationsTest.step('2771 Generate MCP key', async () => {
      await profilePage.generateMCPKey();
    });

    await integrationsTest.step('2787 Disable MCP', async () => {
      await profilePage.disableMCPServer();
      await profilePage.backToDashboardFromAccount();
    });

    await integrationsTest.step(
      '2785 Create a new file and open it in the workspace',
      async () => {
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.isMainPageLoaded();
      },
    );

    await integrationsTest.step(
      '2785 Open the link to manage the MCP server status from the Workspace menu',
      async () => {
        await mainPage.clickMainMenuButton();
        await expect(mainPage.mcpServerMainMenuStatusIndicator).toHaveScreenshot(
          'MCP_Server_Status_Disconnected.png',
        );
        await mainPage.hoverMCPServerMenuItem();
        const manageMCPServerPage =
          await mainPage.openManageMCPServerStatusPage('disabled');
        await expect(manageMCPServerPage).toHaveURL(/#\/settings\/integrations$/);
      },
    );

    await integrationsTest.step(
      'Go back to the integrations page from file editor',
      async () => {
        await mainPage.backToDashboardFromFileEditor();
        await profilePage.openYourAccountPage();
        await profilePage.openIntegrationsPage();
        await profilePage.isHeaderDisplayed('Your account');
      },
    );

    await integrationsTest.step(
      '2770 Enable MCP server with an existing MCP key',
      async () => {
        await profilePage.enableMCPServerWithKey();
      },
    );

    await integrationsTest.step(
      'Re-open the file from the Integrations page',
      async () => {
        await profilePage.backToDashboardFromAccount();
        await dashboardPage.openFileWithName('New File 1');
        await mainPage.isMainPageLoaded();
      },
    );

    await integrationsTest.step(
      '2791 Disconnect with the MCP Server from the MCP Workspace menu',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.disconnectMCPServerMenuSubItem.waitFor({ timeout: 100000 });
        await expect(mainPage.mcpServerMainMenuStatusIndicator).toHaveCSS(
          'background-color',
          'rgb(126, 255, 245)',
        );
        await mainPage.clickDisconnectMCPServerMenuSubItem();

        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.connectMCPServerMenuSubItem.waitFor({ timeout: 100000 });
        await expect(mainPage.mcpServerMainMenuStatusIndicator).toHaveCSS(
          'background-color',
          'rgb(143, 157, 163)',
          { timeout: 30000 },
        );
        await expect(
          mainPage.getManageMCPServerStatusMenuSubItem('enabled'),
        ).toBeVisible();

        await mainPage.clickViewportByCoordinates(300, 300);
      },
    );

    await integrationsTest.step(
      '2783 Connect with the MCP Server from the MCP Workspace menu',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.clickConnectMCPServerMenuSubItem();

        await mainPage.clickMainMenuButton();
        await mainPage.hoverMCPServerMenuItem();
        await mainPage.disconnectMCPServerMenuSubItem.waitFor({ timeout: 10000 });
        await expect(mainPage.mcpServerMainMenuStatusIndicator).toHaveCSS(
          'background-color',
          'rgb(126, 255, 245)',
        );
        await expect(
          mainPage.getManageMCPServerStatusMenuSubItem('enabled'),
        ).toBeVisible();
        await mainPage.clickViewportByCoordinates(300, 300);
      },
    );

    await integrationsTest.step(
      'Go back to the integrations page from file editor',
      async () => {
        await mainPage.backToDashboardFromFileEditor();
        await profilePage.openYourAccountPage();
        await profilePage.openIntegrationsPage();
        await profilePage.isHeaderDisplayed('Your account');
      },
    );

    await integrationsTest.step('2775 Delete MCP key', async () => {
      await profilePage.deleteMCPKey();
    });

    await integrationsTest.step(
      '2775 Verify state persistence after reload',
      async () => {
        await profilePage.reloadPage();
        await profilePage.checkNoMCPKey();
      },
    );

    await profilePage.backToDashboardFromAccount();
  },
);
