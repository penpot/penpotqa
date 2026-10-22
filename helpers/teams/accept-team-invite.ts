import { type Page } from '@playwright/test';
import { getRegisterMessage, waitSecondMessage } from 'helpers/gmail';
import { TeamPage } from '@pages/dashboard/team-page';

/** Accepts a team invite from the invitee's inbox, then opens the team dashboard
 * by id (the team switchers can lag behind a new invite). */
export async function acceptTeamInvite(
  ownerPage: Page,
  invitee: { page: Page; email: string },
  teamId: string,
) {
  // 2nd message = the invite; reading earlier returns the registration email.
  await waitSecondMessage(ownerPage, invitee.email, 40);
  const invite = await getRegisterMessage(invitee.email);
  await invitee.page.goto(invite!.inviteUrl);
  // Let the invite link's redirect settle, or a stray "no access" dialog can
  // show up over the team dashboard.
  await invitee.page.waitForLoadState('networkidle');
  await new TeamPage(invitee.page).goToTeamDashboard(teamId);
}
