import { registerTest } from '../../fixtures';
import { expect, test, Page } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { MainPage } from '../../pages/workspace/main-page';
import { random } from '../../helpers/string-generator';
import { ProfilePage } from '../../pages/profile-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TeamPage } from '../../pages/dashboard/team-page';

let profilePage: ProfilePage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

const teamName: string = random().concat('autotest');

test.beforeEach(async ({ page }: { page: Page }) => {
  profilePage = new ProfilePage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await profilePage.openYourAccountPage();
  await profilePage.openSettingsTab();
  await profilePage.selectLightTheme();
});

registerTest(qase(1677, 'Check Light UI them in Projects page'), async ({}) => {
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.hideLibrariesAndTemplatesCarrousel();
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.backToDashboardFromFileEditor();

  await expect(dashboardPage.dashboardSection).toHaveScreenshot(
    'dashboard-image.png',
    {
      mask: [profilePage.profileMenuButton, teamPage.teamCurrentNameDiv],
      maxDiffPixelRatio: 0.01,
    },
  );
});
