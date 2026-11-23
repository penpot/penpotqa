import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi, callPenpotApiNoContent } from 'helpers/api/penpot-api';
import { createOrgTeam } from 'helpers/organizations/create-org-team';
import { addTeamMember } from 'helpers/teams/add-team-member';
import { createTeamName } from 'helpers/teams/create-team-name';
import { InvitationRole } from 'helpers/teams/invitation-role';

/**
 * Makes users members of an organization via the API, with no email, so it works
 * for demo accounts: the org owner creates a temporary team in the organization,
 * the users join it with an invitation token, and then they are removed and the
 * team is deleted. Leaving a team keeps the organization membership.
 * @param ownerRequest Session of the organization's owner.
 * @param organizationId Id of the organization to join.
 * @param members Sessions (and emails) of the users to add.
 */
export async function joinOrganization(
  ownerRequest: APIRequestContext,
  organizationId: string,
  members: { request: APIRequestContext; email: string }[],
) {
  const teamId = await createOrgTeam(ownerRequest, organizationId, createTeamName());
  for (const member of members) {
    await addTeamMember(ownerRequest, member, teamId, InvitationRole.Editor);
  }
  for (const member of members) {
    const { id } = await callPenpotApi<{ id: string }>(
      member.request,
      'get-profile',
    );
    await callPenpotApiNoContent(ownerRequest, 'delete-team-member', {
      teamId,
      memberId: id,
    });
  }
  await callPenpotApiNoContent(ownerRequest, 'delete-team', { id: teamId });
}
