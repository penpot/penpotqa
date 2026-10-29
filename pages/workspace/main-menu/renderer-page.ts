import { MainMenuPage } from '@pages/workspace/main-menu/main-menu-page';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Renderer of the workspace canvas: WebGL (beta) or classic, switched in Main
 * menu > Preferences.
 */
export class RendererPage extends MainMenuPage {
  // locators
  readonly webglRenderingMenuSubItem: Locator;
  /** Canvas the WebGL renderer draws the shapes on; absent with the classic renderer. */
  readonly webglCanvas: Locator;

  constructor(page: Page) {
    super(page);

    // locators
    // Its label says what clicking it does: "Disable…" while WebGL is on
    this.webglRenderingMenuSubItem = page.getByRole('menuitem', {
      name: /^(Enable|Disable) WebGL rendering \(beta\)$/,
    });
    this.webglCanvas = page.getByTestId('canvas-wasm-shapes');
  }

  /**
   * Toggles "WebGL rendering (beta)" in Main menu > Preferences. The workspace
   * reloads with the other renderer and the selection is cleared, so pending
   * changes are saved first (they would be lost otherwise).
   */
  async toggleWebglRenderingViaMainMenu(enabled: boolean) {
    const action = enabled ? 'Enable' : 'Disable';
    await this.waitForChangeIsSaved();
    await this.clickMainMenuButton();
    await this.preferencesMainMenuItem.hover();
    await expect(
      this.webglRenderingMenuSubItem,
      `WebGL rendering can be ${action.toLowerCase()}d`,
    ).toHaveText(`${action} WebGL rendering (beta)`);
    await this.webglRenderingMenuSubItem.click();
    await expect(
      this.webglCanvas,
      `Canvas is drawn with the ${enabled ? 'WebGL' : 'classic'} renderer`,
    ).toHaveCount(enabled ? 1 : 0);
    await this.isMainPageLoaded();
  }
}
