import { expect, type Locator, type Page, test } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { ColorPickerComponent } from '@pages/components/color-picker-component';
import { ContextMenuComponent } from '@pages/components/context-menu-component';
import { ExportModalComponent } from '@pages/components/export-modal-component';
import { LeftSidebarComponent } from '@pages/workspace/left-sidebar/left-sidebar-component';
import { type LayerPosition } from '@pages/workspace/right-sidebar/design-tab/measures-section-component';
import { RightSidebarComponent } from '@pages/workspace/right-sidebar/right-sidebar-component';
import { type TextTypography } from '@pages/workspace/right-sidebar/design-tab/text-section-component';
import { GridEditorComponent } from '@pages/workspace/viewport/grid-editor-component';
import { ViewportComponent } from '@pages/workspace/viewport/viewport-component';
import { PrototypeOverlayComponent } from '@pages/workspace/viewport/prototype-overlay-component';
import { TextEditorComponent } from '@pages/workspace/viewport/text-editor-component';

/** A range of a text, by character offset, with its expected styles. */
export type TextRangeStyle = {
  /** Name for the report, e.g. the word in the range. */
  label: string;
  start: number;
  length: number;
  typography: TextTypography;
  /** Name of the image fill the Fill section shows, if the range has one. */
  imageFill?: string;
};

/** The file workspace. Exposes one component per UI region. */
export class WorkspacePage extends BasePage {
  // Sidebars
  readonly leftSidebar: LeftSidebarComponent;
  readonly rightSidebar: RightSidebarComponent;

  // Viewport: the canvas and what is drawn over it
  readonly canvas: ViewportComponent;
  readonly gridEditor: GridEditorComponent;
  readonly prototypeOverlay: PrototypeOverlayComponent;
  readonly textEditor: TextEditorComponent;
  /** Canvas the WebGL renderer draws the shapes on; absent with the classic renderer. */
  readonly webglCanvas: Locator;

  // Menus and dialogs shown over the workspace
  readonly contextMenu: ContextMenuComponent;
  readonly colorPicker: ColorPickerComponent;
  readonly exportModal: ExportModalComponent;

  constructor(page: Page) {
    super(page);
    // Sidebars
    this.leftSidebar = new LeftSidebarComponent(
      page,
      page.getByTestId('left-sidebar'),
    );
    this.rightSidebar = new RightSidebarComponent(
      page,
      page.getByTestId('right-sidebar'),
    );

    // Viewport
    this.canvas = new ViewportComponent(page, page.getByTestId('viewport'));
    this.gridEditor = new GridEditorComponent(page, page.getByTestId('viewport'));
    this.prototypeOverlay = new PrototypeOverlayComponent(
      page,
      page.getByTestId('viewport'),
    );
    this.textEditor = new TextEditorComponent(
      page,
      page.getByTestId('text-editor-container'),
    );
    this.webglCanvas = page.getByTestId('canvas-wasm-shapes');

    // Menus and dialogs
    this.contextMenu = new ContextMenuComponent(page);
    this.colorPicker = new ColorPickerComponent(page);
    this.exportModal = new ExportModalComponent(page);
  }

  // ---------------------------------------------------------------------------
  // Renderer
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Layers
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Text
  // ---------------------------------------------------------------------------

  /** Opens the editor on the selected text, selects all of it and copies it. */
  async copyAllText() {
    await this.clickOnEnter();
    await this.textEditor.selectAll();
    await this.textEditor.copySelection();
  }

  /**
   * Opens the editor on the selected text and checks the typography (and image fill)
   * of several ranges, walking the text from start to end in one pass.
   * @param ranges Ranges by character offset with their expected styles.
   */
  async checkTextRangeStyles(ranges: TextRangeStyle[]) {
    const { text, fill } = this.rightSidebar.design;
    // Opening the decoration options takes the focus, so it's done before editing
    await text.openOptions();
    await this.clickOnEnter();
    let selectionEnd: number | undefined;
    for (const { label, start, length, typography, imageFill } of [...ranges].sort(
      (a, b) => a.start - b.start,
    )) {
      await test.step(`"${label}" has its style`, async () => {
        selectionEnd === undefined
          ? await this.textEditor.selectTextRange(start, length)
          : await this.textEditor.selectNextTextRange(start - selectionEnd, length);
        selectionEnd = start + length;
        await text.checkTypography(typography);
        if (imageFill) await fill.checkImageFillIsVisible(imageFill);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Clipboard
  // ---------------------------------------------------------------------------

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
