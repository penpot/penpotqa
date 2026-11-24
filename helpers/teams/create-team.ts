import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { createTeamName } from 'helpers/teams/create-team-name';

/**
 * Creates a team via the API and returns it with its Drafts project.
 * @param request Session of the user who will own the team, e.g.
 * `page.context().request`.
 * @param name Team name.
 * @param organizationId Organization to create the team in. The user must be its
 * owner or a member (see `joinOrganization()`).
 * @returns The new team's id and its Drafts project's id.
 */
export async function createTeam(
  request: APIRequestContext,
  name = createTeamName(),
  organizationId?: string,
): Promise<{ teamId: string; projectId: string }> {
  const { id: teamId, defaultProjectId: projectId } = await callPenpotApi(
    request,
    'create-team',
    { name, ...(organizationId && { organizationId }) },
  );
  return { teamId, projectId };
}
