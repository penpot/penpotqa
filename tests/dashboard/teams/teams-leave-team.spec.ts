import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { expect } from '@playwright/test';
import { setInvitedUserOnboarding } from 'helpers/accounts/set-invited-user-onboarding';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoTeamWithMembersTest } from './teams-fixtures';

const roles = [
  { role: InvitationRole.Admin, qaseId: 1197 },
  { role: InvitationRole.Editor, qaseId: 1198 },
];

for (const { role, qaseId } of roles) {
  demoTeamWithMembersTest.describe(() => {
    demoTeamWithMembersTest.use({ memberRoles: [role] });

    demoTeamWithMembersTest(
      qase(
        [qaseId],
        `Team Members: ${role} can leave team and return to onboarding (${role.toLowerCase()})`,
      ),
      async ({ team, members: [member] }) => {
        const memberTeamPage = new TeamPage(member.page);
        const memberDashboardPage = new DashboardPage(member.page);

        await demoTeamWithMembersTest.step(
          'Member has the onboarding state of an invited user',
          async () => {
            await setInvitedUserOnboarding(member.page.context().request);
            await member.page.reload();
            await memberTeamPage.isTeamSelected(team.name);
          },
        );

        await demoTeamWithMembersTest.step(`${role} leaves the team`, async () => {
          await memberTeamPage.openMembersPageViaOptionsMenu();
          await memberTeamPage.leaveTeam(team.name);
        });

        await demoTeamWithMembersTest.step('Confirm onboarding flow', async () => {
          await expect(
            memberDashboardPage.onboardingContinueWithoutTeamBtn,
          ).toBeVisible();
          await memberDashboardPage.clickOnOnboardingContinueWithoutTeamButton();
        });
      },
    );
  });
}
