import { type Locator, type Page, expect } from '@playwright/test';
import { BaseComponent } from '@pages/base-component';

export class SetsComponent {
  readonly page: Page;
  readonly baseComponent: BaseComponent;
  readonly createOneSetButton: Locator;
  readonly createSetButton: Locator;
  readonly setsNameInput: Locator;
  readonly setName: Locator;
  readonly groupSetName: Locator;
  readonly renameContextMenuOption: Locator;
  readonly addSetToGroupOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseComponent = new BaseComponent(page);

    // token sets locators
    this.createOneSetButton = page
      .locator('[class*="empty-sets-wrapper"]')
      .getByText('Create one.');
    this.createSetButton = page.getByRole('button', { name: 'Add set' });
    this.setsNameInput = page.getByPlaceholder("Enter name (use '/' for groups)");
    this.setName = page.getByTestId('tokens-set-item');
    this.groupSetName = page.getByTestId('tokens-set-group-item');
    this.renameContextMenuOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Rename' });
    this.addSetToGroupOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Add set to this group' });
  }

  async createSetViaLink(name: string) {
    await this.createOneSetButton.click();
    await this.setsNameInput.fill(name);
    await this.baseComponent.clickOnEnter();
  }

  async createSetViaButton(name: string) {
    await this.createSetButton.click();
    await this.setsNameInput.fill(name);
    await this.baseComponent.clickOnEnter();
  }

  async checkFirstSetName(text: string) {
    await expect(this.setName.first(), `First Set Name is ${text}`).toHaveText(text);
  }

  async isSetNameVisible(text: string, visible = true) {
    visible
      ? await expect(this.setName.filter({ hasText: text })).toHaveCount(1)
      : await expect(this.setName.filter({ hasText: text })).toHaveCount(0);
  }

  async isGroupSetNameVisible(text: string, visible = true) {
    visible
      ? await expect(this.groupSetName.filter({ hasText: text })).toHaveCount(1)
      : await expect(this.groupSetName.filter({ hasText: text })).toHaveCount(0);
  }

  async clickOnSetCheckboxByName(setName: string) {
    await this.setName.filter({ hasText: setName }).getByRole('checkbox').click();
  }

  async rightClickOnSetByName(setName: string) {
    await this.setName.filter({ hasText: setName }).click({ button: 'right' });
  }

  async rightClickOnSetsGroupByName(setName: string) {
    await this.groupSetName.filter({ hasText: setName }).click({ button: 'right' });
  }

  async isSetCheckedByName(setName: string) {
    await expect(
      this.setName.filter({ hasText: setName }).getByRole('checkbox'),
    ).toBeChecked();
  }

  async checkActiveSetsCountByThemeName(name: string, count: string) {
    const themeRow = this.page
      .locator('[class*="theme-row"]')
      .filter({ has: this.page.getByText(name, { exact: true }) });
    await expect(themeRow.getByTitle('Edit theme and manage sets')).toHaveText(
      `${count} active sets`,
    );
  }

  async duplicateSetByName(setName: string) {
    await this.rightClickOnSetByName(setName);
    await this.baseComponent.duplicateOption.click();
  }

  async addSetToGroupByName(groupName: string, setName: string) {
    await this.rightClickOnSetsGroupByName(groupName);
    await this.addSetToGroupOption.click();
    await this.setsNameInput.fill(setName);
    await this.baseComponent.clickOnEnter();
  }

  async deleteSetsGroupByName(groupName: string) {
    await this.rightClickOnSetsGroupByName(groupName);
    await this.baseComponent.deleteOption.click();
  }

  async renameSetByDoubleClick(newSetName: string) {
    await this.setName.first().dblclick();
    await this.setsNameInput.fill(newSetName);
    await this.baseComponent.clickOnEnter();
  }

  async renameSetViaContextMenu(oldSetName: string, newSetName: string) {
    await this.rightClickOnSetByName(oldSetName);
    await this.renameContextMenuOption.click();
    await this.setsNameInput.fill(newSetName);
    await this.baseComponent.clickOnEnter();
  }
}
