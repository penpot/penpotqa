import { UiTheme } from '@pages/your-account/settings-section-component';
import { expect } from '@playwright/test';
import { settingsTest } from '@tests/profile-menu/your-account/your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

settingsTest(
  qase([1677], 'Check Light UI theme in Projects page'),
  async ({ yourAccountPage, dashboardPage, mainPage, teamPage }) => {
    await settingsTest.step('Select the Light UI theme in Settings', async () => {
      await yourAccountPage.settings.selectUiTheme(UiTheme.Light);
      await yourAccountPage.backToDashboard();
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
            mask: [
              yourAccountPage.profileMenu.menuButton,
              teamPage.teamCurrentNameDiv,
            ],
          },
        );
      },
    );
  },
);
