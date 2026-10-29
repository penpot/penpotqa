import { MainPage } from '@pages/workspace/main-page';
import type { Locator, Page } from '@playwright/test';

/**
 * Main menu of the workspace: its first-level entries (File, Edit, View,
 * Preferences, Help & info…). Pages for what is set from their submenus (e.g.
 * RendererPage) extend it.
 *
 * Most of its locators and methods still live in MainPage and move here
 * progressively.
 */
export class MainMenuPage extends MainPage {
  // locators
  readonly preferencesMainMenuItem: Locator;

  constructor(page: Page) {
    super(page);

    // locators
    this.preferencesMainMenuItem = page.getByRole('menuitem', {
      name: 'Preferences',
    });
  }
}
