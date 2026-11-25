import { AddPeopleDialogComponent } from '@pages/admin-console/add-people-dialog-component';
import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** A control that points at an attribute, as the panel's "Used by" lists it. */
export type AttributeUsage = {
  /** The control, e.g. 'Send invitations'. */
  control: string;
  /** Where the control lives, e.g. 'Advanced permissions'. */
  area: string;
};

/** A person who holds an attribute, as the panel's People table lists them. */
export type AttributeHolder = { name: string; email: string };

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The side panel of the Admin Console's Attributes tab, opened by clicking an
 * attribute's row (`AttributesPage.openAttribute()`): the attribute's name and
 * description, the controls that use it ("Used by") and the people who hold it
 * ("People"), with "Add people" and a "Remove" button per person. Clicking
 * another row shows that attribute in the same panel.
 */
export class AttributePanelComponent extends BaseComponent {
  readonly closeButton: Locator;
  readonly usedBySection: Locator;
  readonly addPeopleButton: Locator;
  /** The data rows of the People table (its header row has no cells). */
  readonly people: Locator;
  readonly addPeople: AddPeopleDialogComponent;

  /**
   * @param page - The Admin Console page.
   * @param root - The panel, named "<attribute> attribute".
   */
  constructor(page: Page, root: Locator) {
    super(page, root);
    this.closeButton = root.getByRole('button', { name: 'Close attribute' });
    this.usedBySection = root.getByRole('region', { name: 'Used by' });
    this.addPeopleButton = root.getByRole('button', { name: 'Add people' });
    this.people = root
      .getByRole('table', { name: /^People who hold / })
      .getByRole('row')
      .filter({ has: page.getByRole('cell') });
    this.addPeople = new AddPeopleDialogComponent(
      page,
      page.getByRole('dialog', { name: /^Add people to / }),
    );
  }

  /**
   * Returns a person's row in the People table.
   * @param name Person's display name, e.g. 'User2'.
   * @returns The row, whose name starts with the person's name and email.
   */
  private getPerson(name: string): Locator {
    return this.root.getByRole('row', {
      name: new RegExp(`^${escapeRegExp(name)} `),
    });
  }

  /**
   * Returns the "Remove" button of a person's row.
   * @param name Person's display name, e.g. 'User2'.
   * @returns The button, named "Remove <name> from <attribute>".
   */
  private getRemoveButton(name: string): Locator {
    return this.getPerson(name).getByRole('button', {
      name: new RegExp(`^Remove ${escapeRegExp(name)} from `),
    });
  }

  /** Opens the "Add people" dialog (see `addPeople`). */
  async openAddPeople() {
    await this.addPeopleButton.click();
    await expect(this.addPeople.root, '"Add people" dialog is open').toBeVisible();
  }

  /**
   * Hovers a person's row, which shows its "Remove" button.
   * @param name Person's display name, e.g. 'User2'.
   */
  async hoverPerson(name: string) {
    await this.getPerson(name).hover();
  }

  /**
   * Removes a person with their row's "Remove" button and waits for the row to
   * leave the table. Nothing asks to confirm, so a confirmation would make
   * this fail.
   * @param name Person's display name, e.g. 'User2'.
   */
  async removePerson(name: string) {
    await this.hoverPerson(name);
    await this.getRemoveButton(name).click();
    await expect(
      this.getPerson(name),
      `"${name}" left the People list`,
    ).toBeHidden();
  }

  /** Closes the panel with its ✕. */
  async close() {
    await this.closeButton.click();
    await expect(this.root, 'Attribute panel is closed').toBeHidden();
  }

  /**
   * Checks the panel's header shows the attribute's name and description as
   * plain text, not as fields to edit.
   * @param name Attribute name, e.g. 'Legal'.
   * @param description Its description, e.g. 'Legal department' (default: not
   * checked).
   */
  async checkHeader(name: string, description?: string) {
    // The header has no role or label of its own
    const header = this.root.locator('header');
    await expect(
      header.getByRole('heading', { name, exact: true }),
      `Panel header shows "${name}"`,
    ).toBeVisible();
    if (description) {
      await expect(
        header.getByText(description, { exact: true }),
        `Panel header shows "${description}"`,
      ).toBeVisible();
    }
    await expect(
      header.getByRole('textbox'),
      'Panel header has nothing to edit',
    ).toHaveCount(0);
  }

  /**
   * Checks the "Used by" section: the controls that point at the attribute,
   * each with where it lives, or "No control points at this attribute yet."
   * @param usages The controls expected, in order; empty for none.
   */
  async checkUsedBy(usages: AttributeUsage[]) {
    const noUsage = this.usedBySection.getByText(
      'No control points at this attribute yet.',
      { exact: true },
    );
    const items = this.usedBySection.getByRole('listitem');
    if (!usages.length) {
      await expect(noUsage, '"Used by" reads "No control points…"').toBeVisible();
      await expect(items, '"Used by" lists no control').toHaveCount(0);
      return;
    }
    await expect(
      items,
      `"Used by" lists ${usages.map((u) => `"${u.control}"`).join(', ')}`,
    ).toHaveText(
      usages.map(
        ({ control, area }) =>
          new RegExp(`^${escapeRegExp(control)}\\s*${escapeRegExp(area)}$`),
      ),
    );
  }

  /**
   * Checks the number next to "People".
   * @param count Expected number of people who hold the attribute.
   */
  async checkPeopleCount(count: number) {
    await expect(
      this.root.getByRole('heading', { name: `People ${count}`, exact: true }),
      `"People" shows ${count}`,
    ).toBeVisible();
  }

  /**
   * Checks the People table lists exactly these people, each with their name,
   * email and when they were added (the "Added" column).
   * @param holders The people expected, in any order.
   */
  async checkPeople(holders: AttributeHolder[]) {
    await expect(this.people, `People lists ${holders.length} people`).toHaveCount(
      holders.length,
    );
    for (const { name, email } of holders) {
      const cells = this.getPerson(name).getByRole('cell');
      await expect(cells.first(), `People lists "${name}"`).toContainText(name);
      await expect(cells.first(), `People shows "${name}"'s email`).toContainText(
        email,
      );
      await expect(cells.nth(1), `People shows when "${name}" was added`).toHaveText(
        /\S/,
      );
    }
  }

  /**
   * Checks the People section's empty state: "Nobody holds this attribute
   * yet.", the "Add people" button and no table.
   */
  async checkPeopleEmptyStateIsVisible() {
    await expect(
      this.root.getByText('Nobody holds this attribute yet.', { exact: true }),
      'People reads "Nobody holds this attribute yet."',
    ).toBeVisible();
    await expect(this.addPeopleButton, '"Add people" is visible').toBeVisible();
    await expect(this.people, 'People lists nobody').toHaveCount(0);
  }

  /**
   * Checks a person's "Remove" button is shown: it's in the row all along, but
   * transparent until the row is hovered or focused.
   * @param name Person's display name, e.g. 'User2'.
   */
  async checkRemoveButtonIsVisible(name: string) {
    await expect(
      this.getRemoveButton(name),
      `"Remove" is shown on "${name}"'s row`,
    ).toHaveCSS('opacity', '1');
  }

  /**
   * Checks the message shown when a person loses the attribute.
   * @param name Person's display name, e.g. 'User5'.
   * @param attribute Attribute name, e.g. 'Legal'.
   */
  async checkRemovedMessageIsVisible(name: string, attribute: string) {
    // Rendered outside the panel, as plain text with no role
    await expect(
      this.page.getByText(`${name} removed from ${attribute}.`, { exact: true }),
      `Message "${name} removed from ${attribute}." is shown`,
    ).toBeVisible();
  }
}
