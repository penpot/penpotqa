/**
 * POC (not for merge): checks `orgMatrixTest` builds what its matrix
 * describes, with demo accounts only (no email). See
 * helpers/organizations/org-matrix.ts.
 */
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { orgMatrixTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

/** Switches org and reloads: right after a switch the Admin Console can still
 * show the previous org's cached data, and drop early clicks. */
async function switchOrg(
  page: Page,
  adminConsolePage: AdminConsolePage,
  org: { id: string; name: string },
) {
  await adminConsolePage.switchToOrg(org.name);
  await expect(page).toHaveURL(new RegExp(org.id));
  await page.reload();
  await adminConsolePage.isOnOrganizationAdminConsole(org.name);
}

orgMatrixTest.describe('penpot-nitrate#508 set-up', () => {
  orgMatrixTest.use({
    orgMatrix: {
      users: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
      orgOwner: 'user1',
      orgs: {
        orgA: {
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
        },
        orgB: {},
      },
    },
  });

  orgMatrixTest(
    'matches the numbers of the issue',
    async ({ page, matrix, adminConsolePage }) => {
      orgMatrixTest.setTimeout(300_000);
      const main = page.locator('main');

      await orgMatrixTest.step('Lands in OrgA; counts match Demo 1', async () => {
        await adminConsolePage.isOnOrganizationAdminConsole(matrix.orgs.orgA.name);
        await adminConsolePage.openAdvancedPermissionsTab();
        await expect(main.getByText('All members.')).toBeVisible();
        await expect(main.getByText('3 members.')).toBeVisible();
        await expect(main.getByText('5 members.')).toBeVisible();
      });

      await orgMatrixTest.step(
        'Picker shows each attribute with its holders',
        async () => {
          await page.getByRole('button', { name: 'Who are' }).first().click();
          await page.getByRole('button', { name: 'Add attribute' }).click();
          const options = page.getByRole('listbox', { name: 'Attributes' });
          for (const label of [
            'Legal 3',
            'Compliance 1',
            'Junior 1',
            'Beta testers 0',
          ]) {
            await expect(
              options.getByRole('option', { name: new RegExp(`^${label}`) }),
            ).toBeVisible();
          }
        },
      );

      await orgMatrixTest.step(
        'Create Teams, Who are Legal → 3 members (Demo 2)',
        async () => {
          await page.getByRole('option', { name: /^Legal 3/ }).click();
          await expect(main.getByText('All members.')).toBeHidden();
          await expect(main.getByText('3 members.')).toHaveCount(2);
        },
      );

      await orgMatrixTest.step(
        'OrgB exists, with no attributes (Demo 8)',
        async () => {
          await switchOrg(page, adminConsolePage, matrix.orgs.orgB);
          await adminConsolePage.openAdvancedPermissionsTab();
          await page.getByRole('button', { name: 'Who are' }).first().click();
          await page.getByRole('button', { name: 'Add attribute' }).click();
          await expect(page.getByText('No attributes yet.')).toBeVisible();
        },
      );
    },
  );
});

orgMatrixTest.describe('Several organizations', () => {
  orgMatrixTest.use({
    orgMatrix: {
      users: ['owner', 'user2', 'user3', 'user5'],
      orgOwner: 'owner',
      orgs: {
        orgA: {
          teams: { apple: { user2: 'owner', user3: 'admin' } },
        },
        orgB: {
          teams: { cherry: { user2: 'owner', user3: 'editor' } },
          members: ['user5'],
          attributes: { Reviewers: ['user2', 'user5'] },
        },
      },
    },
  });

  orgMatrixTest(
    'builds each org with its own teams, members and attributes',
    async ({ page, matrix, adminConsolePage }) => {
      orgMatrixTest.setTimeout(300_000);
      const { users, orgs } = matrix;

      await orgMatrixTest.step(
        'OrgB lists its members, user5 included (no team)',
        async () => {
          await switchOrg(page, adminConsolePage, orgs.orgB);
          await adminConsolePage.openPeopleTab();
          for (const key of ['user2', 'user3', 'user5']) {
            await expect(
              page.getByRole('cell', { name: users[key].name }),
            ).toBeVisible();
          }
        },
      );

      await orgMatrixTest.step(
        'OrgB: one team, owned by user2; counts per role',
        async () => {
          await adminConsolePage.openTeamsTab();
          await expect(
            page.getByRole('row', { name: new RegExp(orgs.orgB.teams.cherry.name) }),
          ).toContainText(users.user2.name);
          await expect(page.getByRole('row')).toHaveCount(2); // header + cherry
          await adminConsolePage.openAdvancedPermissionsTab();
          // Send invitations: owners and admins of OrgB's teams → user2 only.
          await expect(
            page.locator('main').getByText('1 member.').first(),
          ).toBeVisible();
        },
      );

      await orgMatrixTest.step(
        'OrgB attribute picker shows "Reviewers 2"',
        async () => {
          await page.getByRole('button', { name: 'Who are' }).first().click();
          await page.getByRole('button', { name: 'Add attribute' }).click();
          await expect(
            page.getByRole('option', { name: /^Reviewers 2/ }),
          ).toBeVisible();
        },
      );

      await orgMatrixTest.step(
        'OrgA has user3 as admin of apple, and no attributes',
        async () => {
          await page.keyboard.press('Escape');
          await switchOrg(page, adminConsolePage, orgs.orgA);
          await adminConsolePage.openAdvancedPermissionsTab();
          // Send invitations in OrgA: user2 (owner) and user3 (admin).
          await expect(page.locator('main').getByText('2 members.')).toBeVisible();
          await page.getByRole('button', { name: 'Who are' }).first().click();
          await page.getByRole('button', { name: 'Add attribute' }).click();
          await expect(page.getByText('No attributes yet.')).toBeVisible();
        },
      );

      await orgMatrixTest.step('Member pages open on demand', async () => {
        const user5 = await users.user5.page();
        await expect(user5.getByText('Personal Projects').first()).toBeVisible();
      });
    },
  );
});
