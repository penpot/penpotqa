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

// TODO: Remove these JSDoc type annotations once this file is migrated to TypeScript.

/** These annotations are necessary to provide type information for TypeScript test files
 * that import registerTest, allowing them to use fixtures (name, email, page) without
 * TypeScript implicit 'any' errors.
 **/

/**
 * @typedef {Object} IntegrationsTestFixtures
 * @property {ProfilePage} profilePage - Profile page object for the test
 */

/**
 * @typedef {import('@playwright/test').PlaywrightTestArgs &
 *   import('@playwright/test').PlaywrightTestOptions &
 *   IntegrationsTestFixtures} IntegrationsTestArgs
 */

/**
 * @typedef {import('@playwright/test').PlaywrightWorkerArgs &
 *   import('@playwright/test').PlaywrightWorkerOptions} IntegrationsWorkerArgs
 */

/**
 * @type {import('@playwright/test').TestType<IntegrationsTestArgs, IntegrationsWorkerArgs>}
 */

// Open Your Account > Integrations section
export const integrationsTest = mainTest.extend({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountPage();
    await profilePage.openIntegrationsPage();
    await profilePage.isHeaderDisplayed('Your account');

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

module.exports = { profileTest, passwordTest, giveFeedbackTest, integrationsTest };
