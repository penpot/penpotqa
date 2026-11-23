import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi, callPenpotApiNoContent } from 'helpers/api/penpot-api';

/**
 * Creates a team owned by the user of `request` and adds it to an organization,
 * via the API. The user must already be a member of the organization (see
 * `joinOrganization()`), or its owner.
 * @param request Session of the user who will own the team.
 * @param organizationId Id of the organization to add the team to.
 * @param name Team name, e.g. from `createTeamName()`.
 * @returns The new team's id.
 */
export async function createOrgTeam(
  request: APIRequestContext,
  organizationId: string,
  name: string,
): Promise<string> {
  const { id } = await callPenpotApi<{ id: string }>(request, 'create-team', {
    name,
  });
  await callPenpotApiNoContent(request, 'add-team-to-organization', {
    teamId: id,
    organizationId,
  });
  return id;
}
