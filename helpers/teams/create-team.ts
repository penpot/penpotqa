import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { createTeamName } from 'helpers/teams/create-team-name';

/** Creates a team via the API and returns it with its Drafts project. Pass
 * `page.context().request` so the team belongs to that profile. */
export async function createTeam(
  request: APIRequestContext,
  name = createTeamName(),
): Promise<{ teamId: string; projectId: string }> {
  const { id: teamId, defaultProjectId: projectId } = await callPenpotApi(
    request,
    'create-team',
    { name },
  );
  return { teamId, projectId };
}
