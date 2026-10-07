import type { APIRequestContext } from '@playwright/test';

interface DemoProfile {
  email: string;
  password: string;
}

export interface DemoUserOptions {
  /** Render engine for the new profile; omitted = Penpot default. */
  renderer?: 'svg' | 'wasm';
}

/**
 * Creates a demo Penpot profile via the API and logs in with it, skipping
 * onboarding.
 *
 * Pass `page.context().request` (not the standalone `request` fixture) —
 * Playwright then stores the login's session cookies straight into the
 * context's cookie jar, no manual `set-cookie` handling needed.
 *
 * @param options.renderer - optional render engine (`svg` | `wasm`).
 * @returns email + password — password only matters for tests that log back
 * in through the UI after logging out (e.g. PENPOT-3094).
 */
export async function createDemoUser(
  request: APIRequestContext,
  { renderer }: DemoUserOptions = {},
) {
  // `_fmt=json` — Penpot's RPC endpoints default to transit+json otherwise.
  const createRes = await request.post(
    '/api/rpc/command/create-demo-profile?_fmt=json',
    { data: { 'skip-onboarding': true, ...(renderer && { renderer }) } },
  );
  if (!createRes.ok())
    throw new Error(
      `create-demo-profile failed: ${createRes.status()} ${await createRes.text()}`,
    );
  const { email, password }: DemoProfile = await createRes.json();

  const loginRes = await request.post(
    '/api/rpc/command/login-with-password?_fmt=json',
    { data: { email, password } },
  );
  if (!loginRes.ok())
    throw new Error(
      `login-with-password failed: ${loginRes.status()} ${await loginRes.text()}`,
    );

  return { email, password };
}
