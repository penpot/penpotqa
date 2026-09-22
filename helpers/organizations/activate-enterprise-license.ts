import type { APIRequestContext } from '@playwright/test';

export interface ActivateEnterpriseLicenseOptions {
  quantity?: number;
  billingPeriod?: 'month' | 'year';
  daysValid?: number;
}

export interface ActivateEnterpriseLicenseResult {
  code: string;
  cancelAt: unknown;
}

/**
 * Gets a real, valid Enterprise activation code from licenses-manager,
 * without redeeming it — the operator path licenses-manager exposes for
 * support/dev use:
 *
 * 1. Penpot RPC (activation-code request) → request file
 * 2. licenses-manager POST /api/activation-codes/create → activation code
 *
 * Redeeming (step 3) is separate: via the API (`activateEnterpriseLicense()`
 * below) or the app's own manual-activation UI (Qase 3437).
 *
 * Only works against PRE and developer environments, not the default CI
 * target, hence LICENSES_MANAGER_URL being unset there rather than pointed
 * at a production licenses-manager — see .env.example's LICENSES_MANAGER_URL
 * comment for the flag that machine itself needs enabled. Pass
 * `page.context().request` (not the standalone `request` fixture), same as
 * `createDemoUser`, so the RPC calls carry the account's session cookie.
 *
 * `quantity`/`billingPeriod` default to 1/'year', matching the reference
 * suite's known-working call shape — the create endpoint treats them as
 * optional, but that's the only combination actually verified to work.
 * `daysValid` is left unset by default instead of also defaulting it:
 * giving the license a finite expiration switches the dashboard's sidebar
 * promo widget to a "Renew your subscription" state with no "Create
 * organization" button at all, which breaks `sidebarPromoCreateOrgButton`
 * — pass it explicitly only if a case specifically needs an expiring
 * license.
 */
export async function requestActivationCode(
  request: APIRequestContext,
  options: ActivateEnterpriseLicenseOptions = {},
): Promise<string> {
  const { quantity = 1, billingPeriod = 'year', daysValid } = options;
  const licensesManagerUrl = process.env.LICENSES_MANAGER_URL;
  if (!licensesManagerUrl) {
    throw new Error(
      'LICENSES_MANAGER_URL is not set — requestActivationCode() only works ' +
        'against an environment with a reachable licenses-manager ' +
        '(PRE/developer environments).',
    );
  }

  // `_fmt=json` — Penpot's RPC endpoints default to transit+json otherwise.
  const requestFileRes = await request.post(
    '/api/rpc/command/get-nitrate-activation-code-request?_fmt=json',
    { data: {} },
  );
  if (!requestFileRes.ok()) {
    throw new Error(
      `Enterprise activation-code request RPC failed: ${requestFileRes.status()} ${await requestFileRes.text()}`,
    );
  }

  const rawBody = (await requestFileRes.text()).trim();
  if (!rawBody) {
    throw new Error('Enterprise activation-code request RPC returned an empty body');
  }
  // Body is normally a JSON-quoted string under _fmt=json, but fall back to
  // raw text in case the RPC ever answers text/plain instead.
  let requestFile = rawBody;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (typeof parsed === 'string') requestFile = parsed.trim();
  } catch {
    // rawBody is already the plain request file
  }

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([requestFile], { type: 'text/plain' }),
    'penpot-activation-code-request.txt',
  );
  formData.append('quantity', String(quantity));
  formData.append('billingPeriod', billingPeriod);
  if (daysValid != null) {
    formData.append('daysValid', String(daysValid));
  }

  const createUrl = `${licensesManagerUrl.replace(/\/$/, '')}/api/activation-codes/create`;
  const createRes = await fetch(createUrl, { method: 'POST', body: formData });
  if (!createRes.ok) {
    const body = await createRes.text();
    if (createRes.status === 404) {
      throw new Error(
        `licenses-manager returned 404 for ${createUrl} — check that machine has activation codes enabled.`,
      );
    }
    throw new Error(
      `licenses-manager create activation code failed: ${createRes.status} ${body}`,
    );
  }

  const code = (await createRes.text()).trim();
  if (!code) {
    throw new Error('licenses-manager returned an empty activation code');
  }

  return code;
}

/**
 * Grants an active Enterprise license without touching Stripe —
 * `requestActivationCode()` plus an API redeem. */
export async function activateEnterpriseLicense(
  request: APIRequestContext,
  options: ActivateEnterpriseLicenseOptions = {},
): Promise<ActivateEnterpriseLicenseResult> {
  const code = await requestActivationCode(request, options);

  const redeemRes = await request.post(
    '/api/rpc/command/redeem-nitrate-activation-code?_fmt=json',
    { data: { 'activation-code': code } },
  );
  if (!redeemRes.ok()) {
    throw new Error(
      `Enterprise activation-code redeem RPC failed: ${redeemRes.status()} ${await redeemRes.text()}`,
    );
  }

  const data = (await redeemRes.json().catch(() => ({}))) as Record<string, unknown>;
  return { code, cancelAt: data['cancel-at'] ?? data.cancelAt ?? null };
}
