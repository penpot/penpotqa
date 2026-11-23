/**
 * Qase suite: Admin Console > Sidebar Menu > Nitrates > Audit Logs
 * 4026/4027/4030 are one flow on the same org, so they run as one case.
 */
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { qase } from 'playwright-qase-reporter/playwright';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Audit Logs',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [4026, 4027, 4030],
        'Audit Logs: navigation item, export details box and full CSV download',
      ),
      async ({ orgPage, adminConsolePage, auditLogsPage }) => {
        let orgSlug = '';

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            ({ slug: orgSlug } = adminConsolePage.getOrgSlugAndIdFromUrl());
          },
        );

        await enterpriseActivatedPageTest.step(
          '4026, Audit Logs section appears as a navigation item in the Admin Console',
          async () => {
            await enterpriseActivatedPageTest.step(
              'Audit Logs is listed as a navigation item of the Admin Console',
              async () => {
                await auditLogsPage.checkAuditLogsNavLinkIsVisible();
              },
            );

            await enterpriseActivatedPageTest.step(
              'Click Audit Logs → the section opens with the export details box',
              async () => {
                await auditLogsPage.openAuditLogsTab();
                await auditLogsPage.waitForRecordedEvents();
                await auditLogsPage.checkExportDetailsBoxIsVisible();
              },
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          '4027, Export details box shows file name, format, columns and actions',
          async () => {
            await enterpriseActivatedPageTest.step(
              'Export details box shows the file name (audit-log-[org slug].csv) and CSV format',
              async () => {
                await auditLogsPage.checkExportFileName(orgSlug);
                await auditLogsPage.checkExportFormatIsCsv();
              },
            );

            await enterpriseActivatedPageTest.step(
              'Export details box lists every audit log column',
              async () => {
                await auditLogsPage.checkExportColumns();
              },
            );

            await enterpriseActivatedPageTest.step(
              'Event type guide link and an enabled Download CSV button are visible',
              async () => {
                await auditLogsPage.checkEventTypeGuideLinkIsVisible();
                await auditLogsPage.checkDownloadCsvButtonIsEnabled();
              },
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          '4030, Download the full audit log CSV with automatic download and success message',
          async () => {
            const download = await auditLogsPage.downloadCsv();
            await auditLogsPage.checkCsvDownloadedMessageIsVisible();
            await auditLogsPage.checkDownloadedCsv(download, orgSlug);
          },
        );
      },
    );
  },
);
