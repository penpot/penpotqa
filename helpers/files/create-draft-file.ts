import type { APIRequestContext } from '@playwright/test';

interface DraftFile {
  teamId: string;
  projectId: string;
  fileId: string;
}

// Penpot main API (/api/main/doc/openapi): JSON body with camelCase keys, closed
// schemas (no extra params such as `_fmt`).
async function rpc(request: APIRequestContext, method: string, data = {}) {
  const res = await request.post(`/api/main/methods/${method}`, {
    data,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok())
    throw new Error(`${method} failed: ${res.status()} ${await res.text()}`);
  return res.json();
}

/** Creates an empty file in the logged-in profile's Drafts project via the API.
 * Pass `page.context().request` so it uses that profile's session. */
export async function createDraftFile(
  request: APIRequestContext,
  name = 'New File 1',
): Promise<DraftFile> {
  const { defaultTeamId: teamId, defaultProjectId: projectId } = await rpc(
    request,
    'get-profile',
  );
  const { id: fileId } = await rpc(request, 'create-file', { name, projectId });
  return { teamId, projectId, fileId };
}
