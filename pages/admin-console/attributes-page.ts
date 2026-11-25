import { AttributeDialogComponent } from '@pages/admin-console/attribute-dialog-component';
import { AttributePanelComponent } from '@pages/admin-console/attribute-panel-component';
import { DeleteAttributeDialogComponent } from '@pages/admin-console/delete-attribute-dialog-component';
import { BasePage } from '@pages/base-page';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Column position (0-indexed) in the Attributes tab's table, for typed use with
 * the AttributesPage checks instead of a magic number.
 */
export enum AttributesTableColumn {
  Attribute = 0,
  UsedIn = 1,
  Created = 2,
  People = 3,
}

/** The items of an attribute row's options menu ("⋯"). */
export const AttributeOption = {
  Edit: 'Edit',
  Delete: 'Delete',
} as const;

export type AttributeOptionName =
  (typeof AttributeOption)[keyof typeof AttributeOption];

/**
 * Covers the Admin Console's Attributes tab
 * (/admin-console/organization/{slug}/{id}/attributes): org-level labels such as
 * "Legal" that members hold, used to narrow Advanced Permissions ("Who are" /
 * "Except"). Attributes have no Penpot API, so tests create and assign them here.
 */
export class AttributesPage extends BasePage {
  readonly newAttributeButton: Locator;
  readonly attributesTable: Locator;
  readonly attributeRows: Locator;
  readonly createDialog: AttributeDialogComponent;
  readonly editDialog: AttributeDialogComponent;
  readonly panel: AttributePanelComponent;

  constructor(page: Page) {
    super(page);
    this.attributesTable = page.getByRole('table', { name: 'Attributes' });
    // The second rowgroup is the <tbody>, the list's own scroll container
    this.attributeRows = this.attributesTable
      .getByRole('rowgroup')
      .nth(1)
      .getByRole('row');
    this.panel = new AttributePanelComponent(
      page,
      page.getByRole('complementary', { name: / attribute$/ }),
    );
    // Shown twice when the org has no attributes (header and empty state):
    // take the header one, next to the section's description.
    this.newAttributeButton = page
      .getByText('Classify org members to apply fine-grained permissions')
      .locator('..')
      .getByRole('button', { name: 'New attribute' });
    this.createDialog = new AttributeDialogComponent(
      page,
      'Create an attribute',
      'Create attribute',
    );
    this.editDialog = new AttributeDialogComponent(
      page,
      'Edit attribute',
      'Save changes',
    );
  }

  /**
   * Returns a row's options menu ("⋯"), open once its button is clicked.
   * @param name Attribute name, e.g. 'Legal'.
   * @returns The "Attribute options for <name>" menu.
   */
  private getAttributeOptionsMenu(name: string): Locator {
    return this.page.getByRole('menu', { name: `Attribute options for ${name}` });
  }

  /**
   * Returns an attribute's row in the attributes table. Its first cell holds the
   * name followed by the description, so the row is matched by the name's text.
   * @param name Attribute name, e.g. 'Legal'.
   * @returns The attribute's row.
   */
  private getAttributeRow(name: string): Locator {
    return this.attributesTable
      .getByRole('row')
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  /**
   * Opens an attribute's panel (see `panel`) by clicking its row, or shows that
   * attribute in the panel if it's already open on another one.
   * @param name Attribute name, e.g. 'Legal'.
   */
  async openAttribute(name: string) {
    // Exact: a string name matches substrings, so 'Legal attribute' would also
    // match an open 'Not Legal attribute' panel and skip the click
    const namedPanel = this.page.getByRole('complementary', {
      name: `${name} attribute`,
      exact: true,
    });
    // A click before the page hydrates is dropped: click again until it opens
    await expect(async () => {
      if (!(await namedPanel.isVisible())) {
        await this.getAttributeRow(name).click();
      }
      await expect(namedPanel, `"${name}" panel is open`).toBeVisible({
        timeout: 2000,
      });
    }).toPass({ timeout: 15000 });
  }

  /**
   * Opens the "Create an attribute" dialog from "New attribute" and waits for
   * its name field to be focused.
   */
  async openCreateAttributeDialog() {
    // A click before the page hydrates is dropped: click again until the dialog opens
    await expect(async () => {
      if (!(await this.createDialog.nameField.isVisible())) {
        await this.newAttributeButton.click();
      }
      await expect(
        this.createDialog.nameField,
        'Attribute name field is focused',
      ).toBeFocused({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  }

  /**
   * Opens a row's options menu ("⋯"), whose button only shows while the row is
   * hovered.
   * @param name Attribute name, e.g. 'Legal'.
   */
  async openAttributeOptions(name: string) {
    const menu = this.getAttributeOptionsMenu(name);
    // A click right after the list renders, or a toast closing, can be dropped
    await expect(async () => {
      if (!(await menu.isVisible())) {
        await this.getAttributeRow(name).hover();
        await this.getAttributeRow(name)
          .getByRole('button', { name: `Attribute options for ${name}` })
          .click({ timeout: 2000 });
      }
      await expect(menu, `"${name}" options menu is open`).toBeVisible({
        timeout: 2000,
      });
    }).toPass({ timeout: 15000 });
  }

  /**
   * Opens "Edit attribute" from a row's options menu, with its fields filled in.
   * @param name Attribute name, e.g. 'Contractors'.
   */
  async openEditAttributeDialog(name: string) {
    await this.openAttributeOptions(name);
    await this.getAttributeOptionsMenu(name)
      .getByRole('menuitem', { name: AttributeOption.Edit })
      .click();
    await expect(this.editDialog.nameField, 'Name field shows the name').toHaveValue(
      name,
    );
  }

  /**
   * Edits an attribute from its options menu and saves, waiting for the dialog
   * to close.
   * @param name Current name, e.g. 'Contractors'.
   * @param changes The new name and/or description; what's left out is kept.
   */
  async editAttribute(
    name: string,
    changes: { name?: string; description?: string },
  ) {
    await this.openEditAttributeDialog(name);
    if (changes.name !== undefined) await this.editDialog.typeName(changes.name);
    if (changes.description !== undefined) {
      await this.editDialog.typeDescription(changes.description);
    }
    await this.editDialog.clickSubmit();
    await this.editDialog.checkIsHidden();
  }

  /**
   * Clicks "Delete" in a row's options menu. It deletes straight away when
   * nobody holds the attribute and no control uses it; otherwise it opens the
   * 'Delete "<name>"?' dialog.
   * @param name Attribute name, e.g. 'Old pilot'.
   * @returns The delete dialog, for the cases that open it.
   */
  async clickDeleteAttribute(name: string): Promise<DeleteAttributeDialogComponent> {
    await this.openAttributeOptions(name);
    await this.getAttributeOptionsMenu(name)
      .getByRole('menuitem', { name: AttributeOption.Delete })
      .click();
    return new DeleteAttributeDialogComponent(this.page, name);
  }

  /**
   * Checks a row's open options menu offers exactly these items.
   * @param name Attribute name, e.g. 'Contractors'.
   * @param items Expected items, in order, e.g. [AttributeOption.Edit, AttributeOption.Delete].
   */
  async checkAttributeOptionsMenuItems(name: string, items: AttributeOptionName[]) {
    await expect(
      this.getAttributeOptionsMenu(name).getByRole('menuitem'),
      `"${name}" options menu offers [${items.join(', ')}]`,
    ).toHaveText(items);
  }

  /**
   * Checks the message the Admin Console shows at the bottom after a change.
   * @param message Its text, e.g. '"Old pilot" deleted'.
   */
  async checkMessageIsVisible(message: string) {
    await expect(
      this.page.getByText(message, { exact: true }),
      `The message "${message}" is shown`,
    ).toBeVisible();
  }

  /**
   * Checks an attribute is listed, with its description when given.
   * @param name Attribute name, matched with its exact case, e.g. 'Junior'.
   * @param description Expected description under the name.
   */
  async checkAttributeIsListed(name: string, description?: string) {
    const row = this.getAttributeRow(name);
    await expect(row, `"${name}" is listed`).toBeVisible();
    if (description) {
      await expect(
        row.getByText(description, { exact: true }),
        `"${name}" shows the description "${description}"`,
      ).toBeVisible();
    }
  }

  /**
   * Checks no attribute with this exact name is listed.
   * @param name Attribute name, e.g. 'Contractors'.
   */
  async checkAttributeIsNotListed(name: string) {
    await expect(this.getAttributeRow(name), `"${name}" is not listed`).toHaveCount(
      0,
    );
  }

  /**
   * Creates an attribute from "New attribute", which opens the "Create an
   * attribute" dialog with its name field focused, and closes the dialog again.
   * @param name Attribute name, e.g. 'Legal'.
   * @param description Optional description, e.g. 'Legal department'.
   */
  async createAttribute(name: string, description?: string) {
    await this.openCreateAttributeDialog();
    await this.createDialog.typeName(name);
    if (description) await this.createDialog.typeDescription(description);
    await this.createDialog.clickSubmit();
    await expect(
      this.getAttributeRow(name),
      `Attribute "${name}" is listed`,
    ).toBeVisible();
    await this.createDialog.checkIsHidden();
  }

  /**
   * Scrolls the attributes list to its top with the mouse wheel, until the
   * first attribute is in view.
   */
  async scrollAttributesListToTop() {
    await this.attributeRows.first().hover();
    await this.page.mouse.wheel(0, -10000);
    await expect(
      this.attributeRows.first(),
      'First attribute is in view after scrolling to the top',
    ).toBeInViewport();
  }

  /**
   * Scrolls the attributes list to its bottom with the mouse wheel, until the
   * last attribute is in view.
   */
  async scrollAttributesListToBottom() {
    await this.attributeRows.first().hover();
    await this.page.mouse.wheel(0, 10000);
    await expect(
      this.attributeRows.last(),
      'Last attribute is in view after scrolling to the bottom',
    ).toBeInViewport();
  }

  /**
   * Checks the names in the attributes list, in the order they're shown.
   * @param names Expected names, top to bottom, e.g. ['Legal', 'Ops'].
   */
  async checkAttributeNames(names: string[]) {
    // Each row's Attribute cell: getByRole('cell').first() would be the first
    // cell of the whole list. It holds only the name when there's no description
    await expect(
      this.attributeRows.locator('td:first-child'),
      `Attributes listed in this order: ${names.join(', ')}`,
    ).toHaveText(names);
  }

  /**
   * Checks an attribute's row is scrolled out of the list's visible area.
   * @param name Attribute name, e.g. 'UX'.
   */
  async checkAttributeIsOutOfView(name: string) {
    await expect(
      this.getAttributeRow(name),
      `"${name}" is out of view`,
    ).not.toBeInViewport();
  }

  /**
   * Checks a just-created attribute was scrolled into view and is highlighted.
   * The highlight only lasts about two seconds, so call it right after creating.
   * @param name Attribute name, e.g. 'Zebra team'.
   */
  async checkNewAttributeIsInViewAndHighlighted(name: string) {
    const row = this.getAttributeRow(name);
    // The highlight has no role or state: it's this background class on the
    // <tr>, which hover:/focus-visible: variants of it don't match
    await expect(row, `"${name}" is highlighted`).toHaveClass(
      /(^|\s)bg-ds-background-surface-base-subtle(\s|$)/,
    );
    await expect(row, `"${name}" is scrolled into view`).toBeInViewport();
  }

  /**
   * Opens an attribute's panel, adds members to it from "Add people" and closes
   * the panel again.
   * @param name Attribute name, e.g. 'Legal'.
   * @param people Display names of the organization members to add.
   */
  async addPeopleToAttribute(name: string, people: string[]) {
    await this.openAttribute(name);
    await this.panel.openAddPeople();
    for (const person of people) {
      await this.panel.addPeople.selectMember(person);
    }
    await this.panel.addPeople.close();
    await this.panel.checkPeopleCount(people.length);
    await this.panel.close();
  }

  /**
   * Checks how many members hold an attribute, in the table's People column.
   * @param name Attribute name, e.g. 'Legal'.
   * @param people Expected number of members.
   */
  async checkAttributePeopleCount(name: string, people: number) {
    await expect(
      this.getAttributeRow(name).getByRole('cell').nth(AttributesTableColumn.People),
      `"${name}" shows ${people} under People`,
    ).toHaveText(String(people));
  }

  /**
   * Checks which row of the table is highlighted as the one open in the panel.
   * The highlight has no ARIA state, only a background class.
   * @param name Attribute name, e.g. 'Legal', or null for no row highlighted.
   */
  async checkSelectedAttributeRow(name: string | null) {
    const selectedRows = this.attributeRows.and(
      this.page.locator('.bg-ds-background-surface-base-subtle'),
    );
    if (name === null) {
      await expect(selectedRows, 'No attribute row is highlighted').toHaveCount(0);
      return;
    }
    await expect(selectedRows, 'One attribute row is highlighted').toHaveCount(1);
    await expect(
      this.getAttributeRow(name),
      `The highlighted row is "${name}"`,
    ).toHaveClass(/(^|\s)bg-ds-background-surface-base-subtle(\s|$)/);
  }
}
