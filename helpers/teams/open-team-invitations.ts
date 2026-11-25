import type { Page } from '@playwright/test';
import type { TeamPage } from '@pages/dashboard/team-page';
import { openTeamDashboard } from 'helpers/teams/open-team-dashboard';

/**
 * Opens a team's Invitations page on a user's page, from the team options
 * menu (see `openTeamDashboard()`).
 *
 * @param page - A page logged in as the user.
 * @param teamId - Id of the team.
 * @returns The user's TeamPage, on the team's Invitations page.
 */
export async function openTeamInvitations(
  page: Page,
  teamId: string,
): Promise<TeamPage> {
  const teamPage = await openTeamDashboard(page, teamId);
  await teamPage.openInvitationsPageViaOptionsMenu();
  return teamPage;
}
