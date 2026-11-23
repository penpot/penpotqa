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
} as const;

export type ExportDetailName = (typeof ExportDetail)[keyof typeof ExportDetail];

/** Admin Console > Audit Logs tab: export details box and CSV download. */
export class AuditLogsPage extends BasePage {
  readonly auditLogsNavLink: Locator;
  readonly noEventsHeading: Locator;

  // Scoped to the box: the section header has a second "Download CSV" button.
  readonly exportDetailsBox: Locator;
  readonly eventTypeGuideLink: Locator;
  readonly downloadCsvButton: Locator;

  readonly csvDownloadedMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.auditLogsNavLink = page
      .getByRole('navigation', { name: 'Organization navigation' })
      .getByRole('link', { name: 'Audit Logs' });
    this.noEventsHeading = page.getByRole('heading', {
      name: 'No events recorded yet',
    });

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
  }

  private getExportDetailValue(detail: ExportDetailName): Locator {
    return this.exportDetailsBox
      .locator('div')
      .filter({ has: this.page.getByRole('term').filter({ hasText: detail }) })
      .getByRole('definition');
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
    const [header, ...rows] = (await readFile(await download.path(), 'utf8'))
      .trim()
      .split(/\r?\n/);
    expect(header, 'CSV header lists every audit log column, in order').toBe(
      Object.values(AuditLogColumn).join(','),
    );
    expect(
      rows.some((row) => row.includes(',create-organization,')),
      'CSV holds the create-organization event',
    ).toBe(true);
  }
}
