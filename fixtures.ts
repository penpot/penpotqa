import { type Page, test } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { random } from './helpers/string-generator';
import { openDashboardAfterApiLogin } from './helpers/accounts/login-as-demo-account';
import { createDemoUser } from './helpers/accounts/create-demo-user';
import { createFile } from './helpers/files/create-file';
import { openFileInWorkspace } from 'helpers/files/open-file-in-workspace';
import { importDraftFile } from 'helpers/files/import-draft-file';
import { registerNewAccount } from './helpers/accounts/register-new-account';
import { MainPage } from '@pages/workspace/main-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createTeam } from 'helpers/teams/create-team';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import { createDemoUserSession } from 'helpers/accounts/create-demo-user-session';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { addTeamMember } from 'helpers/teams/add-team-member';

type RegisterTestFixtures = {
  name: string;
  email: string;
};

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

type DemoAccountFixtures = {
  demoAccount: { email: string; password: string };
};

// Fresh demo account (WASM renderer) created and logged in via the API, landing on
// the dashboard. Use it for tests that just need a logged-in, isolated user.
// `demoAccount` holds its credentials, for tests that log back in through the UI.
export const demoAccountApiFixture = test.extend<DemoAccountFixtures>({
  // Logs in on the context (not `page`), so `page` can depend on it.
  demoAccount: async ({ context }, use) => {
    await use(await createDemoUser(context.request, { renderer: 'wasm' }));
  },
  page: async ({ page, demoAccount: _demoAccount }, use) => {
    await openDashboardAfterApiLogin(page);
    await use(page);
  },
});

type DemoWorkspaceFixtures = {
  dashboardPage: DashboardPage;
  mainPage: MainPage;
  secondUserPage: Page;
};

type DemoWorkspaceOptions = {
  penpotFile: string | undefined;
  inNewTeam: boolean;
};

// Fresh demo account (WASM) with a blank Drafts file open in the editor, all set up
// via the API.
// Set the `penpotFile` option to open that imported file instead of a blank one.
// Set `inNewTeam` to put the file in a new team instead of the personal one, which
// hides some UI (e.g. the workspace header's Share button).
// `secondUserPage` is another demo account in its own browser context, on its
// dashboard (e.g. to open a share link as another user); only created when used.
export const demoAccountFileTest = test.extend<
  DemoWorkspaceFixtures & DemoWorkspaceOptions
>({
  penpotFile: [undefined, { option: true }],
  inNewTeam: [false, { option: true }],
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  secondUserPage: async ({ browser }, use) => {
    const session = await createDemoUserSession(browser);
    await use(session.page);
    await session.close();
  },
  // `auto: true`: open the file even if the test doesn't destructure mainPage.
  mainPage: [
    async ({ page, penpotFile, inNewTeam }, use) => {
      const request = page.context().request;
      await createDemoUser(request, { renderer: 'wasm' });
      const project = inNewTeam ? await createTeam(request) : undefined;
      const { teamId, fileId } = penpotFile
        ? await importDraftFile(request, penpotFile, { project })
        : await createFile(request, { project });
      await use(await openFileInWorkspace(page, teamId, fileId));
    },
    { auto: true },
  ],
});

type DemoTeamWithInviteeFixtures = {
  dashboardPage: DashboardPage;
  mainPage: MainPage;
  team: { id: string; name: string; projectId: string };
  invitee: { page: Page; name: string; workspacePage: WorkspacePage };
};

type DemoTeamWithInviteeOptions = {
  inviteeRole: InvitationRole;
};

// Two demo accounts sharing a team, all set up via the API: the owner (`page`, named
// "QA Tester") with a blank file of the team open in the editor, and `invitee`
// (named "QA <role>") already a member, in its own browser context, on its dashboard;
// its `workspacePage` drives the workspace once it opens a file there.
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
    const name = createTeamName();
    const { teamId, projectId } = await createTeam(request, name);
    await use({ id: teamId, name, projectId });
  },
  invitee: async ({ browser, page, team, inviteeRole }, use) => {
    const session = await createDemoUserSession(browser);
    const request = session.page.context().request;
    const name = `QA ${inviteeRole}`;
    await setDemoUserName(request, name);
    await addTeamMember(
      page.context().request,
      { request, email: session.email },
      team.id,
      inviteeRole,
    );
    await use({
      page: session.page,
      name,
      workspacePage: new WorkspacePage(session.page),
    });
    await session.close();
  },
  // `auto: true`: open the file even if the test doesn't destructure mainPage.
  // Depends on `invitee` so the workspace loads with it already in the team (e.g.
  // in the mentions list).
  mainPage: [
    async ({ page, team, invitee: _invitee }, use) => {
      const { fileId } = await createFile(page.context().request, {
        project: { teamId: team.id, projectId: team.projectId },
      });
      await use(await openFileInWorkspace(page, team.id, fileId));
    },
    { auto: true },
  ],
});
