import { type Locator, type Page, expect } from '@playwright/test';
import { BaseComponent } from '@pages/base-component';

export class ThemesComponent {
  readonly page: Page;
  readonly baseComponent: BaseComponent;
  readonly themeUpdateCreateModal: Locator;
  readonly createOneThemeButton: Locator;
  readonly addNewThemeButton: Locator;
  readonly themeNameInput: Locator;
  readonly groupThemeNameInput: Locator;
  readonly themesDropdown: Locator;
  readonly backToThemeListButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseComponent = new BaseComponent(page);

    // Sets locators
    this.themeUpdateCreateModal = page.getByTestId(
      'token-theme-update-create-modal',
    );

    this.themeUpdateCreateModal = page.getByTestId(
      'token-theme-update-create-modal',
    );
    this.createOneThemeButton = page
      .locator('[class*="empty-theme-wrapper"]')
      .getByText('Create one.');
    this.addNewThemeButton = page.getByRole('button', { name: 'Add new theme' });
    this.themeNameInput = page.getByPlaceholder('Add a theme (i.e. Light)');
    this.groupThemeNameInput = page.getByPlaceholder('Add group (i.e. Mode)');
    this.themesDropdown = page.getByTestId('theme-select');
    this.backToThemeListButton = page.getByRole('button', {
      name: 'Back to theme list',
    });
  }

  async createThemeViaLinkWithSet(name: string, setName: string) {
    await this.createOneThemeButton.click();
    await this.themeNameInput.fill(name);
    await this.activateSetInTheme(setName);
    await this.baseComponent.modalSaveButton.click();
    await this.baseComponent.modalCloseButton.last().click();
  }

  async createThemeViaLink(name: string) {
    await this.createOneThemeButton.click();
    await this.themeNameInput.fill(name);
    await this.baseComponent.modalSaveButton.click();
    await this.baseComponent.modalCloseButton.last().click();
  }

  async createThemeViaLinkWithGroup(groupName: string, themeName: string) {
    await this.createOneThemeButton.click();
    await this.groupThemeNameInput.fill(groupName);
    await this.themeNameInput.fill(themeName);
    await this.baseComponent.modalSaveButton.click();
  }

  async addNewThemeWithGroup(groupName: string, themeName: string) {
    await this.addNewThemeButton.click();
    await this.groupThemeNameInput.fill(groupName);
    await this.themeNameInput.fill(themeName);
    await this.baseComponent.modalSaveButton.click();
  }

  async addNewTheme(themeName: string) {
    await this.addNewThemeButton.click();
    await this.themeNameInput.fill(themeName);
    await this.baseComponent.modalSaveButton.click();
  }

  async checkSelectedTheme(themeName: string) {
    await expect(this.themesDropdown.filter({ hasText: themeName })).toBeVisible();
  }

  async selectTheme(themeName: string) {
    await this.themesDropdown.click();
    await this.page.getByRole('option').filter({ hasText: themeName }).click();
  }

  async openEditThemeModalByThemeName(name: string) {
    const themeRow = await this.page.getByTitle(name).locator('//../..');
    await themeRow.getByTitle('Edit theme and manage sets').click();
  }

  async activateSetInTheme(name: string) {
    await this.themeUpdateCreateModal.getByRole('button', { name: name }).click();
  }

  async backToThemeList() {
    await this.backToThemeListButton.click();
  }

  async saveTheme() {
    await this.baseComponent.modalSaveButton.click();
  }

  async checkActiveSetsCountByThemeName(name: string, count: number) {
    const themeRow = await this.page.getByTitle(name).locator('//../..');
    await expect(themeRow.getByTitle('Edit theme and manage sets')).toHaveText(
      `${count} active sets`,
    );
  }
}
