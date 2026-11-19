import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { ColorPickerComponent } from '@pages/components/color-picker-component';
import { ContextMenuComponent } from '@pages/components/context-menu-component';
import { ExportModalComponent } from '@pages/components/export-modal-component';
import { LeftSidebarComponent } from '@pages/workspace/left-sidebar/left-sidebar-component';
import { type LayerPosition } from '@pages/workspace/right-sidebar/design-tab/measures-section-component';
import { RightSidebarComponent } from '@pages/workspace/right-sidebar/right-sidebar-component';
import { ViewportComponent } from '@pages/workspace/viewport/viewport-component';
import { PrototypeOverlayComponent } from '@pages/workspace/viewport/prototype-overlay-component';

/** The file workspace. Exposes one component per UI region. */
export class WorkspacePage extends BasePage {
  readonly leftSidebar: LeftSidebarComponent;
  readonly rightSidebar: RightSidebarComponent;
  readonly exportModal: ExportModalComponent;
  readonly contextMenu: ContextMenuComponent;
  readonly colorPicker: ColorPickerComponent;
  readonly canvas: ViewportComponent;
  readonly prototypeOverlay: PrototypeOverlayComponent;
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
    this.contextMenu = new ContextMenuComponent(page);
    this.colorPicker = new ColorPickerComponent(page);
    this.canvas = new ViewportComponent(page, page.getByTestId('viewport'));
    this.prototypeOverlay = new PrototypeOverlayComponent(
      page,
      page.getByTestId('viewport'),
    );
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

  /**
   * Checks the position of several layers: selects each one in the Layers panel and reads
   * its X axis / Y axis in the Design tab. The last one stays selected.
   * @param positions Expected position by layer name, e.g. { Ellipse: { x: 0, y: 100 } }.
   */
  async checkLayerPositions(positions: Record<string, LayerPosition>) {
    for (const [name, position] of Object.entries(positions)) {
      await this.leftSidebar.layers.selectLayer(name);
      await this.rightSidebar.design.measures.checkPosition(position);
    }
  }

  /**
   * Checks which layers the CSS in the clipboard has (each block starts with a
   * comment with the layer name, e.g. a Board comment followed by its .board-… class).
   * @param layerNames Expected layer names, in clipboard order.
   */
  async checkCopiedCssLayers(layerNames: string[]) {
    await expect
      .poll(
        async () => {
          const css = await this.page.evaluate(() => navigator.clipboard.readText());
          return [...css.matchAll(/^\/\* (.+) \*\/$/gm)].map(([, name]) => name);
        },
        { message: `Copied CSS has the layers ${layerNames.join(', ')}` },
      )
      .toEqual(layerNames);
  }
}
