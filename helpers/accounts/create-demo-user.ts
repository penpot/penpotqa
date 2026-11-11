import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from '../api/penpot-api';

interface DemoProfile {
  email: string;
  password: string;
}

export interface DemoUserOptions {
  /** Render engine for the new profile; omitted = Penpot default. */
  renderer?: 'svg' | 'wasm';
  /** How long until the backend expires the profile, in hours (e.g. `72h`). */
  expiresIn?: string;
  /** Skip the onboarding survey/team step (default). Pass `false` to get it. */
  skipOnboarding?: boolean;
  /** UI theme saved on the profile. Omitted = Penpot's `system`, which follows
   * the browser's color scheme (`colorScheme: 'dark'` in playwright.config.ts). */
  theme?: 'dark' | 'light' | 'system';
}

/**
 * Creates a demo Penpot profile via the API and logs in with it, skipping
 * onboarding unless `skipOnboarding: false`. The UI theme follows the
 * browser's color scheme unless a `theme` is given.
 *
 * Pass `page.context().request` (not the standalone `request` fixture) —
 * Playwright then stores the login's session cookies straight into the
 * context's cookie jar, no manual `set-cookie` handling needed.
 *
 * @param options.renderer - optional render engine (`svg` | `wasm`).
 * @param options.expiresIn - profile lifetime, defaults to `72h`.
 * @param options.skipOnboarding - defaults to `true`; `false` keeps the survey.
 * @param options.theme - optional theme saved on the profile.
 * @returns email + password — password only matters for tests that log back
 * in through the UI after logging out (e.g. PENPOT-3094).
 */
export async function createDemoUser(
  request: APIRequestContext,
  {
    renderer,
    expiresIn = '72h',
    skipOnboarding = true,
    theme,
  }: DemoUserOptions = {},
) {
  const { email, password } = await callPenpotApi<DemoProfile>(
    request,
    'create-demo-profile',
    { skipOnboarding, expiresIn, ...(renderer && { renderer }) },
  );
  await callPenpotApi(request, 'login-with-password', { email, password });

  if (theme) {
    // `create-demo-profile` takes no theme, and `update-profile` requires
    // `fullname`, so send the generated one back unchanged.
    const { fullname } = await callPenpotApi<{ fullname: string }>(
      request,
      'get-profile',
    );
    await callPenpotApi(request, 'update-profile', { fullname, theme });
  }

  return { email, password };
}
