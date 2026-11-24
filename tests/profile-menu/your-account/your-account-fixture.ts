import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { MainPage } from '@pages/workspace/main-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { YourAccountPage } from '@pages/your-account/your-account-page';
import {
  type Fixtures,
  type PlaywrightTestArgs,
  type PlaywrightTestOptions,
} from '@playwright/test';
import {
  demoAccountApiFixture,
  demoAccountFileTest,
  demoAccountMcpEnabledTest,
  registerTest,
} from 'fixtures';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';

type AccountPageFixtures = {
  yourAccountPage: YourAccountPage;
  loginPage: LoginPage;
  teamPage: TeamPage;
  workspacePage: WorkspacePage;
};

type DashboardPageFixtures = {
  dashboardPage: DashboardPage;
  mainPage: MainPage;
};

type PageFixtures<T extends object> = Fixtures<
  T,
  {},
  PlaywrightTestArgs & PlaywrightTestOptions
>;

// Page objects only, built on `page` without navigating. Fixtures are lazy: a
// test only builds the pages it destructures.
const accountPages: PageFixtures<AccountPageFixtures> = {
  yourAccountPage: async ({ page }, use) => use(new YourAccountPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  teamPage: async ({ page }, use) => use(new TeamPage(page)),
  workspacePage: async ({ page }, use) => use(new WorkspacePage(page)),
};

// Kept apart from `accountPages`: demoAccountFileTest already defines both, and
// its `mainPage` is an auto fixture that opens the file.
const dashboardPages: PageFixtures<DashboardPageFixtures> = {
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  mainPage: async ({ page }, use) => use(new MainPage(page)),
};

// Fresh demo account (via the API) on its dashboard, plus the page objects
export const yourAccountTest = demoAccountApiFixture.extend<
  AccountPageFixtures & DashboardPageFixtures
>({ ...accountPages, ...dashboardPages });

// Like yourAccountTest, with the MCP server already enabled (key generated,
// switch on) via the API
export const yourAccountMcpEnabledTest = demoAccountMcpEnabledTest.extend<
  AccountPageFixtures & DashboardPageFixtures
>({ ...accountPages, ...dashboardPages });

// Freshly registered account (can read its emails), plus the page objects
export const yourAccountRegisterTest = registerTest.extend<
  AccountPageFixtures & DashboardPageFixtures
>({ ...accountPages, ...dashboardPages });

// Demo account with a file open in the editor, plus the page objects
export const yourAccountFileTest =
  demoAccountFileTest.extend<AccountPageFixtures>(accountPages);

// Open Your Account > Profile section, as a fresh demo account named "QA Engineer"
// (a fixed name keeps the avatar screenshots stable)
export const profileTest = yourAccountTest.extend({
  yourAccountPage: async ({ page, yourAccountPage }, use) => {
    await setDemoUserName(page.context().request, 'QA Engineer');
    await page.reload();
    await yourAccountPage.open();

    await use(yourAccountPage);
  },
});

// Open Your Account > Password section, as a fresh demo account whose password is
// exposed as `currentPassword`.
export const passwordTest = yourAccountTest.extend<{ currentPassword: string }>({
  currentPassword: async ({ demoAccount }, use) => {
    await use(demoAccount.password);
  },
  yourAccountPage: async ({ yourAccountPage }, use) => {
    await yourAccountPage.open();
    await yourAccountPage.openSection('Password');
    await yourAccountPage.password.checkIsVisible();

    await use(yourAccountPage);
  },
});

// Open Your Account > Shortcuts section
// NOTE: Uses a fresh demo account (via the API), since these tests change the account's shortcuts
export const shortcutsTest = yourAccountTest.extend({
  yourAccountPage: async ({ yourAccountPage }, use) => {
    await yourAccountPage.open();
    await yourAccountPage.openSection('Shortcuts');
    await yourAccountPage.shortcuts.checkIsLoaded();

    await use(yourAccountPage);
  },
});

// Open Your Account > Settings section (language, UI theme, WebGL rendering)
export const settingsTest = yourAccountTest.extend({
  yourAccountPage: async ({ yourAccountPage }, use) => {
    await yourAccountPage.goto('Settings');

    await use(yourAccountPage);
  },
});

// Open Your Account > Integrations section
// NOTE: This fixture involves creating a new Penpot account (via the API, as a demo account)
export const integrationsTest = yourAccountTest.extend({
  yourAccountPage: async ({ yourAccountPage }, use) => {
    await yourAccountPage.open();
    await yourAccountPage.openSection('Integrations');

    await use(yourAccountPage);
  },
});
