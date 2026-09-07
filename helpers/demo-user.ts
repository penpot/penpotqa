import type { APIRequestContext } from '@playwright/test';

interface DemoProfile {
  email: string;
  password: string;
}

/**
 * Creates a demo Penpot profile via the API and logs in with it, skipping the
 * onboarding wizard.
 *
 * Pass `page.context().request` (not the standalone `request` fixture) so the
 * session cookies returned by the login response are stored directly in the
 * browser context's cookie jar — Playwright does this automatically for
 * requests made through a BrowserContext's APIRequestContext, so there's no
 * need to parse `set-cookie` headers or call `context.addCookies()` by hand.
 *
 * @returns the demo profile's email, in case a test needs to identify it later
 */
export async function createDemoUser(request: APIRequestContext) {
  // `_fmt=json` is required: Penpot's RPC endpoints respond with its
  // transit+json encoding by default, not plain JSON.
  const createRes = await request.post(
    '/api/rpc/command/create-demo-profile?_fmt=json',
    { data: { 'skip-onboarding': true } },
  );
  const { email, password }: DemoProfile = await createRes.json();

  await request.post('/api/rpc/command/login-with-password?_fmt=json', {
    data: { email, password },
  });

  return { email };
}
