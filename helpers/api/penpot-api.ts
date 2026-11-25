import type { APIRequestContext } from '@playwright/test';

/** Penpot main API methods used by the tests. Add new ones as callers need them. */
export type PenpotApiMethod =
  | 'create-demo-profile'
  | 'login-with-password'
  | 'get-profile'
  | 'update-profile'
  | 'update-profile-props'
  | 'create-access-token'
  | 'create-file'
  | 'create-team'
  | 'create-team-invitations'
  | 'verify-token'
  | 'get-file-libraries'
  | 'import-binfile'
  | 'create-upload-session'
  | 'upload-chunk'
  | 'create-font-variant'
  | 'delete-team-member'
  | 'delete-team'
  | 'get-owned-organizations-summary';

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
  const res = await postPenpotApi(request, method, params);
  return res.json();
}

/**
 * Like callPenpotApi(), for methods whose answer the caller doesn't need: some
 * (e.g. delete-team) answer with an empty body, which isn't JSON.
 * @param request Session to call with, e.g. `page.context().request`.
 * @param method API method name.
 * @param params Method parameters, with camelCase keys.
 */
export async function callPenpotApiNoContent(
  request: APIRequestContext,
  method: PenpotApiMethod,
  params: Record<string, unknown> = {},
): Promise<void> {
  await postPenpotApi(request, method, params);
}

/**
 * Posts a Penpot main API call and throws with the server's answer when it fails.
 * @param request Session to call with.
 * @param method API method name.
 * @param params Method parameters, with camelCase keys.
 * @returns The (successful) response.
 */
async function postPenpotApi(
  request: APIRequestContext,
  method: PenpotApiMethod,
  params: Record<string, unknown>,
) {
  const res = await request.post(penpotApiPath(method), {
    data: params,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok())
    throw new Error(`${method} failed: ${res.status()} ${await res.text()}`);
  return res;
}
