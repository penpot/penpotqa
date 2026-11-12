/**
 * POC (not for merge): builds the 6-user set-up of penpot-nitrate#508 with
 * demo accounts only (no email) and checks it against the numbers the issue
 * gives. See helpers/organizations/org-matrix.ts.
 */
import { expect } from '@playwright/test';
import { enterpriseActivatedPageTest as test } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { buildOrgMatrix } from 'helpers/organizations/org-matrix';

test('POC: org matrix for penpot-nitrate#508', async ({
  page,
  browser,
  orgPage,
  adminConsolePage,
}) => {
  test.setTimeout(300_000);
  await createOrgForLicensedAccount(orgPage, createOrgName());
  const organizationId = new URL(page.url()).pathname.split('/')[4];

  const t0 = Date.now();
  const built = await buildOrgMatrix(browser, page, organizationId, {
    users: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
    orgOwner: 'user1',
    teams: {
      apple: { user2: 'owner', user3: 'admin', user6: 'editor' },
      banana: { user4: 'owner', user5: 'admin' },
      coconut: { user1: 'owner' },
    },
    attributes: {
      'Legal': ['user2', 'user3', 'user6'],
      'Compliance': ['user4'],
      'Junior': ['user3'],
      'Beta testers': [],
    },
  });
  console.log(`matrix built in ${Date.now() - t0} ms`);

  await test.step('Counts match the issue (Demo 1)', async () => {
    await adminConsolePage.openAdvancedPermissionsTab();
    const main = page.locator('main');
    await expect(main.getByText('All members.')).toBeVisible();
    await expect(main.getByText('3 members.')).toBeVisible();
    await expect(main.getByText('5 members.')).toBeVisible();
  });

  await test.step('Picker shows each attribute with its holders', async () => {
    await page.getByRole('button', { name: 'Who are' }).first().click();
    await page.getByRole('button', { name: 'Add attribute' }).click();
    const options = page.getByRole('listbox', { name: 'Attributes' });
    for (const label of ['Legal 3', 'Compliance 1', 'Junior 1', 'Beta testers 0']) {
      await expect(
        options.getByRole('option', { name: new RegExp(`^${label}`) }),
      ).toBeVisible();
    }
  });

  await test.step('Create Teams, Who are Legal → 3 members (Demo 2)', async () => {
    await page.getByRole('option', { name: /^Legal 3/ }).click();
    await expect(page.locator('main').getByText('All members.')).toBeHidden();
    await expect(page.locator('main').getByText('3 members.')).toHaveCount(2);
  });

  await test.step('A member page opens on demand', async () => {
    const user5 = await built.users.user5.page();
    // Lands on the member's own dashboard (their Personal Projects team).
    await expect(user5).toHaveURL(/dashboard/);
    await expect(user5.getByText('Personal Projects').first()).toBeVisible();
  });

  await built.close();
});
