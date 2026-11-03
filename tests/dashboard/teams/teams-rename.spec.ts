import { TeamPage } from '@pages/dashboard/team-page';
import { demoAccountApiFixture, demoTeamWithInviteeTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountApiFixture(qase([1205], 'Rename a team via owner'), async ({ page }) => {
  const teamPage = new TeamPage(page);
  const team = createTeamName();
  const teamNew = createTeamName();

  await demoAccountApiFixture.step(
    'Create and rename the team as owner',
    async () => {
      await teamPage.createTeam(team);
      await teamPage.renameTeam(teamNew);
      await teamPage.isTeamSelected(teamNew);
    },
  );
});

// Default inviteeRole is Editor.
demoTeamWithInviteeTest(
  qase([1207], 'Team. Unable to rename team (as editor)'),
  async ({ team, invitee }) => {
    const inviteeTeamPage = new TeamPage(invitee.page);

    await demoTeamWithInviteeTest.step(
      'Open the team options menu as editor',
      async () => {
        await inviteeTeamPage.goToTeamDashboard(team.id);
        await inviteeTeamPage.isTeamSelected(team.name);
        await inviteeTeamPage.openTeamOptionsMenu();
      },
    );

    await demoTeamWithInviteeTest.step(
      'Verify rename option is not visible for editor',
      async () => {
        await inviteeTeamPage.assertRenameItemNotVisible();
      },
    );
  },
);
