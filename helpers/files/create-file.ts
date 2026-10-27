import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from '../api/penpot-api';

interface PenpotFile {
  teamId: string;
  projectId: string;
  fileId: string;
}

/** Creates an empty file via the API, in the given team project or, by default, in
 * the logged-in profile's Drafts project. Pass `page.context().request` so it uses
 * that profile's session. */
export async function createFile(
  request: APIRequestContext,
  {
    name = 'New File 1',
    project,
  }: { name?: string; project?: { teamId: string; projectId: string } } = {},
): Promise<PenpotFile> {
  let teamId: string, projectId: string;
  if (project) {
    ({ teamId, projectId } = project);
  } else {
    const profile = await callPenpotApi(request, 'get-profile');
    teamId = profile.defaultTeamId;
    projectId = profile.defaultProjectId;
  }
  const { id: fileId } = await callPenpotApi(request, 'create-file', {
    name,
    projectId,
  });
  return { teamId, projectId, fileId };
}
