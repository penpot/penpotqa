import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';

/**
 * Reaches a team via the org switcher's "Other teams" entry, then the
 * normal team switcher — needed once the account has any org membership,
 * since a bare team-id URL for an org-less team no longer resolves there
 * (redirects to Personal Projects instead), and the org switcher's own
 * list doesn't include org-less teams either.
 */
export async function goToOtherTeam(
  orgPage: OrganizationPage,
  teamPage: TeamPage,
  teamName: string,
) {
  await orgPage.goto();
  await orgPage.openOrgSwitcher();
  await orgPage.otherTeamsDropdownItem.click();
  await teamPage.switchTeam(teamName);
}
