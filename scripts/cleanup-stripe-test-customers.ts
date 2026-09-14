/**
 * Bulk deletion of test Customers in Stripe (sandbox / test mode) created
 * by Playwright test runs (dashboard, subscriptions, etc.).
 *
 * Targets emails following the templates:
 *   qa.testing+<random>autotest@kaleidos.net
 *   qawerk.test+<random>autotest@gmail.com
 *
 * Env vars:
 *   STRIPE_CLEANUP_SK   Stripe restricted/secret TEST key with Customers
 *                       read + delete permissions. Never a live key — see .env.example.
 *
 * Usage:
 *   # 1) Dry-run (default) - only lists, deletes nothing
 *   npm run cleanup:stripe:dry-run
 *
 *   # 2) Actually delete (asks for confirmation)
 *   npm run cleanup:stripe:execute
 *
 *   # 3) Skip the interactive confirmation (CI)
 *   npx tsx scripts/cleanup-stripe-test-customers.ts --execute --yes
 *
 * Origin: provided by infra (David) via Taiga task
 * https://tree.taiga.io/project/kaleidos-qa/us/537
 */

import 'dotenv/config';
import Stripe from 'stripe';
import * as fs from 'fs';
import * as readline from 'readline';

// Domains used by the different test email templates. Add more here if
// Playwright starts generating customers on another domain.
const ALLOWED_DOMAINS = ['kaleidos.net', 'gmail.com'];

// Pattern that emails to be deleted must match, e.g.:
//   qa.testing+<random>autotest@kaleidos.net
//   qawerk.test+<random>autotest@gmail.com
const EMAIL_PATTERN = new RegExp(
  `^qa[\\w.]*\\+.*autotest@(?:${ALLOWED_DOMAINS.map((d) =>
    d.replace(/\./g, '\\.'),
  ).join('|')})$`,
  'i',
);

// Fragment used for the initial search via Stripe's Search API.
// NOTE: ":" is EXACT match in Stripe; "~" is the substring operator
// (minimum 3 characters). "autotest@" is common to every template above,
// regardless of domain, so a single substring search covers all of them.
const SEARCH_QUERY = 'email~"autotest@"';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = `stripe_customers_deleted_${timestamp}.csv`;

interface DeleteResult {
  deleted: string[];
  failed: { id: string; error: string }[];
}

function getApiKey(): string {
  const key = process.env.STRIPE_CLEANUP_SK;
  if (!key) {
    console.error(
      'Set the STRIPE_CLEANUP_SK environment variable with your sandbox key (sk_test_... or rk_test_...).',
    );
    process.exit(1);
  }
  if (key.includes('_live_')) {
    console.error(
      'ABORTED: the provided key looks like a LIVE mode key. ' +
        'This script must only be used against a sandbox/test mode key.',
    );
    process.exit(1);
  }
  if (!key.startsWith('sk_test_') && !key.startsWith('rk_test_')) {
    console.error(
      "Warning: the key does not start with 'sk_test_' or 'rk_test_'. Double-check it really " +
        'points to a sandbox before continuing.',
    );
  }
  return key;
}

async function findMatchingCustomers(stripe: Stripe): Promise<Stripe.Customer[]> {
  const matches: Stripe.Customer[] = [];
  let page: string | undefined = undefined;

  while (true) {
    let result: Stripe.ApiSearchResult<Stripe.Customer>;
    try {
      result = await stripe.customers.search({
        query: SEARCH_QUERY,
        limit: 100,
        page,
      });
    } catch (err: any) {
      if (err?.type === 'StripeRateLimitError') {
        await sleep(2000);
        continue;
      }
      throw err;
    }

    for (const customer of result.data) {
      const email = customer.email || '';
      if (EMAIL_PATTERN.test(email)) {
        matches.push(customer);
      }
    }

    if (result.has_more && result.next_page) {
      page = result.next_page;
      await sleep(100); // margin against the Search API rate limit (20 req/s)
    } else {
      break;
    }
  }

  return matches;
}

async function deleteCustomers(
  stripe: Stripe,
  customers: Stripe.Customer[],
  execute: boolean,
): Promise<DeleteResult> {
  const deleted: string[] = [];
  const failed: { id: string; error: string }[] = [];

  const rows: string[] = ['customer_id,email,created,status'];

  for (const c of customers) {
    const cid = c.id;
    const email = c.email || '';
    const created = new Date(c.created * 1000).toISOString();

    if (!execute) {
      rows.push(csvRow(cid, email, created, 'DRY_RUN_NOT_DELETED'));
      continue;
    }

    try {
      await stripe.customers.del(cid);
      deleted.push(cid);
      rows.push(csvRow(cid, email, created, 'DELETED'));
    } catch (err: any) {
      if (err?.type === 'StripeRateLimitError') {
        await sleep(2000);
        try {
          await stripe.customers.del(cid);
          deleted.push(cid);
          rows.push(csvRow(cid, email, created, 'DELETED_AFTER_RETRY'));
        } catch (err2: any) {
          failed.push({ id: cid, error: String(err2?.message ?? err2) });
          rows.push(csvRow(cid, email, created, `FAILED: ${err2?.message ?? err2}`));
        }
      } else {
        failed.push({ id: cid, error: String(err?.message ?? err) });
        rows.push(csvRow(cid, email, created, `FAILED: ${err?.message ?? err}`));
      }
    }

    await sleep(50); // courtesy pause against the standard API rate limit
  }

  fs.writeFileSync(LOG_FILE, rows.join('\n') + '\n', 'utf-8');
  return { deleted, failed };
}

function csvRow(...fields: string[]): string {
  return fields.map((f) => `"${f.replace(/"/g, '""')}"`).join(',');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function askConfirmation(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const skipConfirm = args.includes('--yes');

  const apiKey = getApiKey();
  const stripe = new Stripe(apiKey);

  console.log('Searching for test customers matching the email pattern...');
  const customers = await findMatchingCustomers(stripe);
  console.log(`Found ${customers.length} customers matching the pattern.`);

  if (customers.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  console.log('\nExamples (up to 10):');
  for (const c of customers.slice(0, 10)) {
    console.log(`  - ${c.id}  ${c.email}`);
  }

  if (!execute) {
    await deleteCustomers(stripe, customers, false);
    console.log(
      `\n[DRY-RUN] Nothing was deleted. Simulation log written to: ${LOG_FILE}\n` +
        'Run with --execute to actually delete.',
    );
    return;
  }

  if (!skipConfirm) {
    const answer = await askConfirmation(
      `\nConfirm PERMANENT DELETION of ${customers.length} customers in this environment ` +
        `(${apiKey.slice(0, 12)}...)? Type 'DELETE' to continue: `,
    );
    if (answer.trim() !== 'DELETE') {
      console.log('Cancelled by user.');
      return;
    }
  }

  const { deleted, failed } = await deleteCustomers(stripe, customers, true);

  console.log(`\nDeleted: ${deleted.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Full log: ${LOG_FILE}`);

  if (failed.length > 0) {
    console.log('\nSome deletions failed:');
    for (const { id, error } of failed) {
      console.log(`  - ${id}: ${error}`);
    }
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
