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
    this.createBoardButton = page.locator('button[data-test="artboard-btn"]');
    this.createRectangleButton = page.locator('button[data-test="rect-btn"]');
    this.createEllipseButton = page.locator('button[data-test="ellipse-btn"]');
    this.createTextButton = page.locator('button[title="Text (T)"]');
    this.uploadImageSelector = page.locator('#image-upload');
    this.createCurveButton = page.locator('button[data-test="curve-btn"]');
    this.createPathButton = page.locator('button[data-test="path-btn"]');
    this.colorsPaletteButton = page.locator('button[title^="Color Palette"]');
    this.mainToolBar = page.locator(
      '[class*="main-toolbar"] button[class*="toolbar-handler"]',
    );
    this.designTab = page.locator('div[data-id="design"]');

    //Viewport
    this.textbox = page.locator('div[role="textbox"] div[contenteditable="true"]');
    this.guides = page.locator('.guides .new-guides');

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
    this.mainMenuButton = page.locator('#left-sidebar-aside svg.icon-menu-refactor');
    this.mainMenuList = page.locator('ul[class*="main_ui_workspace_main_menu__menu"]');
    this.viewMainMenuItem = page.locator('#file-menu-view');
    this.fileMainMenuItem = page.locator('#file-menu-file');
    this.editMainMenuItem = page.locator('#file-menu-edit');
    this.helpInfoMenuItem = page.locator('#file-menu-help-info');

    // Main menu - second level
    this.showRulersMainMenuSubItem = page.locator(
      '#file-menu-rulers span:text-is("Show rulers")',
    );
    this.hideRulersMainMenuSubItem = page.locator(
      '#file-menu-rulers span:text-is("Hide rulers")',
    );
    this.hideGridsMainMenuSubItem = page.locator(
      '#file-menu-grid span:text-is("Hide grids")',
    );
    this.showGridsMainMenuSubItem = page.locator(
      '#file-menu-grid span:text-is("Show grid")',
    );
    this.selectAllMainMenuSubItem = page.locator('#file-menu-select-all');
    this.showColorPaletteMainMenuSubItem = page.locator(
      '#file-menu-color-palette span:text-is("Show color palette")',
    );
    this.hideColorPaletteMainMenuSubItem = page.locator(
      '#file-menu-color-palette span:text-is("Hide color palette")',
    );
    this.showBoardNamesMainMenuSubItem = page.locator(
      'li[data-test="display-artboard-names"] span:text-is("Show boards names")',
    );
    this.hideBoardNamesMainMenuSubItem = page.locator(
      'li[data-test="display-artboard-names"] span:text-is("Hide board names")',
    );
    this.showPixelGridMainMenuSubItem = page.locator(
      '#file-menu-pixel-grid span:text-is("Show pixel grid")',
    );
    this.hidePixelGridMainMenuSubItem = page.locator(
      '#file-menu-pixel-grid span:text-is("Hide pixel grid")',
    );
    this.showHideUIMainMenuSubItem = page.locator(
      'li[data-test="hide-ui"] span:text-is("Show / Hide UI")',
    );
    this.dowloadPenpotFileMenuSubItem = page.locator('#file-menu-binary-file');
    this.dowloadStandartFileMenuSubItem = page.locator('#file-menu-standard-file');
    this.addAsSharedLibraryFileMenuSubItem = page.locator('#file-menu-add-shared');
    this.removeAsSharedLibraryFileMenuSubItem = page.locator(
      '#file-menu-remove-shared',
    );
    this.shortcutsMenuSubItem = page.locator('#file-menu-shortcuts');
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick-refactor"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');

    //Zoom
    this.zoomButton = page.locator('div[title="Zoom"]');
    this.zoomPlusButton = page.locator(
      'button[class*="header__zoom-btn"] svg[class="icon-add-refactor"]',
    );
    this.zoomMinusButton = page.locator(
      'button[class*="header__zoom-btn"] svg[class="icon-remove-refactor"]',
    );
    this.zoomResetButton = page.locator('button:has-text("Reset")');
    this.zoomToFitAllMenuItem = page.locator('li:has-text("Zoom to fit all")');
    this.zoomSelectedMenuItem = page.locator('li:has-text("Zoom to selected")');

    //Pages
    this.addPageButton = page.locator('button[class*="add-page"]');
    this.pagesBlock = page.locator('div.main_ui_workspace_sidebar_sitemap__sitemap');
    this.firstPageListItem = page.locator(
      'ul[class*="page-list"] div[class*="element-list-body"] >>nth=0',
    );
    this.secondPageListItem = page.locator(
      'ul[class*="page-list"] div[class*="element-list-body"] >>nth=1',
    );
    this.pageNameInput = page.locator(
      'ul[class*="page-list"] div[class*="element-list-body"] input',
    );
    this.renamePageMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li span:has-text("Rename")',
    );
    this.duplicatePageMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li span:has-text("Duplicate")',
    );
    this.deletePageMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li span:has-text("Delete")',
    );
    this.collapseExpandPagesButton = page.locator(
      'span[class*="collapsabled-icon"]',
    );
    this.pageTrashIcon = page.locator(
      'div[class*="selected"] svg[class="icon-delete-refactor"]',
    );
    this.deletePageOkButton = page.locator('input[value="Ok"]');

    // Bottom palette
    this.bottomPaletteContentBlock = page.locator(
      'div[class="main_ui_workspace_palette__palette"]',
    );
    this.fontRecordOnTypographiesBottomPanel = page.locator(
      'div[class*="text_palette__typography-item"]',
    );
    this.typographiesColorsBottomPanel = page.locator(
      'div.main_ui_workspace_palette__wide',
    );

    //Header
    this.unSavedChangesIcon = page.locator('div[title="Unsaved changes"]');
    this.usersSection = page.locator('div[class*="users-section"]');
    this.projectNameSpan = page.locator('div[class*="project-name"]');
    this.fileNameSpan = page.locator('div[class*="file-name"]');

    //History panel
    this.historyPanelButton = page.locator('button[title^="History"]');
    this.historyPanelActionRecord = page.locator(
      'div[class*="history-entry-summary-text"]',
    );

    //Shortcuts panel
    this.shortcutsPanel = page.locator(
      'div[class="main_ui_workspace_sidebar_shortcuts__shortcuts"]',
    );
    this.closeShortcutsPanelIcon = page.locator(
      'div[class*="shortcuts-close-button"]',
    );

    this.fileLeftSidebarAside = page.locator('#left-sidebar-aside');
    this.fileRightSidebarAside = page.locator('#right-sidebar-aside');
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

  async typeText(text) {
    await this.textbox.fill(text);
  }

  async typeTextFromKeyboard() {
    await this.page.keyboard.press('H');
    await this.page.keyboard.press('e');
    await this.page.keyboard.press('l');
    await this.page.keyboard.press('l');
    await this.page.keyboard.press('o');
    await this.page.keyboard.press('Space');
    await this.page.keyboard.press('W');
    await this.page.keyboard.press('o');
    await this.page.keyboard.press('r');
    await this.page.keyboard.press('l');
    await this.page.keyboard.press('d');
    await this.page.keyboard.press('!');
  }

  async uploadImage(filePath) {
    await this.uploadImageSelector.setInputFiles(filePath);
  }

  async clickCreateCurveButton() {
    await this.createCurveButton.click({ delay: 500 });
  }

  async clickCreatePathButton() {
    await this.createPathButton.click({ delay: 500 });
    await expect(this.pathActionsBlock).toBeVisible();
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

  async isUnSavedChangesDisplayed() {
    await expect(this.unSavedChangesIcon).toBeVisible();
  }

  async isCreatedLayerVisible() {
    await expect(this.createdLayer).toBeVisible();
  }

  async doubleClickCreatedBoardTitleOnCanvas() {
    await this.createdBoardTitle.dblclick();
  }

  async clickCreatedBoardTitleOnCanvas() {
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

  async focusLayerViaShortcut() {
    await this.page.keyboard.press('F');
  }

  async drawCurve(x1, y1, x2, y2) {
    await this.page.waitForTimeout(100);
    await this.viewport.hover();
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
    await expect(this.viewport).toBeVisible();
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
    if (getPlatformName() === 'MacOS') {
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
    await this.page.waitForTimeout(300)
    await this.selectAllMainMenuSubItem.click();
  }

  async clickShowColorPaletteMainMenuSubItem() {
    await this.showColorPaletteMainMenuSubItem.click();
  }

  async clickHideColorPaletteMainMenuSubItem() {
    await this.hideColorPaletteMainMenuSubItem.click();
  }

  async pressHideShowRulersShortcut(browserName) {
    if (getPlatformName() === 'MacOS') {
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
    if (getPlatformName() === 'MacOS') {
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
    if (getPlatformName() === 'MacOS') {
      await this.page.keyboard.press('Meta+A');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+A');
      } else {
        await this.page.keyboard.press('Control+A');
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

  async downloadPenpotFileViaMenu() {
    await this.dowloadPenpotFileMenuSubItem.click();
    await this.page.waitForEvent('download');
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadStandardFileViaMenu() {
    await this.dowloadStandartFileMenuSubItem.click();
    await this.page.waitForEvent('download');
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async clickAddPageButton() {
    await this.addPageButton.click();
  }

  async isFirstPageAddedToAssetsPanel() {
    await expect(this.firstPageListItem).toBeVisible();
  }

  async isFirstPageNameDisplayed(name) {
    await expect(this.firstPageListItem).toHaveText(name);
  }

  async isSecondPageAddedToAssetsPanel() {
    await expect(this.secondPageListItem).toBeVisible();
  }

  async isSecondPageNameDisplayed(name) {
    await expect(this.secondPageListItem).toHaveText(name);
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

  async duplicatePageViaRightClick() {
    await this.firstPageListItem.click({ button: 'right' });
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
    await this.clickOnDesignTab(); // todo: need to remove after issue fix
    // await this.clickOnMainToolBar(); //todo bug 6171 > need to uncomment after fix these 2 rows
    // await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultOpenPath() {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(500, 200);
    await this.clickViewportByCoordinates(1200, 700);
    await this.clickViewportByCoordinates(1000, 400);
    await this.clickOnDesignTab(); // todo: need to remove after issue fix
    // await this.clickOnMainToolBar(); //todo bug 6171 > need to uncomment after fix these 2 rows
    // await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultCurveLayer() {
    await this.clickCreateCurveButton();
    await this.drawCurve(900, 300, 600, 200);
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultTextLayer(browserName) {
    await this.clickCreateTextButton();
    await this.clickViewportByCoordinates(200, 300);
    if (browserName === 'webkit') {
      await this.typeTextFromKeyboard();
    } else {
      await this.typeText('Hello World!');
    }
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async clickOnMainToolBar() {
    await this.mainToolBar.click();
  }

  async clickOnDesignTab() {
    await this.designTab.click();
  }

  async createComponentsMultipleShapesRightClick(singleComponent = true) {
    const layerSel = this.page.locator('div.viewport .main.viewport-selrect');
    await layerSel.last().click({ button: 'right', force: true });
    if (singleComponent) {
      await this.createComponentMenuItem.click();
    } else {
      await this.createMultipleComponentsMenuItem.click();
    }
  }

  async createComponentViaShortcut(browserName) {
    await this.createdLayer.click({ force: true });
    if (getPlatformName() === 'MacOS') {
      await this.page.keyboard.press('Meta+K');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+K');
      } else {
        await this.page.keyboard.press('Control+K');
      }
    }
  }

  async duplicateLayerViaRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({ button: 'right', force: true });
    await this.duplicateOption.click();
  }

  async showInAssetsPanelRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({ button: 'right', force: true });
    await this.showInAssetsPanelOption.click();
  }
};
