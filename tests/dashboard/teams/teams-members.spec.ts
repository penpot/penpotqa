import { TeamPage } from '@pages/dashboard/team-page';
import { demoTeamWithMembersTest } from './teams-fixtures';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { qase } from 'playwright-qase-reporter/playwright';

const transferOwnershipCases = [
  { role: InvitationRole.Admin, qaseId: 1188 },
  { role: InvitationRole.Editor, qaseId: 1189 },
];

demoTeamWithMembersTest.describe('Members - As Owner - Change roles', () => {
  for (const { role, qaseId } of transferOwnershipCases) {
    demoTeamWithMembersTest.describe(() => {
      demoTeamWithMembersTest.use({ memberRoles: [role] });

      demoTeamWithMembersTest(
        qase(
          [qaseId],
          `Team. Members - change role via owner (transfer ownership to ${role.toLowerCase()})`,
        ),
        async ({ teamPage, team, members: [member] }) => {
          await demoTeamWithMembersTest.step(
            `Transfer ownership to the ${role.toLowerCase()} and verify`,
            async () => {
              await teamPage.openMembersPageViaOptionsMenu();
              await teamPage.selectMemberRoleInPopUp(member.name, 'Owner');
              await teamPage.clickOnTransferOwnershipButton();
              await teamPage.isMultipleMemberRecordDisplayed(
                member.name,
                member.email,
                'Owner',
              );
            },
          );

          await demoTeamWithMembersTest.step(
            'New owner deletes the team',
            async () => {
              const memberTeamPage = new TeamPage(member.page);
              await member.page.reload();
              await memberTeamPage.deleteTeam(team.name);
              await memberTeamPage.isTeamDeleted(team.name);
            },
          );
        },
      );
    });
  }
});

demoTeamWithMembersTest.describe(() => {
  demoTeamWithMembersTest.use({ memberRoles: [InvitationRole.Admin] });

  demoTeamWithMembersTest(
    qase([1196], 'Team. Members - leave team (as owner)'),
    async ({ teamPage, team, members: [admin] }) => {
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        admin.name,
        admin.email,
        'Admin',
      );
      await teamPage.leaveTeam(team.name, 'Owner', admin.name);
    },
  );
});
