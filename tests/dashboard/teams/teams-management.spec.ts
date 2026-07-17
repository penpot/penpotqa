import { TeamPage } from '@pages/dashboard/team-page';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const team = createTeamName();

let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
});

mainTest(qase([1163], 'Team.Switch between teams'), async () => {
  const team1 = createTeamName();
  const team2 = createTeamName();

  await mainTest.step('Create two teams and switch between them', async () => {
    await teamPage.createTeam(team1);
    await teamPage.isTeamSelected(team1);
    await teamPage.createTeam(team2);
    await teamPage.isTeamSelected(team2);
    await teamPage.switchTeam(team1);
    await teamPage.switchTeam(team2);
  });

  await mainTest.step('Delete both teams', async () => {
    await teamPage.deleteTeams([team1, team2]);
  });
});
