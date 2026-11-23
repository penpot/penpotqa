import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountMcpEnabledTest } from 'fixtures';
import { createFile } from 'helpers/files/create-file';
import { qase } from 'playwright-qase-reporter/playwright';

let dashboardPage: DashboardPage;
let mainPage: MainPage;
let workspacePage: WorkspacePage;

demoAccountMcpEnabledTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  workspacePage = new WorkspacePage(page);
});

demoAccountMcpEnabledTest(
  qase([4059, 4057], 'MCP button and connection from the dashboard'),
  async ({ page }) => {
    const fileName = 'New File 1';
    const { mcpMenu: dashboardMcpMenu } = dashboardPage;
    const { mcpMenu: workspaceMcpMenu } = workspacePage.toolbar;

    await demoAccountMcpEnabledTest.step(
      'Create a file in Drafts via the API',
      async () => {
        await createFile(page.context().request, { name: fileName });
      },
    );

    await demoAccountMcpEnabledTest.step(
      '4059, Show the MCP button only on the Projects and Drafts pages of the dashboard',
      async () => {
        await demoAccountMcpEnabledTest.step(
          'MCP button is shown on Projects',
          async () => {
            await dashboardPage.openSidebarItem('Projects', 'Personal Projects');
            await dashboardMcpMenu.checkMcpButtonIsVisible();
          },
        );

        await demoAccountMcpEnabledTest.step(
          'MCP button is shown on Drafts',
          async () => {
            await dashboardPage.openSidebarItem('Drafts');
            await dashboardMcpMenu.checkMcpButtonIsVisible();
          },
        );

        await demoAccountMcpEnabledTest.step(
          'MCP button is not shown on Fonts',
          async () => {
            await dashboardPage.openSidebarItem('Fonts');
            await dashboardMcpMenu.checkMcpButtonIsVisible(false);
          },
        );

        await demoAccountMcpEnabledTest.step(
          'MCP button is not shown on Libraries',
          async () => {
            await dashboardPage.openSidebarItem('Libraries');
            await dashboardMcpMenu.checkMcpButtonIsVisible(false);
          },
        );
      },
    );

    await demoAccountMcpEnabledTest.step(
      '4057, Connect to the MCP server from the dashboard and keep the connection when opening a file',
      async () => {
        let sessionId = '';

        await demoAccountMcpEnabledTest.step(
          'Connect from the MCP button of Drafts',
          async () => {
            await dashboardPage.openSidebarItem('Drafts');
            await dashboardMcpMenu.checkMcpButtonIsVisible();
            await dashboardMcpMenu.openMenu();
            await dashboardMcpMenu.checkMenuIsNotConnected();
            await dashboardMcpMenu.clickConnectMenuItem();
          },
        );

        await demoAccountMcpEnabledTest.step(
          'MCP menu shows the connection and its session ID',
          async () => {
            await dashboardMcpMenu.openMenu();
            await dashboardMcpMenu.checkMenuIsConnected();
            sessionId = await dashboardMcpMenu.getSessionId();
            await dashboardMcpMenu.closeMenu();
          },
        );

        await demoAccountMcpEnabledTest.step(
          'Open the file: the workspace keeps the same session',
          async () => {
            await dashboardPage.openFileWithName(fileName);
            await mainPage.isMainPageLoaded();
            await workspaceMcpMenu.openMenu();
            await workspaceMcpMenu.checkMenuIsConnected(sessionId);
            await workspaceMcpMenu.closeMenu();
          },
        );

        await demoAccountMcpEnabledTest.step(
          'Go back to the dashboard: it keeps the same session',
          async () => {
            await mainPage.backToDashboardFromFileEditor('Personal Projects');
            await dashboardMcpMenu.openMenu();
            await dashboardMcpMenu.checkMenuIsConnected(sessionId);
          },
        );
      },
    );
  },
);
