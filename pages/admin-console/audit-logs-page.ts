import {
  AuditLogFiltersComponent,
  type AuditLogEventCategoryName,
} from '@pages/admin-console/audit-log-filters-component';
import { type Download, type Locator, type Page, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { BasePage } from '../base-page';

/** Audit log export columns, in order (export details box and CSV header). */
export const AuditLogColumn = {
  Timestamp: 'timestamp',
  UserId: 'user id',
  UserName: 'user name',
  UserEmail: 'user email',
  Category: 'category',
  EventType: 'event type',
  Source: 'source',
  Resource: 'resource',
  PreviousValue: 'previous value',
  NewValue: 'new value',
  Type: 'type',
} as const;

export type AuditLogColumnName =
  (typeof AuditLogColumn)[keyof typeof AuditLogColumn];

export const ExportDetail = {
  FileName: 'File name',
  Format: 'Format',
  Columns: 'Columns',
  EventTypes: 'Event types',
} as const;

export type ExportDetailName = (typeof ExportDetail)[keyof typeof ExportDetail];

/** Local calendar day as YYYY-MM-DD, as export file names write it. */
const toIsoDate = (date: Date) => date.toLocaleDateString('en-CA');

/** Admin Console > Audit Logs tab: export details box and CSV download. */
export class AuditLogsPage extends BasePage {
  readonly auditLogsNavLink: Locator;
  readonly noEventsHeading: Locator;
  readonly noMatchingEventsHeading: Locator;
  readonly headerDownloadCsvButton: Locator;

  // Scoped to the box: the section header has a second "Download CSV" button.
  readonly exportDetailsBox: Locator;
  readonly eventTypeGuideLink: Locator;
  readonly downloadCsvButton: Locator;

  readonly csvDownloadedMessage: Locator;
  readonly filters: AuditLogFiltersComponent;

  constructor(page: Page) {
    super(page);

    this.auditLogsNavLink = page
      .getByRole('navigation', { name: 'Organization navigation' })
      .getByRole('link', { name: 'Audit Logs' });
    this.noEventsHeading = page.getByRole('heading', {
      name: 'No events recorded yet',
    });
    this.noMatchingEventsHeading = page.getByRole('heading', {
      name: 'No events match these filters',
    });
    // The only one left when the filters match no events.
    this.headerDownloadCsvButton = page
      .getByRole('main')
      .getByRole('button', { name: 'Download CSV' })
      .first();

    this.exportDetailsBox = page.getByRole('main').locator('div:has(> dl)');
    this.eventTypeGuideLink = this.exportDetailsBox.getByRole('link', {
      name: 'Download event type guide',
    });
    this.downloadCsvButton = this.exportDetailsBox.getByRole('button', {
      name: 'Download CSV',
    });

    // Not BasePage.successMessage, and it has no role.
    this.csvDownloadedMessage = page.getByText(
      'The CSV was successfully downloaded!',
    );

    this.filters = new AuditLogFiltersComponent(page, page.getByRole('main'));
  }

  private getExportDetailValue(detail: ExportDetailName): Locator {
    return this.exportDetailsBox
      .locator('div')
      .filter({ has: this.page.getByRole('term').filter({ hasText: detail }) })
      .getByRole('definition');
  }

  private async readCsv(download: Download) {
    const [header, ...rows] = (await readFile(await download.path(), 'utf8'))
      .trim()
      .split(/\r?\n/);
    return { header, rows };
  }

  /** One date for a single day, e.g. audit-log-orga-2026-11-25-2026-11-27.csv for a range. */
  private getRangeFileName(orgSlug: string, from: Date, to: Date) {
    const range = [toIsoDate(from), toIsoDate(to)];
    return `audit-log-${orgSlug}-${[...new Set(range)].join('-')}.csv`;
  }

  /** When the CSV's first event of a type happened, e.g. 'create-organization'. */
  async getEventDate(download: Download, eventType: string): Promise<Date> {
    const { rows } = await this.readCsv(download);
    const row = rows.find((r) => r.includes(`,${eventType},`));
    expect(row, `CSV holds the ${eventType} event`).toBeDefined();
    return new Date((row ?? '').split(',')[0]);
  }

  /** The picker only offers days up to today, so setting the clock lets it offer later days. */
  async reloadWithClockAt(date: Date) {
    await this.page.clock.setSystemTime(date);
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  /** Retries the click: right after navigating, a nav click can silently no-op. */
  async openAuditLogsTab() {
    await expect(async () => {
      if (!/\/audit-logs$/.test(this.page.url())) {
        await this.auditLogsNavLink.click();
      }
      await expect(this.page, 'On the Audit Logs tab').toHaveURL(/\/audit-logs$/, {
        timeout: 3000,
      });
    }).toPass({ timeout: 15000 });
  }

  /** Events show up ~10s late and the tab doesn't refresh, so reload until they do.
   * Waits for network idle: after hydration the client can swap the box back to empty. */
  async waitForRecordedEvents() {
    await expect(async () => {
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      await expect(this.noEventsHeading, 'No empty state is shown').toBeHidden({
        timeout: 1000,
      });
      await expect(
        this.exportDetailsBox,
        'Export details box is visible (events have been recorded)',
      ).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 60000 });
  }

  async downloadCsv(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadCsvButton.click();
    return downloadPromise;
  }

  async checkAuditLogsNavLinkIsVisible() {
    await expect(
      this.auditLogsNavLink,
      '"Audit Logs" is listed in the Admin Console navigation',
    ).toBeVisible();
  }

  async checkExportDetailsBoxIsVisible() {
    await expect(
      this.exportDetailsBox,
      'Export details box is visible',
    ).toBeVisible();
    await expect(this.noEventsHeading, 'No empty state is shown').toBeHidden();
  }

  async checkExportFileName(orgSlug: string) {
    await expect(
      this.getExportDetailValue(ExportDetail.FileName),
      'Export file name follows audit-log-[org slug].csv',
    ).toHaveText(`audit-log-${orgSlug}.csv`);
  }

  async checkExportFormatIsCsv() {
    await expect(
      this.getExportDetailValue(ExportDetail.Format),
      'Export format is CSV',
    ).toHaveText('CSV, comma-separated, UTF-8');
  }

  async checkExportColumns() {
    await expect(
      this.getExportDetailValue(ExportDetail.Columns),
      'Export details box lists every audit log column, in order',
    ).toHaveText(Object.values(AuditLogColumn).join(', '));
  }

  /** The file name gets a date and "-filtered" while any filter is applied. */
  async checkExportFileNameIsFiltered(orgSlug: string) {
    await expect(
      this.getExportDetailValue(ExportDetail.FileName),
      'Export file name shows it is filtered',
    ).toHaveText(
      new RegExp(`^audit-log-${orgSlug}-\\d{4}-\\d{2}-\\d{2}-filtered\\.csv$`),
    );
  }

  async checkExportFileNameForRange(orgSlug: string, from: Date, to: Date) {
    await expect(
      this.getExportDetailValue(ExportDetail.FileName),
      'Export file name includes the selected range',
    ).toHaveText(this.getRangeFileName(orgSlug, from, to));
  }

  async checkNoMatchingEventsState() {
    await expect(
      this.noMatchingEventsHeading,
      'Empty state says no events match the filters',
    ).toBeVisible();
    await expect(
      this.exportDetailsBox,
      'Export details box is replaced',
    ).toBeHidden();
    await expect(
      this.headerDownloadCsvButton,
      '"Download CSV" button is disabled',
    ).toBeDisabled();
  }

  async checkExportEventTypes(categories: AuditLogEventCategoryName[]) {
    await expect(
      this.getExportDetailValue(ExportDetail.EventTypes),
      'Export details box lists the selected event types',
    ).toHaveText(categories.join(', '));
  }

  async checkExportHasNoEventTypes() {
    await expect(
      this.getExportDetailValue(ExportDetail.EventTypes),
      'Export details box does not mention any event type',
    ).toBeHidden();
  }

  async checkEventTypeGuideLinkIsVisible() {
    await expect(
      this.eventTypeGuideLink,
      '"Download event type guide" link is visible inside the box',
    ).toBeVisible();
  }

  async checkDownloadCsvButtonIsEnabled() {
    await expect(
      this.downloadCsvButton,
      '"Download CSV" button is enabled',
    ).toBeEnabled();
  }

  async checkCsvDownloadedMessageIsVisible() {
    await expect(
      this.csvDownloadedMessage,
      '"The CSV was successfully downloaded!" message is visible',
    ).toBeVisible();
  }

  async checkDownloadedCsv(download: Download, orgSlug: string) {
    expect(download.suggestedFilename(), 'Downloaded file name').toBe(
      `audit-log-${orgSlug}.csv`,
    );
    const { header, rows } = await this.readCsv(download);
    expect(header, 'CSV header lists every audit log column, in order').toBe(
      Object.values(AuditLogColumn).join(','),
    );
    expect(
      rows.some((row) => row.includes(',create-organization,')),
      'CSV holds the create-organization event',
    ).toBe(true);
  }

  /** Later exports may add rows (e.g. the earlier export itself), never lose any. */
  async checkDownloadedCsvMatchesFullExport(
    download: Download,
    fullExport: Download,
    orgSlug: string,
  ) {
    expect(
      download.suggestedFilename(),
      'Downloaded file name is not filtered',
    ).toBe(`audit-log-${orgSlug}.csv`);
    const csv = await this.readCsv(download);
    const full = await this.readCsv(fullExport);
    expect(csv.header, 'CSV header matches the full export').toBe(full.header);
    expect(csv.rows, 'CSV holds every event of the full export').toEqual(
      expect.arrayContaining(full.rows),
    );
  }
}
