import type { APIRequestContext } from '@playwright/test';
import fs from 'fs';
import { callPenpotApi, penpotApiPath } from 'helpers/api/penpot-api';
import path from 'path';

interface ImportedFile {
  teamId: string;
  projectId: string;
  fileId: string;
}

/** Imports a `.penpot` file into the profile's Drafts via the API, skipping the UI. */
export async function importDraftFile(
  request: APIRequestContext,
  filePath: string,
): Promise<ImportedFile> {
  const { defaultTeamId: teamId, defaultProjectId: projectId } = await callPenpotApi(
    request,
    'get-profile',
  );
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
  // The response is a server-sent event stream; its `end` event lists the new file ids.
  const endEvent = body
    .split('\n\n')
    .find((event) => event.startsWith('event: end'))
    ?.split('data: ')[1];
  if (!res.ok() || !endEvent) {
    throw new Error(`import-binfile failed: ${res.status()} ${body}`);
  }
  const fileIds: string[] = (JSON.parse(endEvent)['~:file-ids'] ?? []).map(
    (id: string) => id.replace('~u', ''),
  );
  return { teamId, projectId, fileId: await findMainFileId(request, fileIds) };
}

/** Among the imported files, returns the one no other file uses as a library. */
async function findMainFileId(
  request: APIRequestContext,
  fileIds: string[],
): Promise<string> {
  if (fileIds.length === 1) return fileIds[0];
  const libraryIds = new Set<string>();
  for (const fileId of fileIds) {
    const libraries = await callPenpotApi<{ id: string }[]>(
      request,
      'get-file-libraries',
      { fileId },
    );
    libraries.forEach((library) => libraryIds.add(library.id));
  }
  const mainIds = fileIds.filter((id) => !libraryIds.has(id));
  if (mainIds.length !== 1) {
    throw new Error(`Can't tell the main file among the imported [${fileIds}]`);
  }
  return mainIds[0];
}
