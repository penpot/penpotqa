import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';

/**
 * Renames the logged-in profile. Demo users are named "Demo User <uuid>", which
 * changes width every run and overflows narrow UI (e.g. comment pop-ups), so tests
 * with screenshots of the user name give it a fixed, short one instead.
 * Reload the page afterwards so the UI picks up the new name.
 */
export async function setDemoUserName(request: APIRequestContext, fullname: string) {
  await callPenpotApi(request, 'update-profile', { fullname });
}
