import type { APIRequestContext } from '@playwright/test';

interface DemoProfile {
  email: string;
  password: string;
}

/**
 * Creates a demo Penpot profile via the API and logs in with it, skipping
 * onboarding.
 *
 * Pass `page.context().request` (not the standalone `request` fixture) —
 * Playwright then stores the login's session cookies straight into the
 * context's cookie jar, no manual `set-cookie` handling needed.
 *
 * @returns email + password — password only matters for tests that log back
 * in through the UI after logging out (e.g. PENPOT-3094).
 */
export async function createDemoUser(request: APIRequestContext) {
  // `_fmt=json` — Penpot's RPC endpoints default to transit+json otherwise.
  const createRes = await request.post(
    '/api/rpc/command/create-demo-profile?_fmt=json',
    { data: { 'skip-onboarding': true } },
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
