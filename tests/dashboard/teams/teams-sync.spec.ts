import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoTeamWithInviteeTest } from 'fixtures';
import { openFileInWorkspace } from 'helpers/files/open-file-in-workspace';
import { qase } from 'playwright-qase-reporter/playwright';

demoTeamWithInviteeTest(
  qase([842], 'Sync New File'),
  async ({ page, mainPage, team, invitee }) => {
    const ownerDashboardPage = new DashboardPage(page);
    const ownerWorkspacePage = new WorkspacePage(page);
    const inviteeTeamPage = new TeamPage(invitee.page);
    const inviteeDashboardPage = new DashboardPage(invitee.page);
    const fileName = 'Sync file';
    // The fixture opened the owner in a new file of the team
    const fileId = new URL(page.url()).searchParams.get('file-id')!;
    const ownerName = 'QA Tester';
    const users = [ownerName, invitee.name];

    await demoTeamWithInviteeTest.step(
      'Both accounts open the same file: each one sees both users in the header',
      async () => {
        await openFileInWorkspace(invitee.page, team.id, fileId);
        await ownerWorkspacePage.rightSidebar.checkActiveUsersAreVisible(users);
        await invitee.workspacePage.rightSidebar.checkActiveUsersAreVisible(users);
      },
    );

    await demoTeamWithInviteeTest.step(
      'Each account moves over the canvas: the other one sees its pointer with its name',
      async () => {
        await invitee.workspacePage.canvas.movePointer(
          { x: 300, y: 300 },
          { x: 400, y: 350 },
        );
        await ownerWorkspacePage.canvas.checkUserPointerIsVisible(invitee.name);
        await ownerWorkspacePage.canvas.movePointer(
          { x: 600, y: 300 },
          { x: 700, y: 350 },
        );
        await invitee.workspacePage.canvas.checkUserPointerIsVisible(ownerName);
      },
    );

    await demoTeamWithInviteeTest.step(
      'The second account opens the team dashboard',
      async () => {
        await inviteeTeamPage.goToTeamDashboard(team.id);
        await inviteeTeamPage.isTeamSelected(team.name);
      },
    );

    await demoTeamWithInviteeTest.step(
      'The owner creates a new file named "Sync file"',
      async () => {
        await mainPage.clickPencilBoxButton();
        await ownerDashboardPage.createFileViaTitlePanel();
        await mainPage.clickPencilBoxButton();
        // The open templates panel covers the file name field while renaming
        await ownerDashboardPage.hideLibrariesAndTemplatesCarrousel();
        await ownerDashboardPage.renameFile('New File 2', fileName);
      },
    );

    await demoTeamWithInviteeTest.step(
      'The second account reloads the dashboard: "Sync file" is listed',
      async () => {
        await inviteeDashboardPage.reloadPage();
        await inviteeDashboardPage.isFilePresentWithName(fileName);
      },
    );
  },
);
