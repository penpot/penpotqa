import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { InvitationRole } from './invitation-role';

/** Invites emails to a team via the API, as the owner/admin whose session
 * `request` holds. Returns the invitation tokens (none for anyone added directly
 * as an existing member). */
export async function createTeamInvitations(
  request: APIRequestContext,
  teamId: string,
  emails: string[],
  role: InvitationRole,
): Promise<string[]> {
  const { invitations } = await callPenpotApi(request, 'create-team-invitations', {
    teamId,
    role: role.toLowerCase(),
    emails,
  });
  return invitations ?? [];
}
