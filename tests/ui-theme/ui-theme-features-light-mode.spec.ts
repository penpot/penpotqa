import { demoAccountApiFixture } from '../../fixtures';
import { expect, Page } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { MainPage } from '../../pages/workspace/main-page';
import { ProfilePage } from '../../pages/profile-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TeamPage } from '../../pages/dashboard/team-page';
import { SettingsPage, UiTheme } from '@pages/your-account/settings-page';

demoAccountApiFixture(
  qase(1677, 'Check Light UI theme in Projects page'),
  async ({ page }: { page: Page }) => {
    let teamPage: TeamPage = new TeamPage(page);
    let profilePage: ProfilePage = new ProfilePage(page);
    let dashboardPage: DashboardPage = new DashboardPage(page);
    let mainPage: MainPage = new MainPage(page);
    const settingsPage = new SettingsPage(page);

    await profilePage.openYourAccountPage();
    await settingsPage.open();
    await settingsPage.selectUiTheme(UiTheme.Light);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.backToDashboardFromFileEditor('Personal Projects');

    await expect(dashboardPage.dashboardSection).toHaveScreenshot(
      'dashboard-image.png',
      {
        mask: [profilePage.profileMenuButton, teamPage.teamCurrentNameDiv],
        maxDiffPixelRatio: 0.01,
      },
    );
  },
);
