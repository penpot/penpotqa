import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from '../api/penpot-api';

interface DraftFile {
  teamId: string;
  projectId: string;
  fileId: string;
}

/** Creates an empty file in the logged-in profile's Drafts project via the API.
 * Pass `page.context().request` so it uses that profile's session. */
export async function createDraftFile(
  request: APIRequestContext,
  name = 'New File 1',
): Promise<DraftFile> {
  const { defaultTeamId: teamId, defaultProjectId: projectId } = await callPenpotApi(
    request,
    'get-profile',
  );
  const { id: fileId } = await callPenpotApi(request, 'create-file', {
    name,
    projectId,
  });
  return { teamId, projectId, fileId };
}
