const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');

// TO REMOVE
mainTest.skip(true, 'Temporarily disabled due to unrelated to new render');

let dashboardPage, mainPage, profilePage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  profilePage = new ProfilePage(page);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest(qase(1204, 'User menu - check menu items (links)'), async () => {
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');

  await profilePage.openGiveFeedbackPage();
  await profilePage.isSendFeedbackButtonDisabled();

  const helpPage = await profilePage.openHelpCenterPage();
  await expect(helpPage).toHaveURL('https://help.penpot.app/');

  const learningPage = await profilePage.openLearningCenterPage();
  await expect(learningPage).toHaveURL('https://penpot.app/learning-center');

  const penpotHubPage = await profilePage.openPenpotHubPage();
  await expect(penpotHubPage).toHaveURL('https://penpot.app/penpothub');

  const gitRepoPage = await profilePage.openGithubRepoPage();
  await expect(gitRepoPage).toHaveURL('https://github.com/penpot/penpot');

  const communityPage = await profilePage.openCommunityPage();
  await expect(communityPage).toHaveURL('https://community.penpot.app/');

  const changelogPage = await profilePage.openPenpotChangelogPage();
  await expect(changelogPage).toHaveURL(
    'https://github.com/penpot/penpot/blob/develop/CHANGES.md',
  );

  const termsPage = await profilePage.openTermsOfServicePage();
  await expect(termsPage).toHaveURL('https://penpot.app/terms');
});
