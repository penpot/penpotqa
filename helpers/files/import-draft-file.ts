import type { APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { callPenpotApi, penpotApiPath } from '../api/penpot-api';

interface ImportedFile {
  teamId: string;
  projectId: string;
  fileId: string;
}

/** Imports a `.penpot` file into the logged-in profile's Drafts project via the API.
 * Pass `page.context().request` so it uses that profile's session. Faster than the
 * dashboard import modal, for tests that only need the file as a starting point. */
export async function importDraftFile(
  request: APIRequestContext,
  filePath: string,
): Promise<ImportedFile> {
  const { defaultTeamId: teamId, defaultProjectId: projectId } = await callPenpotApi(
    request,
    'get-profile',
  );
  // import-binfile takes a multipart body and answers with a server-sent event
  // stream; its final `end` event lists the ids of the imported files.
  const res = await request.post(penpotApiPath('import-binfile'), {
    multipart: {
      'name': path.basename(filePath, '.penpot'),
      'project-id': projectId,
      'file': {
        name: path.basename(filePath),
        mimeType: 'application/zip',
        buffer: fs.readFileSync(filePath),
      },
    },
  });
  const body = await res.text();
  const fileId = body.match(/"~:file-ids":\["~u([0-9a-f-]+)"/)?.[1];
  if (!res.ok() || !fileId) {
    throw new Error(`import-binfile failed: ${res.status()} ${body}`);
  }
  return { teamId, projectId, fileId };
}
