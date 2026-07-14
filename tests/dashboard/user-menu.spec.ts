import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { ProfilePage } from '@pages/profile-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let dashboardPage: DashboardPage;
let profilePage: ProfilePage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest(qase([1204], 'User menu - check menu items (links)'), async () => {
  await mainTest.step('Open account page and verify header', async () => {
    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
  });

  await mainTest.step('Open feedback page and verify button state', async () => {
    await profilePage.openGiveFeedbackPage();
    await profilePage.isSendFeedbackButtonDisabled();
  });

  await mainTest.step('Verify support links open the correct pages', async () => {
    const helpPage = await profilePage.openHelpCenterPage();
    await expect(helpPage).toHaveURL('https://help.penpot.app/');

    const learningPage = await profilePage.openLearningCenterPage();
    await expect(learningPage).toHaveURL('https://penpot.app/learning-center');

    const penpotHubPage = await profilePage.openPenpotHubPage();
    await expect(penpotHubPage).toHaveURL('https://penpot.app/penpothub');

    const gitRepoPage = await profilePage.openGithubRepoPage();
    await expect(gitRepoPage).toHaveURL('https://github.com/penpot/penpot');
  });

  await mainTest.step(
    'Verify community and legal links open the correct pages',
    async () => {
      const communityPage = await profilePage.openCommunityPage();
      await expect(communityPage).toHaveURL('https://community.penpot.app/');

      const changelogPage = await profilePage.openPenpotChangelogPage();
      await expect(changelogPage).toHaveURL(
        'https://github.com/penpot/penpot/blob/develop/CHANGES.md',
      );

      const termsPage = await profilePage.openTermsOfServicePage();
      await expect(termsPage).toHaveURL('https://penpot.app/terms');
    },
  );
});
