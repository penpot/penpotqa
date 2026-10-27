import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from '../api/penpot-api';

interface DemoProfile {
  email: string;
  password: string;
}

export interface DemoUserOptions {
  /** Render engine for the new profile; omitted = Penpot default. */
  renderer?: 'svg' | 'wasm';
  /** How long until the backend expires the profile (e.g. `96h`). */
  expiresIn?: string;
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
 * @param options.expiresIn - profile lifetime, defaults to `96h`.
 * @returns email + password — password only matters for tests that log back
 * in through the UI after logging out (e.g. PENPOT-3094).
 */
export async function createDemoUser(
  request: APIRequestContext,
  { renderer, expiresIn = '72h' }: DemoUserOptions = {},
) {
  const { email, password } = await callPenpotApi<DemoProfile>(
    request,
    'create-demo-profile',
    { skipOnboarding: true, expiresIn, ...(renderer && { renderer }) },
  );
  await callPenpotApi(request, 'login-with-password', { email, password });

  return { email, password };
}
