const { expect } = require("@playwright/test");
const { BasePage } = require("../base-page");
const { getPlatformName } = require("../../helpers/string-generator");

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
    this.uploadImageSelector = page.locator("#image-upload");
    this.createCurveButton = page.locator('button[data-test="curve-btn"]');
    this.createPathButton = page.locator('button[data-test="path-btn"]');
    this.shortcutsPanelButton = page.locator(".icon-shortcut");
    this.colorsPaletteButton = page.locator('button[title^="Color Palette"]');
    this.mainToolBar = page.locator(
      '[class*="main-toolbar"] button[class*="toolbar-handler"]',
    );

    //Viewport
    this.viewport = page.locator('div[class="viewport"]');
    this.createdLayer = page.locator(
      'div[class="viewport"] [id^="shape"] >> nth=0',
    );
    this.createdBoardTitle = page.locator('g[class="frame-title"] >> nth=0');
    this.textbox = page.locator(
      'div[role="textbox"] div[contenteditable="true"]',
    );
    this.guides = page.locator(".guides .new-guides");

    //Layer right-click menu items
    this.deleteLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Delete")',
    );
    this.hideLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Hide")',
    );
    this.showLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Show")',
    );
    this.focusOnLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Focus on")',
    );
    this.transformToPathMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Transform to path")',
    );
    this.selectionToBoardMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Selection to board")',
    );
    this.createComponentMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Create component")',
    );
    this.flipVerticalMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Flip vertical")',
    );
    this.flipHorizontalMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Flip horizontal")',
    );
    this.editPathMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Edit")',
    );
    this.addFlexLayout = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Add flex layout")',
    );
    this.removeFlexLayout = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Remove flex layout")',
    );

    //Design panel - Grid section
    this.gridSection = page.locator('div.element-set-title:has-text("Grid")');
    this.gridMainOptionSection = page.locator('div[class="grid-option-main"]');
    this.addGridButton = page.locator(
      'div[class="element-set"] div:has-text("Grid") svg',
    );
    this.removeGridButton = page.locator(
      'div[class="grid-option-main-actions"] svg[class="icon-minus"]',
    );
    this.hideGridButton = page.locator(
      'div[class="grid-option-main-actions"] svg[class="icon-eye"]',
    );
    this.unhideGridButton = page.locator(
      'div[class="grid-option-main-actions"] svg[class="icon-eye-closed"]',
    );
    this.gridTypeSelector = page.locator(
      'div[class="grid-option"] div[class="custom-select flex-grow"]',
    );
    this.gridTypeSelectorSquareOption = page.locator('span:has-text("Square")');
    this.gridTypeSelectorColumnsOption = page.locator(
      'span:has-text("Columns")',
    );
    this.gridTypeSelectorRowsOption = page.locator('span:has-text("Rows")');
    this.gridSizeInput = page.locator('div[class="grid-option"] input');
    this.gridActionsButton = page.locator(
      'div[class="grid-option"] svg[class="icon-actions"] >> visible=true',
    );
    this.gridOpacityInput = page.locator(
      'div[class="grid-option"] div[class="input-element percentail"] input',
    );
    this.useDefaultGridButton = page.locator('button:has-text("Use default")');
    this.gridWidthInput = page.locator(
      '//*[text()="Width"]//parent::div[@class="row-flex input-row"]//input',
    );
    this.gridHeightInput = page.locator(
      '//*[text()="Height"]//parent::div[@class="row-flex input-row"]//input',
    );

    //Design panel - Export section
    this.exportSection = page.locator(
      'div.element-set-title:has-text("Export")',
    );
    this.addExportButton = page.locator(
      'div[class="element-set exports-options"] svg',
    );
    this.removeExportButton = page.locator(
      'div[class="element-set exports-options"] svg[class="icon-minus"]',
    );
    this.exportElementButton = page.locator(
      'div[class="btn-icon-dark download-button "]',
    );

    //Design panel - Flex Layout section
    this.removeLayoutButton = page.locator(
      'div[class="element-set-title"] button[class="remove-layout"]',
    );
    this.layoutSection = page.locator(
      'div[class="element-set-content layout-menu"]',
    );
    this.layoutDirectRowBtn = page.locator(
      'div[class="layout-row"] button[alt="Row"]',
    );
    this.layoutDirectRowReverseBtn = page.locator(
      'div[class="layout-row"] button[alt="Row reverse"]',
    );
    this.layoutDirectColumnBtn = page.locator(
      'div[class="layout-row"] button[alt="Column"]',
    );
    this.layoutDirectColumnReverseBtn = page.locator(
      'div[class="layout-row"] button[alt="Column reverse"]',
    );
    this.layoutAlignStartBtn = page.locator(
      'div[class="layout-row"] button[alt="Align items start"]',
    );
    this.layoutAlignCenterBtn = page.locator(
      'div[class="layout-row"] button[alt="Align items center"]',
    );
    this.layoutAlignEndBtn = page.locator(
      'div[class="layout-row"] button[alt="Align items end"]',
    );
    this.layoutJustifyStartBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content start"]',
    );
    this.layoutJustifyCenterBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content center"]',
    );
    this.layoutJustifyEndBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content end"]',
    );
    this.layoutJustifySpaceBetweenBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content space-between"]',
    );
    this.layoutJustifySpaceAroundBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content space-around"]',
    );
    this.layoutJustifySpaceEvenlyBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content space-evenly"]',
    );
    this.layoutColumnGapInput = page.locator(
      'div[class="gap-group"] div[alt="Column gap"] input',
    );
    this.layoutRowGapInput = page.locator(
      'div[class="gap-group"] div[alt="Row gap"] input',
    );
    this.layoutVerticalPaddingInput = page.locator(
      'div[class="padding-group"] div[alt="Vertical padding"] input',
    );
    this.layoutHorizontPaddingInput = page.locator(
      'div[class="padding-group"] div[alt="Horizontal padding"] input',
    );
    this.layoutIndepPaddingsIcon = page.locator(
      'div[class="padding-icons"] div[alt="Independent paddings"]',
    );
    this.layoutPaddingTopInput = page.locator(
      'div[class="padding-row"] div[alt="Top"] input',
    );
    this.layoutPaddingRightInput = page.locator(
      'div[class="padding-row"] div[alt="Right"] input',
    );
    this.layoutPaddingBottomInput = page.locator(
      'div[class="padding-row"] div[alt="Bottom"] input',
    );
    this.layoutPaddingLeftInput = page.locator(
      'div[class="padding-row"] div[alt="Left"] input',
    );

    //Node panel
    this.pathActionsBlock = page.locator(
      'div[class$="path_actions__sub-actions"]',
    );
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
    this.nodePanelAddNodeButton = page.locator('div[alt^="Add node"] >> nth=0');
    this.nodePanelDeleteNodeButton = page.locator(
      'div[alt^="Delete node"] >> nth=0',
    );
    this.nodePanelMergeNodesButton = page.locator(
      'div[alt^="Merge nodes"] >> nth=0',
    );
    this.nodePanelDrawNodesButton = page.locator(
      'div[alt="Draw nodes (P)"] >> nth=0',
    );
    this.nodePanelMoveNodesButton = page.locator(
      'div[alt="Move nodes (M)"] >> nth=0',
    );
    this.nodePanelJoinNodesButton = page.locator(
      'div[alt="Join nodes (J)"] >> nth=0',
    );
    this.nodePanelSeparateNodesButton = page.locator(
      'div[alt="Separate nodes (K)"] >> nth=0',
    );
    this.nodePanelToCornerButton = page.locator(
      'div[alt="To corner (X)"] >> nth=0',
    );
    this.nodePanelToCurveButton = page.locator(
      'div[alt="To curve (C)"] >> nth=0',
    );

    // Main menu - first level
    this.mainMenuButton = page.locator('div[class*="header__menu-btn"]');
    this.mainMenuList = page.locator('ul[class*="header__menu"]');
    this.viewMainMenuItem = page.locator("#file-menu-view");
    this.fileMainMenuItem = page.locator("#file-menu-file");
    this.editMainMenuItem = page.locator("#file-menu-edit");
    this.helpInfoMenuItem = page.locator("#file-menu-help-info");

    // Main menu - second level
    this.showRulersMainMenuSubItem = page.locator(
      'li[data-test="rules"] span:text-is("Show rulers")',
    );
    this.hideRulersMainMenuSubItem = page.locator(
      'li[data-test="rules"] span:text-is("Hide rulers")',
    );
    this.hideGridsMainMenuSubItem = page.locator(
      'li[data-test="display-grid"] span:text-is("Hide grids")',
    );
    this.showGridsMainMenuSubItem = page.locator(
      'li[data-test="display-grid"] span:text-is("Show grid")',
    );
    this.selectAllMainMenuSubItem = page.locator("#file-menu-select-all");
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
    this.dowloadPenpotFileMenuSubItem = page.locator("#file-menu-binary-file");
    this.dowloadStandartFileMenuSubItem = page.locator(
      "#file-menu-standard-file",
    );
    this.addAsSharedLibraryFileMenuSubItem = page.locator(
      "#file-menu-add-shared",
    );
    this.removeAsSharedLibraryFileMenuSubItem = page.locator(
      "#file-menu-remove-shared",
    );
    this.shortcutsMenuSubItem = page.locator("#file-menu-shortcuts");

    //Zoom
    this.zoomPlusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("+")',
    );
    this.zoomMinusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("-")',
    );
    this.zoomResetButton = page.locator('button[class="reset-btn"]');
    this.zoomButton = page.locator('div[class*="zoom-widget"]');
    this.zoomToFitAllMenuItem = page.locator('li:has-text("Zoom to fit all")');
    this.zoomSelectedMenuItem = page.locator('li:has-text("Zoom to selected")');
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');

    //Layers panel > Pages
    this.addPageButton = page.locator('div[class="add-page"] svg');
    this.firstPageListItem = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] >>nth=0',
    );
    this.secondPageListItem = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] >>nth=1',
    );
    this.firstPageNameInput = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] input',
    );
    this.secondPageNameInput = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] input',
    );
    this.renamePageMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li span:has-text("Rename")',
    );
    this.duplicatePageMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li span:has-text("Duplicate")',
    );
    this.deletePageMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li span:has-text("Delete")',
    );
    this.collapseExpandPagesButton = page.locator(
      'div[class="collapse-pages"]',
    );
    this.pageTrashIcon = page.locator(
      'svg[class="icon-trash"] >> visible=true',
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
      "div.main_ui_workspace_palette__wide",
    );

    //Prototype panel
    this.prototypeTab = page.locator('div[data-id=":prototype"]');
    this.prototypeArrowConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-primary)"] >>nth=0',
    );
    this.prototypeArrowSecondConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-primary)"] >>nth=1',
    );
    this.prototypePanelFlowNameText = page.locator(
      'span[class="element-label flow-name"]',
    );
    this.prototypePanelFlowNameInput = page.locator(
      'input[class="element-name"]',
    );
    this.prototypePanelFirstFlowNameText = page.locator(
      'span[class="element-label flow-name"] >>nth=0',
    );
    this.prototypePanelSecondFlowNameText = page.locator(
      'span[class="element-label flow-name"] >>nth=1',
    );
    this.addInteractionButton = page.locator(
      'div:has-text("Interactions") svg[class="icon-plus"]',
    );
    this.removeSecondInteractionButton = page.locator(
      'div[class="element-set-actions-button"] svg[class="icon-minus"] >>nth=1',
    );
    this.firstInteractionRecord = page.locator(
      'div[class="interactions-summary"] >>nth=0',
    );
    this.secondInteractionRecord = page.locator(
      'div[class="interactions-summary"] >>nth=1',
    );
    this.interactionDestinationSelector = page.locator(
      'div[class="interactions-element"] select',
    );
    this.removeFlowButton = page.locator(
      'div[class="flow-element"] svg[class="icon-minus"]',
    );

    //Header
    this.unSavedChangesIcon = page.locator(
      'div.pending span:text-is("Unsaved changes")',
    );
    this.usersSection = page.locator('div[class*="users-section"]');
    this.projectNameSpan = page.locator(
      'div[class="project-tree"] span[class="project-name"]',
    );
    this.fileNameSpan = page.locator('div[class="project-tree"] span');

    //History panel
    this.historyPanelButton = page.locator('button[class^="document-history"]');
    this.historyPanelActionRecord = page.locator(
      'div[class="history-entry-summary-text"]',
    );

    //Shortcuts panel
    this.shortcutsPanel = page.locator(
      'div[class="main_ui_workspace_sidebar_shortcuts__shortcuts"]',
    );
    this.closeShortcutsPanelIcon = page.locator(
      'div[class*="shortcuts-close-button"]',
    );

    //Colors panel
    this.colorsPalette = page.locator('div[class="color-palette "]');
  }

  async clickCreateBoardButton() {
    await this.createBoardButton.click();
  }

  async clickCreateRectangleButton() {
    await this.createRectangleButton.click();
  }

  async clickCreateEllipseButton() {
    await this.createEllipseButton.click();
  }

  async clickCreateTextButton() {
    await this.createTextButton.click();
  }

  async typeText(text) {
    await this.textbox.fill(text);
  }

  async typeTextFromKeyboard() {
    await this.page.keyboard.press("H");
    await this.page.keyboard.press("e");
    await this.page.keyboard.press("l");
    await this.page.keyboard.press("l");
    await this.page.keyboard.press("o");
    await this.page.keyboard.press("Space");
    await this.page.keyboard.press("W");
    await this.page.keyboard.press("o");
    await this.page.keyboard.press("r");
    await this.page.keyboard.press("l");
    await this.page.keyboard.press("d");
    await this.page.keyboard.press("!");
  }

  async uploadImage(filePath) {
    await this.uploadImageSelector.setInputFiles(filePath);
  }

  async clickCreateCurveButton() {
    await this.createCurveButton.click();
    await this.page.waitForTimeout(100);
  }

  async clickCreatePathButton() {
    await this.createPathButton.click();
    await expect(this.pathActionsBlock).toBeVisible();
  }

  async clickViewportOnce() {
    await this.viewport.click();
  }

  async clickViewportTwice(delayMs = 300) {
    await this.viewport.click({ delay: delayMs });
    await this.viewport.click({ delay: delayMs });
  }

  async clickViewportByCoordinates(x, y) {
    await this.viewport.click({
      position: { x: x, y: y },
      clickCount: 2,
      delay: 500,
    });
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
      `//*[text()="${title}"]//parent::*[@class="frame-title"]`,
    );
    await boardSel.dblclick();
  }

  async hideLayerViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(
      `//*[text()="${title}"]//parent::*[@class="frame-title"]`,
    );
    await boardSel.click({ button: "right", force: true });
    await this.hideLayerMenuItem.click();
  }

  async focusBoardViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(
      `//*[text()="${title}"]//parent::*[@class="frame-title"]`,
    );
    await boardSel.click({ button: "right", force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async focusLayerViaRightClickOnCanvas() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async focusLayerViaRightClickOnLayersTab(layer) {
    const layerSel = this.page.locator(
      `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`,
    );
    await layerSel.click({ button: "right", force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async focusLayerViaShortcut() {
    await this.page.keyboard.press("F");
  }

  async drawCurve(x1, y1, x2, y2) {
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

  async deleteLayerViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.deleteLayerMenuItem.click();
  }

  async addFlexLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: "right", force: true });
    await this.addFlexLayout.click();
  }

  async removeFlexLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: "right", force: true });
    await this.removeFlexLayout.click();
  }

  async pressFlexLayoutShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press("Shift+A");
  }

  async isLayoutMenuExpanded(condition = true) {
    if (condition === true) {
      await expect(this.layoutSection).toBeVisible();
    } else {
      await expect(this.layoutSection).toBeHidden();
    }
  }

  async removeLayoutFromDesignPanel() {
    await this.removeLayoutButton.click();
  }

  async changeLayoutDirection(direction) {
    switch (direction) {
      case "Row":
        await this.layoutDirectRowBtn.click();
        break;
      case "Row reverse":
        await this.layoutDirectRowReverseBtn.click();
        break;
      case "Column":
        await this.layoutDirectColumnBtn.click();
        break;
      case "Column reverse":
        await this.layoutDirectColumnReverseBtn.click();
        break;
    }
  }

  async changeLayoutAlignment(alignment) {
    switch (alignment) {
      case "Start":
        await this.layoutAlignStartBtn.click();
        break;
      case "Center":
        await this.layoutAlignCenterBtn.click();
        break;
      case "End":
        await this.layoutAlignEndBtn.click();
        break;
    }
  }

  async changeLayoutJustification(justify) {
    switch (justify) {
      case "Start":
        await this.layoutJustifyStartBtn.click();
        break;
      case "Center":
        await this.layoutJustifyCenterBtn.click();
        break;
      case "End":
        await this.layoutJustifyEndBtn.click();
        break;
      case "Space between":
        await this.layoutJustifySpaceBetweenBtn.click();
        break;
      case "Space around":
        await this.layoutJustifySpaceAroundBtn.click();
        break;
      case "Space evenly":
        await this.layoutJustifySpaceEvenlyBtn.click();
        break;
    }
  }

  async changeLayoutColumnGap(value) {
    await this.layoutColumnGapInput.fill(value);
    await this.clickOnEnter();
  }

  async clickLayoutColumnGapField() {
    await this.layoutColumnGapInput.click();
  }

  async changeLayoutRowGap(value) {
    await this.layoutRowGapInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutVerticalPadding(value) {
    await this.layoutVerticalPaddingInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutHorizontalPadding(value) {
    await this.layoutHorizontPaddingInput.fill(value);
    await this.clickOnEnter();
  }

  async clickLayoutVerticalPaddingField() {
    await this.layoutVerticalPaddingInput.click();
  }

  async clickLayoutHorizontalPaddingField() {
    await this.layoutHorizontPaddingInput.click();
  }

  async switchToIndependentPadding() {
    await this.layoutIndepPaddingsIcon.click();
  }

  async changeLayoutTopPadding(value) {
    await this.layoutPaddingTopInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutBottomPadding(value) {
    await this.layoutPaddingBottomInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutRightPadding(value) {
    await this.layoutPaddingRightInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutLeftPadding(value) {
    await this.layoutPaddingLeftInput.fill(value);
    await this.clickOnEnter();
  }

  async transformToPathViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.transformToPathMenuItem.click();
  }

  async selectionToBoardViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.selectionToBoardMenuItem.click();
  }

  async createComponentViaRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({ button: "right", force: true });
    await this.createComponentMenuItem.click();
  }

  async flipVerticalViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.flipVerticalMenuItem.click();
  }

  async flipHorizontalViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.flipHorizontalMenuItem.click();
  }

  async flipVerticalViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press("Shift+V");
  }

  async flipHorizontalViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press("Shift+H");
  }

  async deleteLayerViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.pressDeleteKeyboardButton();
  }

  async openNodesPanelViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.editPathMenuItem.click();
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
    await this.page.keyboard.down("Shift");
  }

  async releaseShiftKeyboardButton() {
    await this.page.keyboard.up("Shift");
  }

  async clickAddNodeButtonOnNodePanel() {
    await this.nodePanelAddNodeButton.click();
  }

  async pressShiftPlusKeyboardShortcut() {
    await this.page.keyboard.press("Shift+NumpadAdd");
  }

  async clickDeleteNodeButtonOnNodePanel() {
    await this.nodePanelDeleteNodeButton.click();
  }

  async pressDeleteKeyboardButton() {
    await this.page.keyboard.press("Delete");
  }

  async clickMergeNodesButtonOnNodePanel() {
    await this.nodePanelMergeNodesButton.click();
  }

  async pressCtrlJKeyboardShortcut() {
    await this.page.keyboard.press("Control+J");
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
    await this.page.keyboard.press("J");
  }

  async clickSeparateNodesButtonOnNodePanel() {
    await this.nodePanelSeparateNodesButton.click();
  }

  async pressKKeyboardShortcut() {
    await this.page.keyboard.press("K");
  }

  async clickToCornerButtonOnNodePanel() {
    await this.nodePanelToCornerButton.click();
  }

  async pressXKeyboardShortcut() {
    await this.page.keyboard.press("X");
  }

  async clickToCurveButtonOnNodePanel() {
    await this.nodePanelToCurveButton.click();
  }

  async pressCKeyboardShortcut() {
    await this.page.keyboard.press("C");
  }

  async clickAddGridButton() {
    await this.gridSection.waitFor();
    await this.addGridButton.click();
  }

  async clickRemoveGridButton() {
    await this.gridMainOptionSection.hover();
    await this.removeGridButton.click();
  }

  async clickHideGridButton() {
    await this.gridMainOptionSection.hover();
    await this.hideGridButton.click();
  }

  async clickUnhideGridButton() {
    await this.gridMainOptionSection.hover();
    await this.unhideGridButton.click();
  }

  async changeSizeForGrid(value) {
    await this.clearInput(this.gridSizeInput);
    await this.gridSizeInput.fill(value);
  }

  async clickGridActionsButton() {
    await this.gridActionsButton.click();
  }

  async changeOpacityForGrid(value) {
    await this.clearInput(this.gridOpacityInput);
    await this.gridOpacityInput.fill(value);
  }

  async clickUseDefaultGridButton() {
    await this.useDefaultGridButton.click();
  }

  async selectGridType(type) {
    await this.gridTypeSelector.click();
    switch (type) {
      case "Square":
        await this.gridTypeSelectorSquareOption.click();
        break;
      case "Columns":
        await this.gridTypeSelectorColumnsOption.click();
        break;
      case "Rows":
        await this.gridTypeSelectorRowsOption.click();
        break;
    }
  }

  async changeColumnsOrRowsNumberForGrid(value) {
    await this.clearInput(this.gridSizeInput);
    await this.gridSizeInput.fill(value);
  }

  async changeWidthForGrid(value) {
    await this.clearInput(this.gridWidthInput);
    await this.gridWidthInput.fill(value);
  }

  async changeHeightForGrid(value) {
    await this.clearInput(this.gridHeightInput);
    await this.gridHeightInput.fill(value);
  }

  async clickMainMenuButton() {
    await this.mainMenuButton.click();
    await expect(this.mainMenuList).toBeVisible();
  }

  async clickViewMainMenuItem() {
    await this.viewMainMenuItem.click({ force: true });
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
    await this.selectAllMainMenuSubItem.click();
  }

  async clickShowColorPaletteMainMenuSubItem() {
    await this.showColorPaletteMainMenuSubItem.click();
  }

  async clickHideColorPaletteMainMenuSubItem() {
    await this.hideColorPaletteMainMenuSubItem.click();
  }

  async pressHideShowRulersShortcut(browserName) {
    const os = getPlatformName();
    if (os === "MacOS") {
      await this.page.keyboard.press("Meta+Shift+R");
    } else {
      if (browserName === "webkit") {
        await this.page.keyboard.press("Meta+Shift+R");
      } else {
        await this.page.keyboard.press("Control+Shift+R");
      }
    }
  }

  async pressHideShowGridsShortcut(browserName) {
    const os = getPlatformName();
    if (os === "MacOS") {
      await this.page.keyboard.press("Meta+'");
    } else {
      if (browserName === "webkit") {
        await this.page.keyboard.press("Meta+'");
      } else {
        await this.page.keyboard.press("Control+'");
      }
    }
  }

  async pressSelectAllShortcut(browserName) {
    const os = getPlatformName();
    if (os === "MacOS") {
      await this.page.keyboard.press("Meta+A");
    } else {
      if (browserName === "webkit") {
        await this.page.keyboard.press("Meta+A");
      } else {
        await this.page.keyboard.press("Control+A");
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
    await this.clickZoomButton();
  }

  async decreaseZoom(numberOfTimes) {
    await this.clickZoomButton();
    for (let i = 0; i <= numberOfTimes; i++) {
      await this.zoomMinusButton.click();
    }
    await this.clickZoomButton();
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
    await this.page.keyboard.press("Shift+,");
  }

  async pressHideShowUIShortcut() {
    await this.page.keyboard.press("Backslash");
  }

  async downloadPenpotFileViaMenu() {
    await this.dowloadPenpotFileMenuSubItem.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadStandardFileViaMenu() {
    await this.dowloadStandartFileMenuSubItem.click();
    await this.page.waitForEvent("download");
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

  async renameFirstPageViaRightClick(newName) {
    await this.firstPageListItem.click({ button: "right" });
    await this.renamePageMenuItem.click();
    await this.clearInput(this.firstPageNameInput);
    await this.firstPageNameInput.fill(newName);
    await this.clickViewportTwice();
  }

  async renameSecondPageViaDoubleClick(newName) {
    await this.secondPageListItem.dblclick();
    await this.clearInput(this.secondPageNameInput);
    await this.secondPageNameInput.fill(newName);
    await this.clickViewportTwice();
  }

  async duplicatePageViaRightClick() {
    await this.firstPageListItem.click({ button: "right" });
    await this.duplicatePageMenuItem.click();
  }

  async clickFirstPageOnAssetsPanel() {
    await this.firstPageListItem.click();
    await expect(this.firstPageListItem).toHaveClass(
      "element-list-body selected",
    );
  }

  async clickSecondPageOnAssetsPanel() {
    await this.secondPageListItem.click();
    await expect(this.secondPageListItem).toHaveClass(
      "element-list-body selected",
    );
  }

  async clickCollapseExpandPagesButton() {
    await this.collapseExpandPagesButton.click();
  }

  async deleteSecondPageViaRightClick() {
    await this.secondPageListItem.click({ button: "right" });
    await this.deletePageMenuItem.click();
    await this.deletePageOkButton.click();
  }

  async deleteSecondPageViaTrashIcon() {
    await this.secondPageListItem.hover();
    await this.pageTrashIcon.dblclick();
    await this.deletePageOkButton.click();
  }

  async clickPrototypeTab() {
    await this.prototypeTab.click();
  }

  async dragAndDropPrototypeArrowConnector(x, y) {
    await this.prototypeArrowConnector.hover();
    await this.prototypeArrowConnector.dragTo(this.viewport, {
      force: false,
      targetPosition: { x: x, y: y },
    });
  }

  async isFlowNameDisplayedOnPrototypePanel(name) {
    await expect(this.prototypePanelFlowNameText).toHaveText(name);
  }

  async isFirstFlowNameDisplayedOnPrototypePanel(name) {
    await expect(this.prototypePanelFirstFlowNameText).toHaveText(name);
  }

  async isSecondFlowNameDisplayedOnPrototypePanel(name) {
    await expect(this.prototypePanelSecondFlowNameText).toHaveText(name);
  }

  async isFlowNameNotDisplayedOnPrototypePanel() {
    await expect(this.prototypePanelFlowNameText).not.toBeVisible();
  }

  async clickAddInteractionButton() {
    await this.addInteractionButton.click({ delay: 500 });
  }

  async isPrototypeArrowSecondConnectorDisplayed() {
    await expect(this.prototypeArrowSecondConnector).toBeVisible();
  }

  async isPrototypeArrowSecondConnectorNotDisplayed() {
    await expect(this.prototypeArrowSecondConnector).not.toBeVisible();
  }

  async clickRemoveSecondInteractionButton() {
    await this.secondInteractionRecord.hover();
    await this.removeSecondInteractionButton.click();
  }

  async clickFirstInteractionRecord() {
    await this.firstInteractionRecord.click();
  }

  async renameFlow(newName) {
    await this.prototypePanelFlowNameText.dblclick();
    await this.clearInput(this.prototypePanelFlowNameInput);
    await this.prototypePanelFlowNameInput.fill(newName);
    await this.clickPrototypeTab();
  }

  async clickRemoveFlowButton() {
    await this.removeFlowButton.click();
  }

  async selectInteractionDestination(index) {
    await this.interactionDestinationSelector.selectOption({
      index: index,
    });
  }

  async clickHistoryPanelButton() {
    await this.historyPanelButton.click();
  }

  async isActionDisplayedOnHistoryPanel(actionName) {
    await expect(this.historyPanelActionRecord).toHaveText(actionName);
  }

  async clickAddExportButton() {
    await this.exportSection.waitFor();
    await this.addExportButton.click();
  }

  async clickRemoveExportButton() {
    await this.removeExportButton.click();
  }

  async isExportElementButtonDisplayed(title) {
    await expect(this.exportElementButton).toHaveText(title);
  }

  async isExportElementButtonNotDisplayed() {
    await expect(this.exportElementButton).not.toBeVisible();
  }

  async waitForBottomPaletteIsOpened() {
    await expect(this.bottomPaletteContentBlock).toBeVisible();
  }

  async clickFontRecordOnTypographiesBottomPanel() {
    await this.fontRecordOnTypographiesBottomPanel.click();
  }

  async clickShortcutsPanelButton() {
    await this.shortcutsPanelButton.click();
  }

  async pressShortcutsPanelShortcut() {
    await this.page.keyboard.press("Shift+?");
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
    await this.page.keyboard.press("Alt+P");
  }

  async isColorsPaletteDisplayed() {
    await expect(this.typographiesColorsBottomPanel).toBeVisible();
  }

  async isColorsPaletteNotDisplayed() {
    await expect(this.typographiesColorsBottomPanel).not.toBeVisible();
  }

  async backToDashboardFromFileEditor() {
    await this.clickPencilBoxButton();
    await this.isHeaderDisplayed("Projects");
  }

  async pressOpenTypographiesBottomPanelShortcut() {
    await this.page.keyboard.press("Alt+T");
    await this.waitForBottomPaletteIsOpened();
  }

  async createDefaultBoardByCoordinates(x, y, delayMs) {
    await this.clickCreateBoardButton();
    await this.clickViewportByCoordinates(x, y, delayMs);
    await this.waitForChangeIsSaved();
  }

  async createDefaultRectangleByCoordinates(x, y, delayMs) {
    await this.clickCreateRectangleButton();
    await this.clickViewportByCoordinates(x, y, delayMs);
    await this.waitForChangeIsSaved();
  }

  async createDefaultEllipseByCoordinates(x, y, delayMs) {
    await this.clickCreateEllipseButton();
    await this.clickViewportByCoordinates(x, y, delayMs);
    await this.waitForChangeIsSaved();
  }

  async createDefaultClosedPath(delayMs) {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(500, 200, delayMs);
    await this.clickViewportByCoordinates(1200, 700, delayMs);
    await this.clickViewportByCoordinates(1000, 400, delayMs);
    await this.clickViewportByCoordinates(500, 200, delayMs);
    await this.clickOnMainToolBar();
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultOpenPath(delayMs) {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(500, 200, delayMs);
    await this.clickViewportByCoordinates(1200, 700, delayMs);
    await this.clickViewportByCoordinates(1000, 400, delayMs);
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultTextLayer(browserName, x = 200, y = 300) {
    await this.clickCreateTextButton();
    await this.clickViewportByCoordinates(x, y);
    if (browserName === "webkit") {
      await this.typeTextFromKeyboard();
    } else {
      await this.typeText("Hello World!");
    }
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async clickOnMainToolBar() {
    await this.mainToolBar.click();
  }
};
