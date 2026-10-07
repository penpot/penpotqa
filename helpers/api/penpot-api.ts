import type { APIRequestContext } from '@playwright/test';

/** Penpot main API methods used by the tests. Add new ones as callers need them. */
export type PenpotApiMethod =
  'create-demo-profile' | 'login-with-password' | 'get-profile' | 'create-file';

/** Path of a Penpot main API method, e.g. to match it in `waitForResponse`. */
export const penpotApiPath = (method: PenpotApiMethod) =>
  `/api/main/methods/${method}`;

/**
 * Calls a Penpot main API method (/api/main/doc/openapi): JSON body with
 * camelCase keys, closed schemas (no extra params such as `_fmt`).
 * Pass `page.context().request` so the call uses (and stores) that page's session.
 */
export async function callPenpotApi<T = any>(
  request: APIRequestContext,
  method: PenpotApiMethod,
  params: Record<string, unknown> = {},
): Promise<T> {
  const res = await request.post(penpotApiPath(method), {
    data: params,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok())
    throw new Error(`${method} failed: ${res.status()} ${await res.text()}`);
  return res.json();
}
