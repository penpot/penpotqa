import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountMcpEnabledTest } from 'fixtures';
import { createFile } from 'helpers/files/create-file';
import { openFileInWorkspace } from 'helpers/files/open-file-in-workspace';
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
  qase(
    [4025],
    'Keep the MCP connection when opening another file in the same tab and lose it on reload',
  ),
  async ({ page }) => {
    const { mcpMenu } = workspacePage.toolbar;
    let sessionId = '';

    await demoAccountMcpEnabledTest.step(
      'Create "File A" and "File B" in Drafts and open "File A"',
      async () => {
        const request = page.context().request;
        const { teamId, fileId } = await createFile(request, { name: 'File A' });
        await createFile(request, { name: 'File B' });
        await openFileInWorkspace(page, teamId, fileId);
      },
    );

    await demoAccountMcpEnabledTest.step(
      'The file is not connected automatically',
      async () => {
        await mcpMenu.openMenu();
        await mcpMenu.checkMenuIsNotConnected();
      },
    );

    await demoAccountMcpEnabledTest.step(
      'Connect from the MCP button and note the session ID',
      async () => {
        await mcpMenu.clickConnectMenuItem();
        await mcpMenu.openMenu();
        await mcpMenu.checkMenuIsConnected();
        sessionId = await mcpMenu.getSessionId();
        await mcpMenu.closeMenu();
      },
    );

    await demoAccountMcpEnabledTest.step(
      'Go back to the dashboard and open "File B" in the same tab',
      async () => {
        await mainPage.backToDashboardFromFileEditor('Personal Projects');
        await dashboardPage.openFileWithName('File B');
        await mainPage.isMainPageLoaded();
        await mainPage.isProjectAndFileNameExistInFile('Drafts', 'File B');
      },
    );

    await demoAccountMcpEnabledTest.step(
      '"File B" is connected with the same session ID',
      async () => {
        await mcpMenu.openMenu();
        await mcpMenu.checkMenuIsConnected(sessionId);
        await mcpMenu.closeMenu();
      },
    );

    await demoAccountMcpEnabledTest.step(
      'Reload the page: the connection is lost',
      async () => {
        await mainPage.refreshPage();
        await mainPage.isMainPageLoaded();
        await mcpMenu.openMenu();
        await mcpMenu.checkMenuIsNotConnected();
      },
    );
  },
);
