import { AttributePanelComponent } from '@pages/admin-console/attribute-panel-component';
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
  readonly createAttributeDialog: Locator;
  readonly attributeNameField: Locator;
  readonly createAttributeButton: Locator;
  readonly duplicateNameError: Locator;
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
    this.createAttributeDialog = page.getByRole('dialog', {
      name: 'Create an attribute',
    });
    this.attributeNameField = this.createAttributeDialog.getByRole('textbox', {
      name: 'Attribute name',
    });
    this.createAttributeButton = this.createAttributeDialog.getByRole('button', {
      name: 'Create attribute',
    });
    this.duplicateNameError = this.createAttributeDialog.getByText(
      'An attribute with this name already exists.',
    );
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
    const namedPanel = this.page.getByRole('complementary', {
      name: `${name} attribute`,
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
      if (!(await this.attributeNameField.isVisible())) {
        await this.newAttributeButton.click();
      }
      await expect(
        this.attributeNameField,
        'Attribute name field is focused',
      ).toBeFocused({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  }

  /**
   * Types a name in the open "Create an attribute" dialog, replacing the
   * current one.
   * @param name Attribute name, e.g. 'Ops'.
   */
  async typeAttributeName(name: string) {
    await this.attributeNameField.fill(name);
  }

  /**
   * Clicks "Create attribute" in the open dialog. It doesn't wait for the
   * attribute to be created, so it also drives names that get rejected.
   */
  async clickCreateAttributeButton() {
    await this.createAttributeButton.click();
  }

  /**
   * Creates an attribute from "New attribute", which opens the "Create an
   * attribute" dialog with its name field focused, and closes the dialog again.
   * @param name Attribute name, e.g. 'Legal'.
   * @param description Optional description, e.g. 'Legal department'.
   */
  async createAttribute(name: string, description?: string) {
    await this.openCreateAttributeDialog();
    await this.typeAttributeName(name);
    if (description) {
      await this.createAttributeDialog
        .getByRole('textbox', { name: 'Description' })
        .fill(description);
    }
    await this.clickCreateAttributeButton();
    await expect(
      this.getAttributeRow(name),
      `Attribute "${name}" is listed`,
    ).toBeVisible();
    // In case the dialog stays open after creating (on PRE it closes on its own)
    await this.page.keyboard.press('Escape');
    await this.checkCreateAttributeDialogIsHidden();
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
   * Checks the "Create an attribute" dialog rejects a name already in use: the
   * error under the name, the typed name kept and "Create attribute" disabled.
   * @param name Name typed in the dialog, e.g. 'OPS'.
   */
  async checkDuplicateNameErrorIsVisible(name: string) {
    await expect(
      this.duplicateNameError,
      'Duplicate name error is visible',
    ).toBeVisible();
    await expect(this.attributeNameField, `Name field keeps "${name}"`).toHaveValue(
      name,
    );
    await expect(
      this.createAttributeButton,
      '"Create attribute" is disabled',
    ).toBeDisabled();
  }

  /**
   * Checks the duplicate name error is gone and "Create attribute" is enabled
   * again, as happens as soon as the name is edited.
   */
  async checkDuplicateNameErrorIsHidden() {
    await expect(
      this.duplicateNameError,
      'Duplicate name error is hidden',
    ).toBeHidden();
    await expect(
      this.createAttributeButton,
      '"Create attribute" is enabled',
    ).toBeEnabled();
  }

  /** Checks the "Create an attribute" dialog closed on its own after creating. */
  async checkCreateAttributeDialogIsHidden() {
    await expect(
      this.createAttributeDialog,
      '"Create an attribute" dialog is closed',
    ).toBeHidden();
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
