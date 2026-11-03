import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { ProfilePage } from '@pages/profile-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { expect } from '@playwright/test';
import { demoAccountApiFixture } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const team = createTeamName();

let dashboardPage: DashboardPage;
let mainPage: MainPage;
let profilePage: ProfilePage;
let teamPage: TeamPage;

demoAccountApiFixture.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  mainPage = new MainPage(page);
});

demoAccountApiFixture(
  qase([1200], 'Team Settings - upload team profile picture'),
  async () => {
    await demoAccountApiFixture.step(
      'Create a team and open team settings',
      async () => {
        await teamPage.createTeam(team);
        await teamPage.openTeamSettingsPageViaOptionsMenu();
      },
    );

    await demoAccountApiFixture.step(
      'Upload team profile picture and verify the icon',
      async () => {
        await teamPage.uploadTeamImage('images/images.png');
        await teamPage.waitInfoMessageHidden();
        const iconUrl = await teamPage.teamIcon.getAttribute('src');
        const response = await teamPage.page.request.get(iconUrl!);
        expect(await response.body()).toMatchSnapshot('team-profile-image.jpg');
      },
    );
  },
);

demoAccountApiFixture(
  qase([1202], "Team. Settings - check 'Team members' info"),
  async () => {
    const teamOwner = 'QA Engineer (Owner)';

    await demoAccountApiFixture.step(
      'Update profile name and create a team',
      async () => {
        await profilePage.openYourAccountPage();
        await profilePage.isHeaderDisplayed('Your account');
        await profilePage.changeProfileName('QA Engineer');
        await profilePage.uploadProfileImage('images/sample.jpeg');
        await profilePage.waitInfoMessageHidden();
        await profilePage.backToDashboardFromAccount();
        await teamPage.createTeam(team);
        await teamPage.openTeamSettingsPageViaOptionsMenu();
      },
    );

    await demoAccountApiFixture.step(
      'Verify team owner and members info',
      async () => {
        await teamPage.isTeamOwnerInfoDisplayed(teamOwner);
        await teamPage.isTeamMembersInfoDisplayed('1 members');
      },
    );
  },
);

demoAccountApiFixture(
  qase([1203], "Team. Settings - check 'Team projects' info"),
  async () => {
    const projectFirst = 'QA Project 1';
    const projectSecond = 'QA Project 2';

    await demoAccountApiFixture.step(
      'Create projects and files for the team',
      async () => {
        await teamPage.createTeam(team);
        await dashboardPage.createProject(projectFirst);
        await dashboardPage.pinProjectByName(projectFirst);
        await dashboardPage.createProject(projectSecond);
        await dashboardPage.pinProjectByName(projectSecond);
        await dashboardPage.openSidebarItem('Drafts');
        await dashboardPage.createFileViaProjectPlaceholder();
        await mainPage.backToDashboardFromFileEditor();
        await dashboardPage.openPinnedProjectFromSidebar(projectFirst);
        await dashboardPage.createFileViaProjectPlaceholder();
        await mainPage.backToDashboardFromFileEditor();
        await dashboardPage.openPinnedProjectFromSidebar(projectSecond);
        await dashboardPage.createFileViaProjectPlaceholder();
        await mainPage.backToDashboardFromFileEditor();
      },
    );

    await demoAccountApiFixture.step(
      'Open team settings and verify project/file counters',
      async () => {
        await teamPage.openTeamSettingsPageViaOptionsMenu();
        await teamPage.isTeamProjectsInfoDisplayed('2 projects');
        await teamPage.isTeamFilesInfoDisplayed('3 files');
      },
    );
  },
);

demoAccountApiFixture(qase([1208], 'Delete a team via owner'), async () => {
  await demoAccountApiFixture.step('Create and delete the team', async () => {
    await teamPage.createTeam(team);
    await teamPage.deleteTeam(team);
    await teamPage.isTeamDeleted(team);
  });
});
