const { mainTest } = require('../../fixtures');
const { ProfilePage } = require('../../pages/profile-page');

// Open Your Account > Profile section
const profileTest = mainTest.extend({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');

    await use(profilePage);
  },
});

// Open Your Account > Password section
const passwordTest = mainTest.extend({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.openPasswordPageInAccount();

    await use(profilePage);
  },
});

// Open Your Account > Give Feedback section
const giveFeedbackTest = mainTest.extend({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openGiveFeedbackPage();
    await profilePage.isHeaderDisplayed('Your account');

    await use(profilePage);
  },
});

module.exports = { profileTest, passwordTest, giveFeedbackTest };
