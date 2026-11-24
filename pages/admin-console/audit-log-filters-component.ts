import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Event type filter categories, in the order the filter lists them. */
export const AuditLogEventCategory = {
  Authentication: 'Authentication',
  UserAndAccount: 'User and account management',
  TeamAndOrganization: 'Team and organization management',
  AdvancedPermissions: 'Advanced permissions',
  SsoConfiguration: 'SSO configuration',
  FilesAndProjects: 'Files and projects',
  ApiAndPlugins: 'API and plugin events',
  AuditLog: 'Audit log',
} as const;

export type AuditLogEventCategoryName =
  (typeof AuditLogEventCategory)[keyof typeof AuditLogEventCategory];

/** The Filters panel of the Audit Logs tab: date range and event type filters. */
export class AuditLogFiltersComponent extends BaseComponent {
  readonly filtersButton: Locator;
  readonly dateRangeButton: Locator;
  readonly clearDateRangeButton: Locator;
  readonly eventTypeButton: Locator;
  readonly clearEventTypeButton: Locator;

  // Popovers rendered outside the panel.
  readonly eventTypeDialog: Locator;
  readonly eventTypeCheckboxes: Locator;
  readonly eventTypeSelectionCount: Locator;
  readonly todayCalendarButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.filtersButton = root.getByRole('button', { name: 'Filters', exact: true });
    // Names gain the applied value, e.g. "Calendar Date range is 24 Nov".
    this.dateRangeButton = root.getByRole('button', {
      name: /^Calendar Date range/,
    });
    this.clearDateRangeButton = root.getByRole('button', {
      name: 'Clear date range',
    });
    this.eventTypeButton = root.getByRole('button', { name: /^Event type/ });
    this.clearEventTypeButton = root.getByRole('button', {
      name: 'Clear Event type filter',
    });

    this.eventTypeDialog = page.getByRole('dialog', { name: 'Event type' });
    this.eventTypeCheckboxes = this.eventTypeDialog.getByRole('checkbox');
    this.eventTypeSelectionCount =
      this.eventTypeDialog.getByText(/^(None|\d+) filtered$/);
    this.todayCalendarButton = page
      .getByRole('dialog', { name: /^Calendar Date range/ })
      .getByRole('button', { name: /^Today, / });
  }

  private getCategoryCheckbox(category: AuditLogEventCategoryName): Locator {
    return this.eventTypeDialog.getByRole('checkbox', {
      name: category,
      exact: true,
    });
  }

  async openFilters() {
    if ((await this.filtersButton.getAttribute('aria-expanded')) !== 'true') {
      await this.filtersButton.click();
    }
    await expect(this.eventTypeButton, 'Filters panel is open').toBeVisible();
  }

  async openEventTypeFilter() {
    await this.eventTypeButton.click();
    await expect(this.eventTypeDialog, 'Event type filter is open').toBeVisible();
  }

  async closeEventTypeFilter() {
    await this.page.keyboard.press('Escape');
    await expect(this.eventTypeDialog, 'Event type filter is closed').toBeHidden();
  }

  /** Checks or unchecks a category in the open Event type filter. */
  async selectCategory(category: AuditLogEventCategoryName, selected = true) {
    const checkbox = this.getCategoryCheckbox(category);
    if ((await checkbox.isChecked()) !== selected) {
      // The styled label covers the checkbox input, so click its text.
      await this.eventTypeDialog.getByText(category, { exact: true }).click();
    }
    await expect(checkbox, `"${category}" checked: ${selected}`).toBeChecked({
      checked: selected,
    });
  }

  /** Orgs created by the test only have events today, the one selectable day. */
  async setDateRangeToToday() {
    await this.dateRangeButton.click();
    await this.todayCalendarButton.click();
    await this.todayCalendarButton.click();
    await expect(this.clearDateRangeButton, 'Date range is set').toBeVisible();
  }

  async clearEventTypeFilter() {
    await this.clearEventTypeButton.click();
    await expect(
      this.clearEventTypeButton,
      'Event type filter is cleared',
    ).toBeHidden();
  }

  async clearDateRange() {
    await this.clearDateRangeButton.click();
    await expect(this.clearDateRangeButton, 'Date range is cleared').toBeHidden();
  }

  async checkEventTypeCategories() {
    const categories = Object.values(AuditLogEventCategory);
    await expect(
      this.eventTypeCheckboxes,
      'Event type filter offers every category',
    ).toHaveCount(categories.length);
    for (const [index, category] of categories.entries()) {
      await expect(
        this.eventTypeCheckboxes.nth(index),
        `Event type category #${index + 1} is "${category}"`,
      ).toHaveAccessibleName(category);
    }
  }

  /** Checks the open Event type filter: only `categories` are checked. */
  async checkSelectedCategories(categories: AuditLogEventCategoryName[]) {
    for (const category of Object.values(AuditLogEventCategory)) {
      const selected = categories.includes(category);
      await expect(
        this.getCategoryCheckbox(category),
        `"${category}" checked: ${selected}`,
      ).toBeChecked({ checked: selected });
    }
    await expect(
      this.eventTypeSelectionCount,
      'Event type filter shows how many categories are filtered',
    ).toHaveText(
      categories.length ? `${categories.length} filtered` : 'None filtered',
    );
  }

  async checkDateRangeIsToday() {
    const today = await this.page.evaluate(() =>
      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    );
    await expect(this.dateRangeButton, 'Date range is today').toHaveAccessibleName(
      `Calendar Date range is ${today}`,
    );
  }

  async checkNoDateRange() {
    await expect(this.dateRangeButton, 'No date range is set').toHaveAccessibleName(
      'Calendar Date range',
    );
    await expect(this.clearDateRangeButton, 'No date range to clear').toBeHidden();
  }
}
