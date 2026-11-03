import { test } from '@playwright/test';
import { demoAccountApiFixture } from 'fixtures';
import { ProfilePage } from '@pages/profile-page';
import { ShortcutsPage } from '@pages/shortcuts-page';
import { loginAsDemoAccount } from 'helpers/accounts/login-as-demo-account';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';

type YourAccountFixtures = {
  profilePage: ProfilePage;
};

// Open Your Account > Profile section, as a fresh demo account named "QA Engineer"
// (a fixed name keeps the avatar screenshots stable)
export const profileTest = demoAccountApiFixture.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await setDemoUserName(page.context().request, 'QA Engineer');
    await page.reload();
    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');

    await use(profilePage);
  },
});

type PasswordFixtures = YourAccountFixtures & {
  currentPassword: string;
};

// Open Your Account > Password section, as a fresh demo account. Logs in directly
// (not through demoAccountApiFixture) to expose its password as `currentPassword`.
export const passwordTest = test.extend<PasswordFixtures>({
  currentPassword: async ({ page }, use) => {
    const { password } = await loginAsDemoAccount(page, { renderer: 'wasm' });
    await use(password);
  },
  profilePage: async ({ page, currentPassword: _currentPassword }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.openPasswordPageInAccount();

    await use(profilePage);
  },
});

// Open Your Account > Integrations section
// NOTE: This fixture involves creating a new Penpot account (via the API, as a demo account)
export const integrationsTest = demoAccountApiFixture.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openYourAccountIntegrationsPage();

    await use(profilePage);
  },
});

// Open Your Account > Give Feedback section
export const giveFeedbackTest = demoAccountApiFixture.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);

    await profilePage.openGiveFeedbackPage();
    await profilePage.isHeaderDisplayed('Your account');

    await use(profilePage);
  },
});

type ShortcutsFixtures = {
  shortcutsPage: ShortcutsPage;
};

// Open Your Account > Shortcuts section
// NOTE: Uses a fresh demo account (via the API), since these tests change the account's shortcuts
export const shortcutsTest = demoAccountApiFixture.extend<ShortcutsFixtures>({
  shortcutsPage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    const shortcutsPage = new ShortcutsPage(page);

    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await shortcutsPage.openFromYourAccount();

    await use(shortcutsPage);
  },
});
