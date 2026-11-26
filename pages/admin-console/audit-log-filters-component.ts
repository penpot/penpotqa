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
  readonly calendarDialog: Locator;
  readonly calendarMonthHeading: Locator;
  readonly previousMonthButton: Locator;
  readonly nextMonthButton: Locator;
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
    this.calendarDialog = page.getByRole('dialog', { name: /^Calendar Date range/ });
    // The month view; the dialog has a second "Next" button outside it.
    const calendar = this.calendarDialog.getByRole('application');
    this.calendarMonthHeading = calendar.getByRole('heading', { level: 2 });
    const monthNavigation = calendar.getByRole('banner');
    this.previousMonthButton = monthNavigation.getByRole('button', {
      name: 'Previous',
    });
    this.nextMonthButton = monthNavigation.getByRole('button', { name: 'Next' });
    this.todayCalendarButton = calendar
      .getByRole('grid')
      .getByRole('button', { name: /^Today, / });
  }

  /**
   * Returns a category's checkbox in the open Event type filter.
   * @param category Category name, e.g. 'Audit log'.
   * @returns The category's checkbox.
   */
  private getCategoryCheckbox(category: AuditLogEventCategoryName): Locator {
    return this.eventTypeDialog.getByRole('checkbox', {
      name: category,
      exact: true,
    });
  }

  /**
   * Returns a day button of the month grid on show, e.g. grid "November 2026" >
   * button "Wednesday, 25 November 2026 selected, First available date".
   * @param date Day to find; its month must be the one on show.
   * @returns The day's button in the calendar grid.
   */
  private getCalendarDay(date: Date): Locator {
    const label = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return this.calendarDialog
      .getByRole('grid', { name: this.getMonthLabel(date) })
      .getByRole('button', { name: new RegExp(`(^|\\s)${label}(\\D|$)`) });
  }

  /**
   * Returns a date's month as the calendar names it.
   * @param date Any day of the month.
   * @returns The month and year, e.g. 'November 2026'.
   */
  private getMonthLabel(date: Date) {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  /**
   * Clicks a day in the open calendar, paging to its month first if needed.
   * @param date Day to click; must be a selectable day.
   */
  private async clickCalendarDay(date: Date) {
    const month = this.getMonthLabel(date);
    // Page through months until the day's month shows, e.g. "December 2026" → November.
    for (let i = 0; i < 12; i++) {
      const shown = await this.calendarMonthHeading.innerText();
      if (shown === month) break;
      const isEarlier = date < new Date(`1 ${shown}`);
      await (isEarlier ? this.previousMonthButton : this.nextMonthButton).click();
      await expect(this.calendarMonthHeading).not.toHaveText(shown);
    }
    await expect(this.calendarMonthHeading, `Calendar shows ${month}`).toHaveText(
      month,
    );
    await this.getCalendarDay(date).click();
  }

  /** Opens the Filters panel, unless it's already open. */
  async openFilters() {
    if ((await this.filtersButton.getAttribute('aria-expanded')) !== 'true') {
      await this.filtersButton.click();
    }
    await expect(this.eventTypeButton, 'Filters panel is open').toBeVisible();
  }

  /** Opens the Event type filter popover. */
  async openEventTypeFilter() {
    await this.eventTypeButton.click();
    await expect(this.eventTypeDialog, 'Event type filter is open').toBeVisible();
  }

  /** Closes the Event type filter popover with Escape. */
  async closeEventTypeFilter() {
    await this.page.keyboard.press('Escape');
    await expect(this.eventTypeDialog, 'Event type filter is closed').toBeHidden();
  }

  /**
   * Checks or unchecks a category in the open Event type filter.
   * @param category Category name, e.g. 'Files and projects'.
   * @param selected True (default) to check it, false to uncheck it.
   */
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

  /**
   * Sets the date range filter to today only. Orgs created by the test only have
   * events today, the one selectable day.
   */
  async setDateRangeToToday() {
    await this.dateRangeButton.click();
    await this.todayCalendarButton.click();
    await this.todayCalendarButton.click();
    await expect(this.clearDateRangeButton, 'Date range is set').toBeVisible();
  }

  /**
   * Sets the date range filter by clicking its first and last day in the calendar.
   * @param from First day of the range.
   * @param to Last day of the range; the same as `from` for a single day.
   */
  async setDateRange(from: Date, to: Date) {
    await this.dateRangeButton.click();
    await this.clickCalendarDay(from);
    await this.clickCalendarDay(to);
    await expect(this.clearDateRangeButton, 'Date range is set').toBeVisible();
  }

  /** Clears the Event type filter with its chip's clear button. */
  async clearEventTypeFilter() {
    await this.clearEventTypeButton.click();
    await expect(
      this.clearEventTypeButton,
      'Event type filter is cleared',
    ).toBeHidden();
  }

  /** Clears the date range filter with its chip's clear button. */
  async clearDateRange() {
    await this.clearDateRangeButton.click();
    await expect(this.clearDateRangeButton, 'Date range is cleared').toBeHidden();
  }

  /** Checks that the open Event type filter offers every category, in order. */
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

  /**
   * Checks the open Event type filter: only the given categories are checked, and
   * the counter reads "N filtered" (or "None filtered").
   * @param categories Categories expected to be checked; empty for none.
   */
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

  /** Checks that the date range filter is set to today only. */
  async checkDateRangeIsToday() {
    const today = await this.page.evaluate(() =>
      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    );
    await expect(this.dateRangeButton, 'Date range is today').toHaveAccessibleName(
      `Calendar Date range is ${today}`,
    );
  }

  /** Checks that the Filters panel shows the date range picker. */
  async checkDateRangePickerIsVisible() {
    await expect(this.dateRangeButton, 'Date range picker is visible').toBeVisible();
  }

  /** Checks that no date range is set. */
  async checkNoDateRange() {
    await expect(this.dateRangeButton, 'No date range is set').toHaveAccessibleName(
      'Calendar Date range',
    );
    await expect(this.clearDateRangeButton, 'No date range to clear').toBeHidden();
  }
}
