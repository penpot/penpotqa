import { test } from '@playwright/test';
import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { random } from './helpers/string-generator';
import { loginAsDemoAccount } from './helpers/accounts/login-as-demo-account';
import { registerNewAccount } from './helpers/accounts/register-new-account';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { createTeamName } from 'helpers/teams/create-team-name';

// ---------------------------------------------------------------------------
// mainTest — logs in with the existing shared `LOGIN_EMAIL` account. Use it
// for tests that don't need a new user or the registration flow.
// ---------------------------------------------------------------------------

export const mainTest = test.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL!);
    await loginPage.enterPwd(process.env.LOGIN_PWD!);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.skipWhatNewsPopUp();
    await dashboardPage.skipPluginsPopUp();
    await use(page);
  },
});

type WorkspaceFixtures = {
  teamName: string;
  teamPage: TeamPage;
  dashboardPage: DashboardPage;
  mainPage: MainPage;
};

// Fixture for tests that need an isolated team with a blank file already
// open in the editor. Use it for tests that draw on the canvas rather than
// just the dashboard.
export const mainAccountFileTest = mainTest.extend<WorkspaceFixtures>({
  teamName: async ({}, use) => {
    await use(createTeamName());
  },
  teamPage: async ({ page }, use) => {
    await use(new TeamPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  // `auto: true` makes this run for every mainAccountFileTest-based test, whether or
  // not it destructures mainPage/teamPage/dashboardPage. Fixtures are
  // otherwise lazy, so a test that only touches another page object (e.g.
  // historyPage) would silently skip team/file creation and run against an
  // empty dashboard instead.
  mainPage: [
    async ({ page, teamPage, dashboardPage, teamName }, use) => {
      const mainPage = new MainPage(page);
      await teamPage.createTeam(teamName);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
      await use(mainPage);
    },
    { auto: true },
  ],
});

// ---------------------------------------------------------------------------
// registerTest — creates a brand-new account via the UI registration flow.
// Use it for tests that need to create a new user and go through that flow.
// ---------------------------------------------------------------------------

type RegisterTestFixtures = {
  name: string;
  email: string;
};

export const registerTest = test.extend<RegisterTestFixtures>({
  name: async ({}, use) => {
    const name = random().concat('autotest');
    await use(name);
  },
  email: async ({ name }, use) => {
    const email = `${process.env.GMAIL_NAME}+${name}${process.env.GMAIL_DOMAIN}`;
    await use(email);
  },
  page: async ({ page, name, email }, use) => {
    await registerNewAccount(page, name, email, process.env.LOGIN_PWD!);
    await use(page);
  },
});

// ---------------------------------------------------------------------------
// demoAccountApiFixture — fresh demo account, created directly via the API.
// Faster than registerTest (no UI registration/onboarding flow) — use it for
// tests that just need to be logged in as a fresh demo account and don't
// care how it was created.
// ---------------------------------------------------------------------------

type DemoAccountFixtures = {
  demoAccountPassword: string;
};

export const demoAccountApiFixture = test.extend<DemoAccountFixtures>({
  page: async ({ page }, use) => {
    const { password } = await loginAsDemoAccount(page);
    // Stashed on the page so `demoAccountPassword` (below) can read it
    // without triggering a second login — fixtures can't otherwise return
    // more than one value while still overriding the built-in `page`.
    (page as unknown as { __demoAccountPassword?: string }).__demoAccountPassword =
      password;
    await use(page);
  },
  // Only needed by tests that need the account's real current password
  // (e.g. a change-password flow).
  demoAccountPassword: async ({ page }, use) => {
    await use(
      (page as unknown as { __demoAccountPassword?: string }).__demoAccountPassword!,
    );
  },
});

type FileWorkspaceFixtures = {
  dashboardPage: DashboardPage;
  mainPage: MainPage;
};

// Fixture for tests that need an isolated blank file already open in the
// editor but don't care about teams. Uses a fresh demo account for isolation
// instead of creating a team under the shared account. Use it for tests that
// draw on the canvas rather than just the dashboard.
export const demoAccountFileTest =
  demoAccountApiFixture.extend<FileWorkspaceFixtures>({
    dashboardPage: async ({ page }, use) => {
      await use(new DashboardPage(page));
    },
    // `auto: true` makes this run for every demoAccountFileTest-based test, whether or
    // not it destructures mainPage/dashboardPage. Fixtures are otherwise lazy,
    // so a test that only touches another page object (e.g. historyPage) would
    // silently skip file creation and run against an empty dashboard instead.
    mainPage: [
      async ({ page, dashboardPage }, use) => {
        const mainPage = new MainPage(page);
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.isMainPageLoaded();
        await use(mainPage);
      },
      { auto: true },
    ],
  });

// Fixture for tests that need a real, named team (not just isolation) with a
// blank file already open in the editor — e.g. inviting a second user to it —
// but don't need to be on the shared main account. Uses a fresh demo account.
// Prefer mainAccountFileTest instead if the test hits demo-account-specific
// UI timing/behavior differences (a few have turned up — see README).
export const demoAccountTeamFileTest =
  demoAccountApiFixture.extend<WorkspaceFixtures>({
    teamName: async ({}, use) => {
      await use(createTeamName());
    },
    teamPage: async ({ page }, use) => {
      await use(new TeamPage(page));
    },
    dashboardPage: async ({ page }, use) => {
      await use(new DashboardPage(page));
    },
    mainPage: [
      async ({ page, teamPage, dashboardPage, teamName }, use) => {
        const mainPage = new MainPage(page);
        await teamPage.createTeam(teamName);
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.isMainPageLoaded();
        await use(mainPage);
      },
      { auto: true },
    ],
  });
