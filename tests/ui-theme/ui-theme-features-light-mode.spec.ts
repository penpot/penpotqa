import { registerTest } from '../../fixtures';
import { expect, Page } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { MainPage } from '../../pages/workspace/main-page';
import { random } from '../../helpers/string-generator';
import { ProfilePage } from '../../pages/profile-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TeamPage } from '../../pages/dashboard/team-page';

const teamName: string = random().concat('autotest');

registerTest(
  qase(1677, 'Check Light UI them in Projects page'),
  async ({ page }: { page: Page }) => {
    let teamPage: TeamPage = new TeamPage(page);
    let profilePage: ProfilePage = new ProfilePage(page);
    let dashboardPage: DashboardPage = new DashboardPage(page);
    let mainPage: MainPage = new MainPage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await profilePage.openYourAccountPage();
    await profilePage.openSettingsTab();
    await profilePage.selectLightTheme();
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
  },
);
