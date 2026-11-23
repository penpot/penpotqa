import type { APIRequestContext } from '@playwright/test';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { callPenpotApi, penpotApiPath } from 'helpers/api/penpot-api';
import path from 'path';

/** A font file to upload to a team as a custom font. */
export interface TeamFont {
  /** Font file, e.g. 'fonts/Nekophilia.otf'. */
  path: string;
  /** Family name the font is listed with, e.g. 'Nekophilia'. */
  family: string;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: 'normal' | 'italic';
}

const FONT_MIME_TYPES: Record<string, string> = {
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/**
 * Uploads custom fonts to a team via the API (chunked upload, then
 * create-font-variant), e.g. before opening a file that uses them.
 * Pass `page.context().request` so it uses that profile's session.
 */
export async function uploadTeamFonts(
  request: APIRequestContext,
  teamId: string,
  fonts: TeamFont[],
) {
  for (const { path: fontPath, family, weight = 400, style = 'normal' } of fonts) {
    const mimeType = FONT_MIME_TYPES[path.extname(fontPath).toLowerCase()];
    if (!mimeType) throw new Error(`Unsupported font file: ${fontPath}`);

    const { sessionId } = await callPenpotApi(request, 'create-upload-session', {
      totalChunks: 1,
    });
    const res = await request.post(penpotApiPath('upload-chunk'), {
      multipart: {
        'session-id': sessionId,
        'index': '0',
        'content': {
          name: path.basename(fontPath),
          mimeType,
          buffer: fs.readFileSync(fontPath),
        },
      },
    });
    if (!res.ok()) {
      throw new Error(`upload-chunk failed: ${res.status()} ${await res.text()}`);
    }
    await callPenpotApi(request, 'create-font-variant', {
      teamId,
      fontId: randomUUID(),
      fontFamily: family,
      fontWeight: weight,
      fontStyle: style,
      uploads: { [mimeType]: sessionId },
    });
  }
}
