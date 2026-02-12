const { expect } = require('@playwright/test');
const { BasePage } = require('../base-page');
const { getPlatformName } = require('../../helpers/get-platform');

exports.MainPage = class MainPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Main Toolbar
    this.pencilBoxButton = page.locator('a[class*="header__main-icon"]');
    this.moveButton = page.getByRole('button', { name: 'Move (V)' });
    this.createBoardButton = page.getByTestId('artboard-btn');
    this.createRectangleButton = page.getByTestId('rect-btn');
    this.createEllipseButton = page.getByTestId('ellipse-btn');
    this.createTextButton = page.getByRole('button', { name: 'Text (T)' });
    this.uploadImageSelector = page.locator('#image-upload');
    this.createCurveButton = page.getByTestId('curve-btn');
    this.createPathButton = page.getByTestId('path-btn');
    this.colorsPaletteButton = page.locator('button[title^="Color Palette"]');
    this.mainToolBar = page.locator(
      '[class*="main-toolbar"] button[class*="toolbar-handler"]',
    );
    this.toolBarWindow = page.locator('aside[class*="main-toolbar"]').first();
    this.designTab = page.getByRole('tab', { name: 'design' });
    this.createPathPointer = page
      .getByTestId('viewport')
      .locator('[class*="viewport-controls cursor-pen drawing"]');

    //Grid editor Toolbar
    this.gridEditorToolBar = page.getByText('Editing grid').locator('..');

    //Viewport
    this.textbox = this.viewport.getByRole('textbox').first();
    this.guides = page.locator('.guides .new-guides');
    this.guidesFragment = page.locator('.main_ui_workspace_sidebar__resize-area');
    this.gridEditorLabel = page.locator('input[class*="grid-editor-label"]');
    this.gridEditorButton = page.locator('button[class*="grid-editor-button"]');
    this.gridEditorCell = page.locator('rect[class*="grid-cell-outline"]');
    this.cornerHandle = page.locator('circle[data-position="bottom-left"]');

    //Node panel
    this.pathActionsBlock = page.locator('div[class$="path_actions__sub-actions"]');
    this.firstNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=0',
    );
    this.secondNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=2',
    );
    this.thirdNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=3',
    );
    this.fourthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=4',
    );
    this.fifthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=5',
    );
    this.sixthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=6',
    );
    this.nodePanelAddNodeButton = page.locator('button[title^="Add node"]');
    this.nodePanelDeleteNodeButton = page.locator('button[title^="Delete node"]');
    this.nodePanelMergeNodesButton = page.locator('button[title^="Merge nodes"]');
    this.nodePanelDrawNodesButton = page.locator('button[title^="Draw nodes"]');
    this.nodePanelMoveNodesButton = page.locator('button[title^="Move nodes"]');
    this.nodePanelJoinNodesButton = page.locator('button[title^="Join nodes"]');
    this.nodePanelSeparateNodesButton = page.locator(
      'button[title^="Separate nodes"]',
    );
    this.nodePanelToCornerButton = page.locator('button[title^="To corner"]');
    this.nodePanelToCurveButton = page.locator('button[title^="To curve"]');

    // Main menu - first level
    this.mainMenuButton = page.getByRole('button', { name: 'Main menu' });
    this.mainMenuList = page.locator(
      'ul[class*="main_ui_workspace_main_menu__menu"]',
    );
    this.viewMainMenuItem = page.getByRole('menuitem').filter({ hasText: 'View' });
    this.fileMainMenuItem = page.getByRole('menuitem').filter({ hasText: 'File' });
    this.editMainMenuItem = page.getByRole('menuitem').filter({ hasText: 'Edit' });
    this.helpInfoMenuItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Help & info' });

    // Main menu - second level
    this.historyVersionMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Version history' });
    this.showRulersMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Show rulers' });
    this.hideRulersMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Hide rulers' });
    this.hideGridsMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Hide pixel grid' });
    this.showGridsMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Show pixel grid' });
    this.selectAllMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Select all' });
    this.showColorPaletteMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Show color palette' });
    this.hideColorPaletteMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Hide color palette' });
    this.showBoardNamesMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Show boards names' });
    this.hideBoardNamesMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Hide board names' });
    this.showPixelGridMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Show pixel grid' });
    this.hidePixelGridMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Hide pixel grid' });
    this.showHideUIMainMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Show / Hide UI' });
    this.downloadPenpotFileMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Download Penpot file (.penpot)' });
    this.downloadStandardFileMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Download standard file (.svg + .json)' });
    this.exportBoardsAsPDFFileMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Export boards as PDF' });
    this.addAsSharedLibraryFileMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Add as Shared Library' });
    this.removeAsSharedLibraryFileMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Unpublish Library' });
    this.shortcutsMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Shortcuts' });
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');

    // Export as PDF
    this.exportAsPDFModalTitle = page.getByRole('heading', {
      name: 'Export as PDF',
    });
    this.exportAsPDFModalButton = page.getByRole('button', {
      name: 'Export',
      exact: true,
    });
    this.exportAsPDFCompleteToastText = page.getByText('Export complete');

    //Zoom
    this.zoomButton = page.getByTitle('Zoom', { exact: true });
    this.zoomPlusButton = page.getByRole('button', { name: 'Zoom in' });
    this.zoomMinusButton = page.getByRole('button', { name: 'Zoom out' });
    this.zoomResetButton = page.getByRole('button', { name: 'Reset' });
    this.zoomToFitAllMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Zoom to fit all' });
    this.zoomSelectedMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Zoom to selected' });

    //Pages
    this.addPageButton = page.locator('button[class*="add-page"]');
    this.pagesBlock = page.locator('div.main_ui_workspace_sidebar_sitemap__sitemap');
    this.firstPageListItem = page.locator(
      'ul[class*="page-list"] div[class*="element-list-body"] >>nth=0',
    );
    this.secondPageListItem = page.locator(
      'ul[class*="page-list"] div[class*="element-list-body"] >>nth=1',
    );
    this.selectedPage = page.locator(
      'ul[class*="page-list"] li[class*="sitemap__selected"] div[class*="element-list-body"]',
    );
    this.pageNameInput = page.locator(
      'ul[class*="page-list"] div[class*="element-list-body"] input',
    );
    this.renamePageMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Rename' });
    this.duplicatePageMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate' });
    this.deletePageMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete' });
    this.collapseExpandPagesButton = page.getByRole('button', {
      name: 'Pages',
      exact: true,
    });
    this.pageTrashIcon = page.locator(
      'div[class*="selected"] svg[class="icon-delete"]',
    );
    this.deletePageOkButton = page.getByRole('button', { name: 'Ok' });

    // Bottom palette
    this.bottomPaletteToolBar = page.locator('.main_ui_workspace_palette__palettes');
    this.typographyButton = page.getByRole('button', { name: 'Typographies' });
    this.bottomPaletteContentBlock = page.locator(
      'div[class="main_ui_workspace_palette__palette"]',
    );
    this.fontRecordOnTypographiesBottomPanel = page.locator(
      'div[class*="text_palette__typography-item"]',
    );
    this.typographiesColorsBottomPanel = page.locator(
      'div.main_ui_workspace_palette__wide',
    );
    this.workspaceMenu = page.locator('*[class*="workspace-context-menu"]');

    //Header
    this.usersSection = page.locator('div[class*="users-section"]');
    this.projectNameSpan = page.locator('div[class*="project-name"]');
    this.fileNameSpan = page.locator('div[class*="file-name"]');

    //History panel
    this.historyPanelButton = page.getByRole('button', { name: /History/ });
    this.historyActionsTab = page.getByRole('tab', { name: 'Actions' });
    this.historyPanelActionRecord = page.locator(
      'div[class*="history-entry-summary-text"]',
    );

    //Shortcuts panel
    this.shortcutsContainer = this.page.locator(
      '.main_ui_workspace_sidebar_shortcuts__shortcuts',
    );
    this.shortcutsPanel = this.shortcutsContainer.locator(
      '.main_ui_workspace_sidebar_shortcuts__shortcuts-list',
    );
    this.closeShortcutsPanelIcon = this.shortcutsContainer.getByRole('button', {
      name: 'Close',
    });
    this.fileLeftSidebarAside = page.getByTestId('left-sidebar');
    this.fileRightSidebarAside = page.getByTestId('right-sidebar');

    this.errorScreen = page.locator('div[class*="static__exception-content"]');
    this.loginDialog = page.locator('div[class*="dialog-login"]');

    this.viewportControls = page.locator('.viewport-controls');
    // Comments
  }

  async clickMoveButton() {
    await this.moveButton.click({ delay: 500 });
  }

  async clickCreateBoardButton() {
    await this.createBoardButton.click({ delay: 500 });
  }

  async clickCreateRectangleButton() {
    await this.createRectangleButton.click({ delay: 500 });
  }

  async clickCreateEllipseButton() {
    await this.createEllipseButton.click({ delay: 500 });
  }

  async clickCreateTextButton() {
    await this.createTextButton.click({ delay: 500 });
  }

  async typeTextFromKeyboard() {
    await this.page.keyboard.type('Hello world!');
  }

  async uploadImage(filePath) {
    await this.uploadImageSelector.setInputFiles(filePath);
  }

  async uploadImageViaShortcut(filePath) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.pressUploadImageShortcut();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  async clickCreateCurveButton() {
    await this.createCurveButton.click({ delay: 500 });
  }

  async clickCreatePathButton() {
    await this.viewport.click();
    await this.createPathButton.click({ delay: 500 });
    await expect(this.createPathPointer).toBeVisible();
  }

  async clickViewportOnce() {
    await this.viewport.click();
  }

  async clickViewportTwice() {
    await this.page.waitForTimeout(100);
    await this.viewport.hover();
    await this.viewport.click({ delay: 100, force: true });
    await this.page.waitForTimeout(100);
    await this.viewport.click({ delay: 100, force: true });
  }

  async clickViewportByCoordinates(x, y, count = 1) {
    await this.page.waitForTimeout(100);
    await this.viewport.hover();
    for (let i = 0; i < count; i++) {
      await this.page.waitForTimeout(100);
      await this.viewport.click({
        position: { x: x, y: y },
        force: true,
        delay: 200,
      });
    }
  }

  /**
   * Wait for the viewport controls to be visible.
   *
   * @returns {Promise<void>}
   */
  async waitForViewportControls() {
    await this.viewportControls.click();
  }

  /**
   * Performs zoom operations on the document.
   *
   * @param {number} deltaX, pixels to scroll vertically.
   * @param {number} deltaY, pixels to scroll vertically.
   * @param {number} steps - number of steps to zoom in or out.
   *    * @returns {Promise<void>}
   */
  async zoom(deltaX, deltaY, steps) {
    await this.waitForViewportControls();
    await this.page.keyboard.down('Control');
    for (let index = 0; index < steps; index++) {
      await this.page.mouse.wheel(deltaX, deltaY);
    }
    await this.page.keyboard.up('Control');
  }

  async isUnSavedChangesDisplayed() {
    await expect(this.unSavedChangesIcon).toBeVisible();
  }

  async isCreatedLayerVisible(visible = true) {
    visible
      ? await expect(this.createdLayer).toBeVisible()
      : await expect(this.createdLayer).not.toBeVisible();
  }

  async isCopyLayerVisible() {
    await expect(this.copyLayer).toBeVisible();
  }

  async isSelectLayerHidden() {
    await expect(this.copyLayer).toBeHidden();
  }

  async doubleClickCreatedBoardTitleOnCanvas() {
    await this.createdBoardTitle.dblclick();
  }

  async clickCreatedBoardTitleOnCanvas() {
    await this.createdBoardTitle.click({ force: true });
    await this.createdBoardTitle.click({ force: true });
  }

  async clickOnLayerOnCanvas() {
    await this.createdLayer.click({ force: true, delay: 500 });
  }

  async doubleClickBoardTitleOnCanvas(title) {
    const boardSel = this.page.locator(
      `//*[@class='frame-title']//../*[text()='${title}']`,
    );
    await boardSel.dblclick();
  }

  async clickBoardOnCanvas() {
    const boardSel = this.page.locator(`rect[class="main viewport-selrect"]`);
    await boardSel.click();
  }

  async doubleClickBoardOnCanvas() {
    const boardSel = this.page.locator(`rect[class="main viewport-selrect"]`);
    await boardSel.dblclick();
  }

  async hoverBoardOnCanvas() {
    const boardSel = this.page.locator(`rect[class="main viewport-selrect"]`);
    await boardSel.hover();
  }

  async focusLayerViaShortcut() {
    await this.page.keyboard.press('F');
  }

  async drawCurve(x1, y1, x2, y2) {
    await this.page.waitForTimeout(200);
    await this.page.mouse.move(x1, y1);
    await this.page.mouse.down();
    await this.page.mouse.move(x1, y1);
    await this.page.mouse.move(x2, y2);
    await this.page.mouse.up();
  }

  async clickPencilBoxButton() {
    await this.pencilBoxButton.click();
  }

  async isMainPageLoaded() {
    await this.waitForViewportVisible();
    await expect(this.viewport).toBeVisible();
  }

  async isMainPageVisible() {
    try {
      await this.viewport.waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async isProjectAndFileNameExistInFile(projectName, fileName) {
    await expect(this.projectNameSpan).toContainText(projectName);
    await expect(this.fileNameSpan.last()).toHaveText(fileName);
  }

  async pressFlexLayoutShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press('Shift+A');
  }

  async flipVerticalViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press('Shift+V');
  }

  async flipHorizontalViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press('Shift+H');
  }

  async deleteLayerViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.pressDeleteKeyboardButton();
  }

  async clickFirstNode() {
    await this.firstNode.click({ force: true });
  }

  async clickSecondNode() {
    await this.secondNode.click({ force: true });
  }

  async clickThirdNode() {
    await this.thirdNode.click({ force: true });
  }

  async clickFourthNode() {
    await this.fourthNode.click({ force: true });
  }

  async clickFifthNode() {
    await this.fifthNode.click({ force: true });
  }

  async clickSixthNode() {
    await this.sixthNode.click({ force: true });
  }

  async holdShiftKeyboardButton() {
    await this.page.keyboard.down('Shift');
  }

  async releaseShiftKeyboardButton() {
    await this.page.keyboard.up('Shift');
  }

  async clickAddNodeButtonOnNodePanel() {
    await this.nodePanelAddNodeButton.click();
  }

  async pressShiftPlusKeyboardShortcut() {
    await this.page.keyboard.press('Shift+NumpadAdd');
  }

  async clickDeleteNodeButtonOnNodePanel() {
    await this.nodePanelDeleteNodeButton.click();
  }

  async pressDeleteKeyboardButton() {
    await this.page.keyboard.press('Delete');
  }

  async clickMergeNodesButtonOnNodePanel() {
    await this.nodePanelMergeNodesButton.click();
  }

  async pressCtrlJKeyboardShortcut(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+J');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+J');
      } else {
        await this.page.keyboard.press('Control+J');
      }
    }
  }

  async clickDrawNodesButtonOnNodePanel() {
    await this.nodePanelDrawNodesButton.click();
  }

  async clickMoveNodesButtonOnNodePanel() {
    await this.nodePanelMoveNodesButton.click();
  }

  async clickJoinNodesButtonOnNodePanel() {
    await this.nodePanelJoinNodesButton.click();
  }

  async pressJKeyboardShortcut() {
    await this.page.keyboard.press('J');
  }

  async clickSeparateNodesButtonOnNodePanel() {
    await this.nodePanelSeparateNodesButton.click();
  }

  async pressKKeyboardShortcut() {
    await this.page.keyboard.press('K');
  }

  async clickToCornerButtonOnNodePanel() {
    await this.nodePanelToCornerButton.click();
  }

  async pressXKeyboardShortcut() {
    await this.page.keyboard.press('X');
  }

  async clickToCurveButtonOnNodePanel() {
    await this.nodePanelToCurveButton.click();
  }

  async pressCKeyboardShortcut() {
    await this.page.keyboard.press('C');
  }

  async clickMainMenuButton() {
    await this.mainMenuButton.click();
    await expect(this.mainMenuList).toBeVisible();
  }

  async clickViewMainMenuItem() {
    await this.viewMainMenuItem.click();
  }

  async clickFileMainMenuItem() {
    await this.fileMainMenuItem.click();
  }

  async clickEditMainMenuItem() {
    await this.editMainMenuItem.click();
  }

  async clickHelpInfoMainMenuItem() {
    await this.helpInfoMenuItem.click();
  }

  async clickShowVersionsMainMenuSubItem() {
    await this.historyVersionMenuSubItem.click();
  }

  async clickShowRulersMainMenuSubItem() {
    await this.showRulersMainMenuSubItem.click();
  }

  async clickHideRulersMainMenuSubItem() {
    await this.hideRulersMainMenuSubItem.click();
  }

  async clickHideGridsMainMenuSubItem() {
    await this.hideGridsMainMenuSubItem.click();
  }

  async clickShowGridsMainMenuSubItem() {
    await this.showGridsMainMenuSubItem.click();
  }

  async clickSelectAllMainMenuSubItem() {
    await this.selectAllMainMenuSubItem.click();
  }

  async clickShowColorPaletteMainMenuSubItem() {
    await this.showColorPaletteMainMenuSubItem.click();
  }

  async clickHideColorPaletteMainMenuSubItem() {
    await this.hideColorPaletteMainMenuSubItem.click();
  }

  async pressHideShowRulersShortcut(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+Shift+R');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+Shift+R');
      } else {
        await this.page.keyboard.press('Control+Shift+R');
      }
    }
  }

  async pressHideShowGridsShortcut(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press("Meta+'");
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press("Meta+'");
      } else {
        await this.page.keyboard.press("Control+'");
      }
    }
  }

  async pressSelectAllShortcut(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+A');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+A');
      } else {
        await this.page.keyboard.press('Control+A');
      }
    }
  }

  async pressCopyShortcut(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+C');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+C');
      } else {
        await this.page.keyboard.press('Control+C');
      }
    }
  }

  async pressPasteShortcut(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+V');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+V');
      } else {
        await this.page.keyboard.press('Control+V');
      }
    }
  }

  async pressCutShortcut(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+X');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+X');
      } else {
        await this.page.keyboard.press('Control+X');
      }
    }
  }

  async clickShowBoardNamesMainMenuSubItem() {
    await this.showBoardNamesMainMenuSubItem.click();
  }

  async clickHideBoardNamesMainMenuSubItem() {
    await this.hideBoardNamesMainMenuSubItem.click();
  }

  async clickShowPixelGridMainMenuSubItem() {
    await this.showPixelGridMainMenuSubItem.click();
  }

  async clickHidePixelGridMainMenuSubItem() {
    await this.hidePixelGridMainMenuSubItem.click();
  }

  async clickShowHideUIMainMenuSubItem() {
    await this.showHideUIMainMenuSubItem.click();
  }

  async clickAddAsSharedLibraryMainMenuSubItem() {
    await this.addAsSharedLibraryFileMenuSubItem.click();
  }

  async clickRemoveAsSharedLibraryMainMenuSubItem() {
    await this.removeAsSharedLibraryFileMenuSubItem.click();
  }

  async clickShortcutsMainMenuSubItem() {
    await this.shortcutsMenuSubItem.click();
  }

  async clickZoomButton() {
    await this.zoomButton.click();
  }

  async increaseZoom(numberOfTimes) {
    await this.clickZoomButton();
    for (let i = 0; i <= numberOfTimes; i++) {
      await this.zoomPlusButton.click();
    }
  }

  async decreaseZoom(numberOfTimes) {
    await this.clickZoomButton();
    for (let i = 0; i <= numberOfTimes; i++) {
      await this.zoomMinusButton.click();
    }
  }

  async resetZoom() {
    await this.clickZoomButton();
    await this.zoomResetButton.click();
  }

  async zoomToFitAll() {
    await this.clickZoomButton();
    await this.zoomToFitAllMenuItem.click({ delay: 500 });
  }

  async zoomToFitSelected() {
    await this.clickZoomButton();
    await this.zoomSelectedMenuItem.click();
  }

  async pressHideShowPixelGridShortcut() {
    await this.page.keyboard.press('Shift+,');
  }

  async pressHideShowUIShortcut() {
    await this.page.keyboard.press('Backslash');
  }

  async pressUploadImageShortcut() {
    await this.page.keyboard.press('Shift+K');
  }

  async downloadPenpotFileViaMenu() {
    await this.downloadPenpotFileMenuSubItem.click();
    await this.page.waitForEvent('download');
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadStandardFileViaMenu() {
    await this.downloadStandardFileMenuSubItem.click();
    await this.page.waitForEvent('download');
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async exportBoardsAsPDFViaMenu(numBoards) {
    await this.exportBoardsAsPDFFileMenuSubItem.click();
    await expect(this.exportAsPDFModalTitle).toBeVisible();
    await expect(this.exportAsPDFModalButton).toBeVisible();
    await this.exportAsPDFModalButton.click();
    await this.page.waitForEvent('download');
    await expect(this.exportAsPDFCompleteToastText).toBeVisible();
    await expect(this.page.getByText(`${numBoards} / ${numBoards}`)).toBeVisible();
  }

  async clickAddPageButton() {
    await this.addPageButton.click();
  }

  async isFirstPageAddedToAssetsPanel(added = true) {
    added
      ? await expect(this.firstPageListItem).toBeVisible()
      : await expect(this.firstPageListItem).not.toBeVisible();
  }

  async isFirstPageNameDisplayed(name) {
    await expect(this.firstPageListItem).toHaveText(name);
  }

  async isSecondPageAddedToAssetsPanel(added = true) {
    added
      ? await expect(this.secondPageListItem).toBeVisible()
      : await expect(this.secondPageListItem).not.toBeVisible();
  }

  async isSecondPageNameDisplayed(name, displayed = true) {
    displayed
      ? await expect(this.secondPageListItem).toHaveText(name)
      : await expect(this.secondPageListItem).not.toHaveText(name);
  }

  async renamePageViaRightClick(newName, isFirstPage = true) {
    if (isFirstPage) {
      await this.firstPageListItem.click({ button: 'right' });
    } else {
      await this.secondPageListItem.click({ button: 'right' });
    }
    await this.renamePageMenuItem.click();
    await this.pageNameInput.fill(newName);
    await this.clickViewportTwice();
  }

  async duplicatePageViaRightClick(isFirstPage = true) {
    if (isFirstPage) {
      await this.firstPageListItem.click({ button: 'right' });
    } else {
      await this.secondPageListItem.click({ button: 'right' });
    }
    await this.duplicatePageMenuItem.click();
  }

  async clickOnPageOnLayersPanel(firstPage = true) {
    if (firstPage) {
      await this.firstPageListItem.click();
    } else {
      await this.secondPageListItem.click();
    }
  }

  async clickCollapseExpandPagesButton() {
    await this.collapseExpandPagesButton.click();
  }

  async deleteSecondPageViaRightClick() {
    await this.secondPageListItem.click({ button: 'right' });
    await this.deletePageMenuItem.click();
    await this.deletePageOkButton.click();
  }

  async deleteSecondPageViaTrashIcon() {
    await this.secondPageListItem.click();
    await this.pageTrashIcon.click();
    await this.deletePageOkButton.click();
  }

  async clickHistoryPanelButton() {
    await this.historyPanelButton.click();
  }

  async clickHistoryActionsButton() {
    await this.historyActionsTab.click();
  }

  async isActionDisplayedOnHistoryPanel(actionName) {
    await expect(this.historyPanelActionRecord).toHaveText(actionName);
  }

  async waitForBottomPaletteIsOpened() {
    await expect(this.bottomPaletteContentBlock).toBeVisible();
  }

  async clickFontRecordOnTypographiesBottomPanel() {
    await this.fontRecordOnTypographiesBottomPanel.click();
  }

  async pressShortcutsPanelShortcut() {
    await this.page.keyboard.press('Shift+?');
  }

  async closeShortcutsPanel() {
    await this.closeShortcutsPanelIcon.click();
  }

  async isShortcutsPanelDisplayed() {
    await expect(this.shortcutsPanel).toBeVisible();
  }

  async isShortcutsPanelNotDisplayed() {
    await expect(this.shortcutsPanel).not.toBeVisible();
  }

  async openCloseColorsPaletteFromSidebar() {
    await this.colorsPaletteButton.click();
  }

  async pressColorsPaletteShortcut() {
    await this.page.keyboard.press('Alt+P');
  }

  async isColorsPaletteDisplayed() {
    await expect(this.typographiesColorsBottomPanel).toBeVisible();
  }

  async isColorsPaletteNotDisplayed() {
    await expect(this.typographiesColorsBottomPanel).not.toBeVisible();
  }

  async backToDashboardFromFileEditor() {
    await this.clickPencilBoxButton();
    await this.isHeaderDisplayed('Projects');
  }

  async pressOpenTypographiesBottomPanelShortcut() {
    await this.page.keyboard.press('Alt+T');
    await this.waitForBottomPaletteIsOpened();
  }

  async createDefaultBoardByCoordinates(x, y, double = false) {
    await this.clickCreateBoardButton();
    await this.clickViewportByCoordinates(x, y);
    double === true
      ? await this.clickViewportByCoordinates(x, y)
      : await this.waitForChangeIsSaved();
  }

  async createDefaultRectangleByCoordinates(x, y, double = false) {
    await this.clickCreateRectangleButton();
    await this.clickViewportByCoordinates(x, y);
    double === true
      ? await this.clickViewportByCoordinates(x, y)
      : await this.waitForChangeIsSaved();
  }

  async createDefaultEllipseByCoordinates(x, y, double = false) {
    await this.clickCreateEllipseButton();
    await this.clickViewportByCoordinates(x, y);
    double === true
      ? await this.clickViewportByCoordinates(x, y)
      : await this.waitForChangeIsSaved();
  }

  async createDefaultClosedPath() {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(500, 200);
    await this.clickViewportByCoordinates(1200, 700);
    await this.clickViewportByCoordinates(1000, 400);
    await this.clickViewportByCoordinates(500, 200);
    await expect(this.pathActionsBlock).toBeVisible();
    await this.clickOnDesignTab();
    await this.waitForChangeIsSaved();
  }

  async createDefaultOpenPath() {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(500, 200);
    await this.clickViewportByCoordinates(1200, 700);
    await this.clickViewportByCoordinates(1000, 400);
    await this.page.keyboard.press('Enter');
    await expect(this.pathActionsBlock).toBeVisible();
    await this.page.keyboard.press('Enter');
    // await this.clickMoveNodesButtonOnNodePanel();
    // await this.clickDrawNodesButtonOnNodePanel();
    await this.waitForChangeIsSaved();
  }

  async createSmallClosedPathByCoordinates(x, y) {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(x, y);
    await this.clickViewportByCoordinates(x + 100, y);
    await this.clickViewportByCoordinates(x, y + 100);
    await this.clickViewportByCoordinates(x, y);
    await expect(this.pathActionsBlock).toBeVisible();
    await this.clickOnDesignTab();
    await this.waitForChangeIsSaved();
  }

  async createDefaultCurveLayer() {
    await this.clickCreateCurveButton();
    await this.page.waitForTimeout(700);
    await this.drawCurve(900, 300, 600, 200);
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultTextLayer() {
    await this.clickCreateTextButton();
    await this.clickViewportByCoordinates(200, 300);
    await expect(this.textbox).toBeVisible();
    await this.typeTextFromKeyboard();
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultTextLayerByCoordinates(x, y) {
    await this.clickCreateTextButton();
    await this.clickViewportByCoordinates(x, y);
    await expect(this.textbox).toBeVisible();
    await this.typeTextFromKeyboard();
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async clickOnMainToolBar() {
    await this.mainToolBar.click();
  }

  async clickOnDesignTab() {
    await this.designTab.click();
  }

  async isDesignTabVisible(visible = true) {
    visible
      ? await expect(this.designTab).toBeVisible()
      : await expect(this.designTab).not.toBeVisible();
  }

  async createComponentsMultipleShapesRightClick(singleComponent = true) {
    const layerSel = this.page.locator(
      'div[class*="viewport"] .main.viewport-selrect',
    );
    await layerSel.last().click({ button: 'right', force: true });
    if (singleComponent) {
      await this.createComponentMenuItem.click();
    } else {
      await this.createMultipleComponentsMenuItem.click();
    }
  }

  async createComponentViaShortcut(browserName, isBoard = false) {
    isBoard
      ? await this.clickCreatedBoardTitleOnCanvas()
      : await this.createdLayer.click({ force: true });
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+K');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+K');
      } else {
        await this.page.keyboard.press('Control+K');
      }
    }
  }

  async copyLayerViaRightClick() {
    await this.rightClickOnElement();
    await this.copyOption.click();
  }

  async pasteLayerViaRightClick() {
    const layerSel = this.viewport;
    await layerSel.last().click({ button: 'right', force: true });
    await this.pasteOption.click();
  }

  async cutLayerViaRightClick() {
    await this.rightClickOnElement();
    await this.cutOption.click();
  }

  async duplicateLayerViaRightClick() {
    await this.rightClickOnElement();
    await this.duplicateOption.click();
  }

  async duplicateLayerViaLayersTab(name) {
    const layerSel = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("${name}") >>nth=0`,
    );
    await layerSel.last().click({ button: 'right', force: true });
    await this.duplicateOption.click();
  }

  async groupLayerViaRightClick() {
    const layerSel = this.page.getByTestId('layer-item');
    await layerSel.last().click({ button: 'right', force: true });
    await this.groupOption.click();
  }

  async showInAssetsPanelRightClick() {
    const layerSel = this.page.getByTestId('layer-item');
    await layerSel.last().click({ button: 'right', force: true });
    await this.showInAssetsPanelOption.click();
  }

  async changeGridRowLabel(value) {
    await this.gridEditorLabel.last().click();
    await this.gridEditorLabel.last().fill(value);
    await this.clickOnEnter();
  }

  async duplicateGridRow() {
    await this.gridEditorLabel.last().hover();
    await this.gridEditorButton.click();
    await this.duplicateRowMenuItem.waitFor({ state: 'visible' });
    await this.duplicateRowMenuItem.click();
  }

  async deleteGridRow() {
    await this.gridEditorLabel.last().hover();
    await this.gridEditorButton.click();
    await this.deleteRowMenuItem.waitFor({ state: 'visible' });
    await this.deleteRowMenuItem.click();
  }

  async addGridRowBelow() {
    await this.gridEditorLabel.last().hover();
    await this.gridEditorButton.click();
    await this.addRowBelowMenuItem.waitFor({ state: 'visible' });
    await this.addRowBelowMenuItem.click();
  }

  async addGridColumnRight() {
    await this.gridEditorLabel.first().hover();
    await this.gridEditorButton.click();
    await this.addColumnRightMenuItem.waitFor({ state: 'visible' });
    await this.addColumnRightMenuItem.click();
  }

  async selectGridCellMultiple(startCell, endCell) {
    const startCellLocator = await this.page.locator(
      `rect[class*="grid-cell-outline"] >>nth=${startCell - 1}`,
    );
    const endCellLocator = await this.page.locator(
      `rect[class*="grid-cell-outline"] >>nth=${endCell - 1}`,
    );
    await startCellLocator.click();
    await endCellLocator.click({ modifiers: ['Shift'] });
  }

  async mergeGridCellViaRightClick(cell) {
    const cellLocator = await this.page.locator(
      `rect[class*="grid-cell-outline"] >>nth=${cell - 1}`,
    );
    await cellLocator.click({ button: 'right', force: true });
    await this.mergeGridCellMenuItem.click();
  }

  async clickOnGridCell(cell) {
    const cellLocator = await this.page.locator(
      `rect[class*="grid-cell-outline"] >>nth=${cell - 1}`,
    );
    await cellLocator.click();
  }

  async dragAndDropComponentToAnotherFraction(cellNumber) {
    const selectedElement = this.page.locator(
      `rect[class*="main viewport-selrect"]`,
    );
    const board = this.page.locator(
      `rect[class*="grid-cell-outline"] >>nth=${cellNumber - 1}`,
    );
    await selectedElement.hover();
    await selectedElement.dragTo(board);
  }

  async isToolBarVisible(visible = true) {
    visible
      ? await expect(this.toolBarWindow).toBeVisible()
      : await expect(this.toolBarWindow).not.toBeVisible();
  }

  async isPageRightClickMenuVisible(visible = true) {
    await this.firstPageListItem.click({ button: 'right' });
    visible
      ? await expect(this.renamePageMenuItem).toBeVisible()
      : await expect(this.renamePageMenuItem).not.toBeVisible();
  }

  async checkViewerRightClickMenu() {
    await this.rightClickOnElement();
    await expect(this.copyOption).not.toBeVisible();
    await expect(this.workspaceMenu).not.toBeVisible();
  }

  async isColorsPaletteButtonVisible(visible = true) {
    visible
      ? await expect(this.colorsPaletteButton).toBeVisible()
      : await expect(this.colorsPaletteButton).not.toBeVisible();
  }

  async isTypographyButtonVisible(visible = true) {
    visible
      ? await expect(this.typographyButton).toBeVisible()
      : await expect(this.typographyButton).not.toBeVisible();
  }

  async copyLayerPropertyViaRightClick() {
    await this.rightClickOnElement();
    await this.copyPasteAsMenuItem.hover();
    await this.copyPropertiesMenuItem.click();
  }

  async copyLayerCSSViaRightClick() {
    await this.rightClickOnElement();
    await this.copyPasteAsMenuItem.hover();
    await this.copyAsCssMenuItem.click();
    return await this.page.evaluate(() => navigator.clipboard.readText());
  }

  async copyLayerSVGViaRightClick() {
    await this.rightClickOnElement();
    await this.copyPasteAsMenuItem.hover();
    await this.copyAsSVGMenuItem.click();
    const svgString = await this.page.evaluate(() => navigator.clipboard.readText());
    return svgString.replace(/\s+/g, '').replace(/[\r\n]+/g, '');
  }

  async copyLayerLinkViaRightClick() {
    await this.rightClickOnElement();
    await this.copyLinkMenuItem.click();
  }

  async isPageNameSelected(name, selected = true) {
    selected
      ? await expect(this.selectedPage.getByTitle(name)).toBeVisible()
      : await expect(this.selectedPage.getByTitle(name)).not.toBeVisible();
  }

  async checkImportErrorMessage(message) {
    await expect(this.importErrorMessage.first()).toHaveText(message);
  }

  async isImportErrorMessageVisible(visible = true) {
    visible
      ? await expect(this.importErrorMessage.first()).toBeVisible()
      : await expect(this.importErrorMessage.first()).not.toBeVisible();
  }

  async expandDetailMessage() {
    await this.detailsButton.click();
  }

  async deselectElement(index = 0) {
    const element = this.viewport.locator(`[class*="outlines"] rect`).nth(index);

    await element.hover({ force: true });
    await element.click({ modifiers: ['Shift', 'Control'], force: true });
    await this.viewport.hover();
  }

  async rightClickOnElement() {
    const layerSel = this.page.locator('.viewport-selrect');
    await layerSel.last().click({ button: 'right', force: true });
  }

  async doubleClickTextOnCanvas(browserName) {
    const textSel = this.page.locator(`rect[class="main viewport-selrect"]`);
    await textSel.dblclick();
    if (browserName === 'chromium') {
      await textSel.dblclick();
    }
  }

  async editTextLayer(text, browserName = 'chromium') {
    await this.doubleClickTextOnCanvas(browserName);
    await expect(this.textbox).toBeVisible();
    await this.page.keyboard.type(text);
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async dragAndDropComponentToVariantViaCanvas(x, y) {
    await expect(this.copyLayer).toBeVisible();
    await this.copyLayer.hover();
    await this.copyLayer.dragTo(this.viewport, {
      force: false,
      targetPosition: { x: x, y: y },
    });
  }

  async copyElementViaAltDragAndDrop(x, y) {
    await expect(this.copyLayer).toBeVisible();
    await this.copyLayer.hover();
    await this.page.keyboard.down('Alt');
    await this.copyLayer.dragTo(this.viewport, {
      force: false,
      targetPosition: { x: x, y: y },
    });
    await this.page.keyboard.up('Alt');
  }

  async createTextLayerByCoordinates(x, y, text) {
    await this.clickCreateTextButton();
    await this.clickViewportByCoordinates(x, y);
    await expect(this.textbox).toBeVisible();
    await this.page.keyboard.type(text);
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async isCornerHandleVisible(visible = true) {
    visible
      ? await expect(this.cornerHandle).toBeVisible()
      : await expect(this.cornerHandle).not.toBeVisible();
  }

  maskViewport(
    { gridEditorToolbar = false, usersSection = false } = {},
    additionalElements = [],
  ) {
    return [
      this.guides,
      this.guidesFragment,
      this.toolBarWindow,
      this.bottomPaletteToolBar,
      ...(gridEditorToolbar ? [this.gridEditorToolBar] : []),
      ...(usersSection ? [this.usersSection] : []),
      ...additionalElements,
    ];
  }
};
