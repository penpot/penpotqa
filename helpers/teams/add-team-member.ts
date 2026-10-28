import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { InvitationRole } from './invitation-role';

/** Adds a user to a team via the API, no email involved: the owner invites them
 * and the member redeems the invitation token from their own session. Works for
 * demo accounts, whose inbox can't be read. */
export async function addTeamMember(
  ownerRequest: APIRequestContext,
  member: { request: APIRequestContext; email: string },
  teamId: string,
  role: InvitationRole,
): Promise<void> {
  const { invitations } = await callPenpotApi(
    ownerRequest,
    'create-team-invitations',
    { teamId, role: role.toLowerCase(), emails: [member.email] },
  );
  const token = invitations?.[0];
  if (!token) {
    throw new Error(
      `create-team-invitations returned no invitation token for ${member.email}: ` +
        JSON.stringify(invitations),
    );
  }
  await callPenpotApi(member.request, 'verify-token', { token });
}
