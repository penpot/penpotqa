/**
 * Qase suite: Admin Console > Sidebar Menu > Nitrates > Audit Logs
 * Cases that are one flow on the same org run as one test: 4026/4027/4030,
 * Filter by Event Type (4060-4071) and Filter by Date Range (4131-4142).
 */
import { AuditLogEventCategory } from '@pages/admin-console/audit-log-filters-component';
import { type Download } from '@playwright/test';
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
          'Setup: Enterprise already active (activation code), create an organization',
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

    enterpriseActivatedPageTest(
      qase(
        [4060, 4061, 4062, 4063, 4071],
        'Audit Logs: filter by event type and clear the filters back to the full export',
      ),
      async ({ orgPage, adminConsolePage, auditLogsPage }) => {
        const { filters } = auditLogsPage;
        const { TeamAndOrganization, FilesAndProjects } = AuditLogEventCategory;
        let orgSlug = '';
        let fullExport: Download;

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization and download its full audit log',
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            ({ slug: orgSlug } = adminConsolePage.getOrgSlugAndIdFromUrl());
            await auditLogsPage.openAuditLogsTab();
            await auditLogsPage.waitForRecordedEvents();
            fullExport = await auditLogsPage.downloadCsv();
            await auditLogsPage.checkDownloadedCsv(fullExport, orgSlug);
          },
        );

        await enterpriseActivatedPageTest.step(
          '4060, Event type filter is available with no categories filtered by default',
          async () => {
            await enterpriseActivatedPageTest.step(
              'Open the Event type filter → every category is unchecked and it reads "None filtered"',
              async () => {
                await filters.openFilters();
                await filters.openEventTypeFilter();
                await filters.checkSelectedCategories([]);
              },
            );

            await enterpriseActivatedPageTest.step(
              'Export details box does not mention any category',
              async () => {
                await auditLogsPage.checkExportHasNoEventTypes();
              },
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          '4061, Event type filter offers all expected categories',
          async () => {
            await filters.checkEventTypeCategories();
          },
        );

        await enterpriseActivatedPageTest.step(
          '4062, Narrowing the selection to one category is reflected on screen',
          async () => {
            await filters.selectCategory(TeamAndOrganization);
            await filters.checkSelectedCategories([TeamAndOrganization]);
            await auditLogsPage.checkExportEventTypes([TeamAndOrganization]);
          },
        );

        await enterpriseActivatedPageTest.step(
          '4063, Adding a second category to the selection is reflected on screen',
          async () => {
            await filters.selectCategory(FilesAndProjects);
            await filters.checkSelectedCategories([
              TeamAndOrganization,
              FilesAndProjects,
            ]);
            await auditLogsPage.checkExportEventTypes([
              TeamAndOrganization,
              FilesAndProjects,
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          '4071, Export after clearing all filters matches the full audit log',
          async () => {
            await enterpriseActivatedPageTest.step(
              'Narrow the selection to Team and organization management and set a date range → the export reflects both',
              async () => {
                await filters.selectCategory(FilesAndProjects, false);
                await filters.closeEventTypeFilter();
                await filters.setDateRangeToToday();
                await filters.checkDateRangeIsToday();
                await auditLogsPage.checkExportEventTypes([TeamAndOrganization]);
                await auditLogsPage.checkExportFileNameIsFiltered(orgSlug);
              },
            );

            await enterpriseActivatedPageTest.step(
              'Clear the event type filter and the date range → nothing is filtered',
              async () => {
                await filters.clearEventTypeFilter();
                await filters.clearDateRange();
                await filters.checkNoDateRange();
                await auditLogsPage.checkExportHasNoEventTypes();
                await auditLogsPage.checkExportFileName(orgSlug);
                await filters.openEventTypeFilter();
                await filters.checkSelectedCategories([]);
                await filters.closeEventTypeFilter();
              },
            );

            await enterpriseActivatedPageTest.step(
              'Click Download CSV → the file holds every event of the full export',
              async () => {
                const download = await auditLogsPage.downloadCsv();
                await auditLogsPage.checkDownloadedCsvMatchesFullExport(
                  download,
                  fullExport,
                  orgSlug,
                );
              },
            );
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4131, 4139, 4142],
        'Audit Logs: filter by date range, empty range and clear back to the full export',
      ),
      async ({ orgPage, adminConsolePage, auditLogsPage }) => {
        const { filters } = auditLogsPage;
        let orgSlug = '';
        let fullExport: Download;
        // Day A: the org's creation day, its only day with events. Set after setup, as
        // it can cross midnight; calendar-day arithmetic, as 24h can stay on one day (DST).
        let dayA: Date;
        let dayB: Date;
        let lastDay: Date;

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization, download its full audit log and move the clock 3 days ahead',
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            ({ slug: orgSlug } = adminConsolePage.getOrgSlugAndIdFromUrl());
            await auditLogsPage.openAuditLogsTab();
            await auditLogsPage.waitForRecordedEvents();
            fullExport = await auditLogsPage.downloadCsv();
            dayA = await auditLogsPage.getEventDate(
              fullExport,
              'create-organization',
            );
            dayB = new Date(dayA.getTime());
            dayB.setDate(dayB.getDate() + 1);
            lastDay = new Date(dayA.getTime());
            lastDay.setDate(lastDay.getDate() + 3);
            await auditLogsPage.reloadWithClockAt(lastDay);
          },
        );

        await enterpriseActivatedPageTest.step(
          '4131, Date range picker is available with no range applied by default',
          async () => {
            await enterpriseActivatedPageTest.step(
              'Click Filters → the date range picker is displayed',
              async () => {
                await filters.openFilters();
                await filters.checkDateRangePickerIsVisible();
              },
            );

            await enterpriseActivatedPageTest.step(
              'No range is applied and the export is the full one',
              async () => {
                await filters.checkNoDateRange();
                await auditLogsPage.checkExportDetailsBoxIsVisible();
                await auditLogsPage.checkExportFileName(orgSlug);
              },
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          '4139, Range with no events shows empty state and disables download',
          async () => {
            await filters.setDateRange(dayB, lastDay);
            await auditLogsPage.checkNoMatchingEventsState();
          },
        );

        await enterpriseActivatedPageTest.step(
          '4142, Clearing the filter returns to the full export',
          async () => {
            await enterpriseActivatedPageTest.step(
              'Set a date range → the file name shows the range',
              async () => {
                await filters.setDateRange(dayA, lastDay);
                await auditLogsPage.checkExportFileNameForRange(
                  orgSlug,
                  dayA,
                  lastDay,
                );
              },
            );

            await enterpriseActivatedPageTest.step(
              'Clear the filter → no range is set and the export is the full one',
              async () => {
                await filters.clearDateRange();
                await filters.checkNoDateRange();
                await auditLogsPage.checkExportFileName(orgSlug);
              },
            );

            await enterpriseActivatedPageTest.step(
              'Click Download CSV → the file holds every event of the full export',
              async () => {
                const download = await auditLogsPage.downloadCsv();
                await auditLogsPage.checkDownloadedCsvMatchesFullExport(
                  download,
                  fullExport,
                  orgSlug,
                );
              },
            );
          },
        );
      },
    );
  },
);
