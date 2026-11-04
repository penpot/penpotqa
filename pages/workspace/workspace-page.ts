import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { ExportModalComponent } from '@pages/components/export-modal-component';
import { LeftSidebarComponent } from '@pages/workspace/left-sidebar/left-sidebar-component';
import { RightSidebarComponent } from '@pages/workspace/right-sidebar/right-sidebar-component';

/** The file workspace. Exposes one component per UI region. */
export class WorkspacePage extends BasePage {
  readonly leftSidebar: LeftSidebarComponent;
  readonly rightSidebar: RightSidebarComponent;
  readonly exportModal: ExportModalComponent;
  /** Canvas the WebGL renderer draws the shapes on; absent with the classic renderer. */
  readonly webglCanvas: Locator;

  constructor(page: Page) {
    super(page);
    this.leftSidebar = new LeftSidebarComponent(
      page,
      page.getByTestId('left-sidebar'),
    );
    this.rightSidebar = new RightSidebarComponent(
      page,
      page.getByTestId('right-sidebar'),
    );
    this.exportModal = new ExportModalComponent(page);
    this.webglCanvas = page.getByTestId('canvas-wasm-shapes');
  }

  /**
   * Toggles "WebGL rendering (beta)" in Main menu > Preferences. The workspace
   * reloads with the other renderer and the selection is cleared, so pending
   * changes are saved first (they would be lost otherwise).
   */
  async toggleWebglRenderingViaMainMenu(enabled: boolean) {
    const { mainMenu } = this.leftSidebar;
    await this.waitForChangeIsSaved();
    await mainMenu.clickMainMenuButton();
    await mainMenu.hoverPreferencesMainMenuItem();
    await mainMenu.checkWebglRenderingMenuSubItem(enabled ? 'Enable' : 'Disable');
    await mainMenu.clickWebglRenderingMenuSubItem();
    await expect(
      this.webglCanvas,
      `Canvas is drawn with the ${enabled ? 'WebGL' : 'classic'} renderer`,
    ).toHaveCount(enabled ? 1 : 0);
    await this.waitForViewportVisible();
    await expect(this.viewport).toBeVisible();
  }
}
