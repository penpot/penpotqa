import { type Page, test } from '@playwright/test';
import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { random } from './helpers/string-generator';
import { loginAsDemoAccount } from './helpers/accounts/login-as-demo-account';
import { createDemoUser } from './helpers/accounts/create-demo-user';
import { createDraftFile } from './helpers/files/create-draft-file';
import { importDraftFile } from 'helpers/files/import-draft-file';
import { registerNewAccount } from './helpers/accounts/register-new-account';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import { InvitationRole } from 'helpers/teams/invitation-role';

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
    await dashboardPage.isHeaderDisplayed('Personal Projects');
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
    await registerNewAccount(page, name, email, process.env.LOGIN_PWD!);
    await use(page);
  },
});

// Fresh demo account (WASM renderer) created and logged in via the API, landing on
// the dashboard. Use it for tests that just need a logged-in, isolated user.
export const demoAccountApiFixture = test.extend({
  page: async ({ page }, use) => {
    await loginAsDemoAccount(page, { renderer: 'wasm' });
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

type DemoWorkspaceFixtures = {
  dashboardPage: DashboardPage;
  mainPage: MainPage;
};

type DemoWorkspaceOptions = {
  penpotFile: string | undefined;
};

// Fresh demo account (WASM) with a blank Drafts file open in the editor, all set up
// via the API. Faster and more isolated than mainAccountFileTest.
// Set the `penpotFile` option to open that imported file instead of a blank one.
export const demoAccountFileTest = test.extend<
  DemoWorkspaceFixtures & DemoWorkspaceOptions
>({
  penpotFile: [undefined, { option: true }],
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  // `auto: true`: open the file even if the test doesn't destructure mainPage.
  mainPage: [
    async ({ page, penpotFile }, use) => {
      const request = page.context().request;
      await createDemoUser(request, { renderer: 'wasm' });
      const { teamId, fileId } = penpotFile
        ? await importDraftFile(request, penpotFile)
        : await createDraftFile(request);

      const mainPage = new MainPage(page);
      await page.goto(`/?screen=workspace&team-id=${teamId}&file-id=${fileId}`);
      await mainPage.acceptCookie();
      await mainPage.isMainPageLoaded();
      await use(mainPage);
    },
    { auto: true },
  ],
});

type DemoTeamWithInviteeFixtures = {
  dashboardPage: DashboardPage;
  mainPage: MainPage;
  team: { id: string; projectId: string };
  invitee: { page: Page; name: string };
};

type DemoTeamWithInviteeOptions = {
  inviteeRole: InvitationRole;
};

// Two demo accounts sharing a team, all set up via the API: the owner (`page`, named
// "QA Tester") with a blank file of the team open in the editor, and `invitee`
// (named "QA <role>") already a member, in its own browser context, on its dashboard.
// Set the `inviteeRole` option to change the invitee's role.
export const demoTeamWithInviteeTest = demoAccountApiFixture.extend<
  DemoTeamWithInviteeFixtures & DemoTeamWithInviteeOptions
>({
  inviteeRole: [InvitationRole.Editor, { option: true }],
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  team: async ({ page }, use) => {
    const request = page.context().request;
    await setDemoUserName(request, 'QA Tester');
    const { id, defaultProjectId } = await callPenpotApi(request, 'create-team', {
      name: createTeamName(),
    });
    await use({ id, projectId: defaultProjectId });
  },
  invitee: async ({ browser, page, team, inviteeRole }, use) => {
    const context = await browser.newContext();
    const inviteePage = await context.newPage();
    const name = `QA ${inviteeRole}`;
    const { email } = await loginAsDemoAccount(inviteePage, { renderer: 'wasm' });
    await setDemoUserName(context.request, name);
    const { invitations } = await callPenpotApi(
      page.context().request,
      'create-team-invitations',
      { teamId: team.id, role: inviteeRole.toLowerCase(), emails: [email] },
    );
    const token = invitations?.[0];
    if (!token) {
      throw new Error(
        `create-team-invitations returned no invitation token for ${email}: ` +
          JSON.stringify(invitations),
      );
    }
    await callPenpotApi(context.request, 'verify-token', { token });
    await use({ page: inviteePage, name });
    await context.close();
  },
  // `auto: true`: open the file even if the test doesn't destructure mainPage.
  // Depends on `invitee` so the workspace loads with it already in the team (e.g.
  // in the mentions list).
  mainPage: [
    async ({ page, team, invitee: _invitee }, use) => {
      const { id: fileId } = await callPenpotApi(
        page.context().request,
        'create-file',
        {
          name: 'New File 1',
          projectId: team.projectId,
        },
      );
      const mainPage = new MainPage(page);
      await page.goto(`/?screen=workspace&team-id=${team.id}&file-id=${fileId}`);
      await mainPage.isMainPageLoaded();
      await use(mainPage);
    },
    { auto: true },
  ],
});
