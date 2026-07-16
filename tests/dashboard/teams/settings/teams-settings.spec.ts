import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { ProfilePage } from '@pages/profile-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const maxDiffPixelRatio = 0.001;
const team = createTeamName();

let dashboardPage: DashboardPage;
let mainPage: MainPage;
let profilePage: ProfilePage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  mainPage = new MainPage(page);
});

mainTest(qase([1200], 'Team Settings - upload team profile picture'), async () => {
  await mainTest.step('Create a team and open team settings', async () => {
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openTeamSettingsPageViaOptionsMenu();
  });

  await mainTest.step(
    'Upload team profile picture and verify the icon',
    async () => {
      await teamPage.uploadTeamImage('images/images.png');
      await teamPage.waitInfoMessageHidden();
      await teamPage.hoverOnTeamName();
      await expect(teamPage.teamIcon).toHaveScreenshot('team-profile-image.png', {
        maxDiffPixelRatio,
        mask: [teamPage.teamNameLabel],
      });
    },
  );
});

mainTest(qase([1202], "Team. Settings - check 'Team members' info"), async () => {
  const teamOwner = 'QA Engineer (Owner)';

  await mainTest.step('Update profile name and create a team', async () => {
    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.changeProfileName('QA Engineer');
    await profilePage.uploadProfileImage('images/sample.jpeg');
    await profilePage.waitInfoMessageHidden();
    await profilePage.backToDashboardFromAccount();
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openTeamSettingsPageViaOptionsMenu();
  });

  await mainTest.step('Verify team owner and members info', async () => {
    await teamPage.isTeamOwnerInfoDisplayed(teamOwner);
    await teamPage.isTeamMembersInfoDisplayed('1 members');
  });
});

mainTest(qase([1203], "Team. Settings - check 'Team projects' info"), async () => {
  const projectFirst = 'QA Project 1';
  const projectSecond = 'QA Project 2';

  await mainTest.step('Create projects and files for the team', async () => {
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
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
  });

  await mainTest.step(
    'Open team settings and verify project/file counters',
    async () => {
      await teamPage.openTeamSettingsPageViaOptionsMenu();
      await teamPage.isTeamProjectsInfoDisplayed('2 projects');
      await teamPage.isTeamFilesInfoDisplayed('3 files');
    },
  );
});

mainTest(qase([1208], 'Delete a team via owner'), async () => {
  await mainTest.step('Create and delete the team', async () => {
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.deleteTeam(team);
    await teamPage.isTeamDeleted(team);
  });
});
