import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ProfilePage } from '@pages/profile-page';
import { MainPage } from '@pages/workspace/main-page';
import { UiTheme } from '@pages/your-account/settings-page';
import { expect } from '@playwright/test';
import { settingsTest } from '@tests/profile-menu/your-account/your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

let dashboardPage: DashboardPage;
let mainPage: MainPage;
let profilePage: ProfilePage;
let teamPage: TeamPage;

settingsTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  profilePage = new ProfilePage(page);
  teamPage = new TeamPage(page);
});

settingsTest(
  qase([1677], 'Check Light UI theme in Projects page'),
  async ({ settingsPage }) => {
    await settingsTest.step('Select the Light UI theme in Settings', async () => {
      await settingsPage.selectUiTheme(UiTheme.Light);
      await profilePage.backToDashboardFromAccount();
    });

    await settingsTest.step(
      'Create a file and go back to the Projects page',
      async () => {
        await dashboardPage.hideLibrariesAndTemplatesCarrousel();
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.isMainPageLoaded();
        await mainPage.backToDashboardFromFileEditor('Personal Projects');
      },
    );

    await settingsTest.step(
      'Verify the Projects page is shown with the Light theme',
      async () => {
        await expect(dashboardPage.dashboardSection).toHaveScreenshot(
          'dashboard-image.png',
          {
            mask: [profilePage.profileMenuButton, teamPage.teamCurrentNameDiv],
            maxDiffPixelRatio: 0.01,
          },
        );
      },
    );
  },
);
