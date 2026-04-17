import { mainTest } from '../../fixtures';
import { ProfilePage } from '@pages/profile-page';

type YourAccountFixtures = {
  profilePage: ProfilePage;
};

// Open Your Account > Profile section
export const profileTest = mainTest.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');

    await use(profilePage);
  },
});

// Open Your Account > Password section
export const passwordTest = mainTest.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.openPasswordPageInAccount();

    await use(profilePage);
  },
});

// Open Your Account > Integrations section
export const integrationsTest = mainTest.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountPage();
    await profilePage.openIntegrationsPage();
    await profilePage.isHeaderDisplayed('Your account');

    await use(profilePage);
  },
});

// Open Your Account > Give Feedback section
export const giveFeedbackTest = mainTest.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openGiveFeedbackPage();
    await profilePage.isHeaderDisplayed('Your account');

    await use(profilePage);
  },
});
