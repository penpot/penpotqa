import type { Page } from '@playwright/test';
import { TeamPage } from '@pages/dashboard/team-page';
import { openDashboardAfterApiLogin } from 'helpers/accounts/login-as-demo-account';

/**
 * Opens a team's dashboard on a user's page. Opens the user's own dashboard
 * first if their page is still blank (e.g. a `createDemoMember()` account), so
 * the cookie banner and onboarding popups are out of the way. Each call loads
 * the team afresh, so it shows the permissions as they are now.
 *
 * @param page - A page logged in as the user.
 * @param teamId - Id of the team.
 * @returns The user's TeamPage, on the team's dashboard.
 */
export async function openTeamDashboard(
  page: Page,
  teamId: string,
): Promise<TeamPage> {
  if (page.url() === 'about:blank') await openDashboardAfterApiLogin(page);
  const teamPage = new TeamPage(page);
  await teamPage.goToTeamDashboard(teamId);
  return teamPage;
}
