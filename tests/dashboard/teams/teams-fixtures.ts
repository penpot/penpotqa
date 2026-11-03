import type { Page } from '@playwright/test';
import { TeamPage } from '@pages/dashboard/team-page';
import { demoAccountApiFixture, registerTest } from 'fixtures';
import { createDemoUserSession } from 'helpers/accounts/create-demo-user-session';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import { addTeamMember } from 'helpers/teams/add-team-member';
import { createTeam } from 'helpers/teams/create-team';
import { createTeamName } from 'helpers/teams/create-team-name';
import { InvitationRole } from 'helpers/teams/invitation-role';

type TeamMember = { page: Page; name: string; email: string };

type DemoTeamWithMembersFixtures = {
  team: { id: string; name: string };
  members: TeamMember[];
  teamPage: TeamPage;
};

type DemoTeamWithMembersOptions = {
  memberRoles: InvitationRole[];
};

// A demo-account team with members, all set up via the API: the owner (`page`,
// named "QA Tester") and one demo account per `memberRoles` entry, each in its own
// browser context. Every page ends up on the team's dashboard. Members are named
// "QA <role> <n>" (1-based position), so no name is a prefix of another.
export const demoTeamWithMembersTest = demoAccountApiFixture.extend<
  DemoTeamWithMembersFixtures & DemoTeamWithMembersOptions
>({
  memberRoles: [[InvitationRole.Editor], { option: true }],
  team: async ({ page }, use) => {
    const request = page.context().request;
    await setDemoUserName(request, 'QA Tester');
    const name = createTeamName();
    const { teamId } = await createTeam(request, name);
    await use({ id: teamId, name });
  },
  members: async ({ browser, page, team, memberRoles }, use) => {
    const sessions = [];
    const members: TeamMember[] = [];
    for (const [index, role] of memberRoles.entries()) {
      const session = await createDemoUserSession(browser);
      sessions.push(session);
      const request = session.page.context().request;
      const name = `QA ${role} ${index + 1}`;
      await setDemoUserName(request, name);
      await addTeamMember(
        page.context().request,
        { request, email: session.email },
        team.id,
        role,
      );
      const memberTeamPage = new TeamPage(session.page);
      await memberTeamPage.goToTeamDashboard(team.id);
      await memberTeamPage.isTeamSelected(team.name);
      members.push({ page: session.page, name, email: session.email });
    }
    await use(members);
    for (const session of sessions) await session.close();
  },
  // `auto: true`: land the owner on the team dashboard even if the test doesn't
  // destructure teamPage. Depends on `members` so they're already in the team.
  teamPage: [
    async ({ page, team, members: _members }, use) => {
      const teamPage = new TeamPage(page);
      await teamPage.goToTeamDashboard(team.id);
      await teamPage.isTeamSelected(team.name);
      await use(teamPage);
    },
    { auto: true },
  ],
});

type RegisterAndDemoUserFixtures = {
  demoUser: TeamMember;
};

// A freshly registered user (`page`, with a real Gmail inbox, see `registerTest`)
// plus `demoUser`, a demo account named "QA Engineer" in its own browser context,
// on its dashboard. For flows where only one side needs to read email, e.g. the
// owner reading request-access emails, or an invitee accepting a team invite.
export const registerAndDemoUserTest =
  registerTest.extend<RegisterAndDemoUserFixtures>({
    demoUser: async ({ browser }, use) => {
      const session = await createDemoUserSession(browser);
      const name = 'QA Engineer';
      await setDemoUserName(session.page.context().request, name);
      await use({ page: session.page, name, email: session.email });
      await session.close();
    },
  });
