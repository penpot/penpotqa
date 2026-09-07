import { test } from '@playwright/test';
import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { RegisterPage } from '@pages/register-page';
import { random } from './helpers/string-generator';
import { waitMessage } from './helpers/gmail';
import { createDemoUser } from './helpers/demo-user';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { createTeamName } from 'helpers/teams/create-team-name';

type RegisterTestFixtures = {
  name: string;
  email: string;
};

type WorkspaceFixtures = {
  teamName: string;
  teamPage: TeamPage;
  dashboardPage: DashboardPage;
  mainPage: MainPage;
};

// Fixture for logging in with an existing account. Use it for tests that don't
// need to create a new user or go through the registration flow.
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

// Fixture for creating a new user via the registration process.
// Use it for tests that need to create a new user and go through the registration flow.
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
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const registerPage = new RegisterPage(page);

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD!);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite!.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await use(page);
  },
});

// Fixture for demo account, created directly via the API. Faster than
// demoAccountFixture (no UI registration/onboarding flow) — use it for tests
// that just need to be logged in as a fresh demo account and don't care how
// it was created.
export const demoAccountApiFixture = test.extend({
  page: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);

    await createDemoUser(page.context().request);

    await page.goto('/');
    await dashboardPage.isDashboardOpenedAfterLogin();
    await dashboardPage.acceptCookie();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.skipWhatNewsPopUp();
    await dashboardPage.skipPluginsPopUp();
    await use(page);
  },
});

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
