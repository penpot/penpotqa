import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Main menu of the workspace (⋮ button in the left sidebar header) and its
 * submenus (File, Edit, Preferences…). They render inside its root, even where
 * they overlap the viewport.
 *
 * Most of its locators and methods still live in MainPage and move here
 * progressively.
 */
export class MainMenuComponent extends BaseComponent {
  readonly mainMenuButton: Locator;
  readonly mainMenuList: Locator;
  readonly fileMainMenuItem: Locator;
  readonly editMainMenuItem: Locator;
  readonly preferencesMainMenuItem: Locator;
  readonly selectAllMainMenuSubItem: Locator;
  readonly exportBoardsAsPDFMenuSubItem: Locator;
  /** Its label says what clicking it does: "Disable…" while WebGL is on. */
  readonly webglRenderingMenuSubItem: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);

    this.mainMenuButton = root.getByRole('button', { name: 'Main menu' });
    this.mainMenuList = root.locator(
      'ul[class*="main_ui_workspace_main_menu__menu"]',
    );
    this.fileMainMenuItem = root.getByRole('menuitem').filter({ hasText: 'File' });
    this.editMainMenuItem = root.getByRole('menuitem').filter({ hasText: 'Edit' });
    this.preferencesMainMenuItem = root.getByRole('menuitem', {
      name: 'Preferences',
    });
    this.selectAllMainMenuSubItem = root
      .getByRole('menuitem')
      .filter({ hasText: 'Select all' });
    this.exportBoardsAsPDFMenuSubItem = root
      .getByRole('menuitem')
      .filter({ hasText: 'Export boards as PDF' });
    this.webglRenderingMenuSubItem = root.getByRole('menuitem', {
      name: /^(Enable|Disable) WebGL rendering \(beta\)$/,
    });
  }

  async clickMainMenuButton() {
    await this.mainMenuButton.click();
    await expect(this.mainMenuList, 'Main menu is open').toBeVisible();
  }

  async clickFileMainMenuItem() {
    await this.fileMainMenuItem.click();
  }

  async clickEditMainMenuItem() {
    await this.editMainMenuItem.click();
  }

  async hoverPreferencesMainMenuItem() {
    await this.preferencesMainMenuItem.hover();
  }

  async clickSelectAllMainMenuSubItem() {
    await this.selectAllMainMenuSubItem.click();
  }

  /** Opens the "Export as PDF" dialog from the open File menu. */
  async clickExportBoardsAsPDFMenuSubItem() {
    await this.exportBoardsAsPDFMenuSubItem.click();
  }

  async clickWebglRenderingMenuSubItem() {
    await this.webglRenderingMenuSubItem.click();
  }

  /** Main menu > Edit > Select all. */
  async selectAll() {
    await this.clickMainMenuButton();
    await this.clickEditMainMenuItem();
    await this.clickSelectAllMainMenuSubItem();
  }

  async checkWebglRenderingMenuSubItem(action: 'Enable' | 'Disable') {
    await expect(
      this.webglRenderingMenuSubItem,
      `WebGL rendering can be ${action.toLowerCase()}d`,
    ).toHaveText(`${action} WebGL rendering (beta)`);
  }
}
