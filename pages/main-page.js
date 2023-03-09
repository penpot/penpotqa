const { expect } = require("@playwright/test");
const { BasePage } = require("./base-page");
exports.MainPage = class MainPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);
    //Left Toolbar
    this.pencilBoxButton = page.locator('div[class="main-icon"]');
    this.moveButton = page.locator('button[title="Move (V)"]');
    this.createBoardButton = page.locator('button[data-test="artboard-btn"]');
    this.createRectangleButton = page.locator('button[data-test="rect-btn"]');
    this.createEllipseButton = page.locator('button[data-test="ellipse-btn"]');
    this.createTextButton = page.locator('button[title="Text (T)"]');
    this.uploadImageSelector = page.locator("#image-upload");
    this.createCurveButton = page.locator('button[data-test="curve-btn"]');
    this.createPathButton = page.locator('button[data-test="path-btn"]');
    this.createCommentButton = page.locator('button[title="Comments (C)"]');
    this.shortcutsPanelButton = page.locator(".icon-shortcut");
    this.colorsPanelButton = page.locator('button[title^="Color Palette"]');

    //Viewport
    this.viewport = page.locator('div[class="viewport"]');
    this.createdLayer = page.locator('div *[id^="shape"] >> nth=0');
    this.createdBoardTitle = page.locator('g[class="frame-title"]');
    this.textbox = page.locator(
      'div[role="textbox"] div[contenteditable="true"]'
    );

    //Layer right-click menu items
    this.deleteLayerMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Delete")'
    );
    this.transformToPathMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Transform to path")'
    );
    this.selectionToBoardMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Selection to board")'
    );
    this.createComponentMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Create component")'
    );
    this.flipVerticalMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Flip vertical")'
    );
    this.flipHorizontalMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Flip horizontal")'
    );
    this.editPathMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Edit")'
    );

    //Layers panel
    this.layersTab = page.locator('div[data-id=":layers"]');
    this.layersPanel = page.locator('div[class="layers-tab"]');
    this.createdLayerOnLayersPanelNameInput = page.locator(
      'input[class="element-name"]'
    );
    this.createdLayerOnLayersPanelNameText = page.locator(
      'span[class="element-name"]'
    );
    this.searchLayersIcon = page.locator('svg[class="icon-search"]');
    this.searchLayersInput = page.locator('input[placeholder="Search layers"]');
    this.searchedLayerOnLayersPanelNameText = page.locator(
      'span[class="element-name"] >> nth=1'
    );

    //Design panel
    this.canvasBackgroundColorIcon = page.locator(
      'div[class="color-bullet-wrapper"]'
    );
    this.layerRotationInput = page.locator(
      'div[class="input-element degrees"] input'
    );
    this.individualCornersRadiusButton = page.locator(
      'div[alt="Individual corners"]'
    );
    this.firstCornerRadiusInput = page.locator(
      'div[class="input-element mini"] input >> nth=0'
    );
    this.secondCornerRadiusInput = page.locator(
      'div[class="input-element mini"] input >> nth=1'
    );
    this.thirdCornerRadiusInput = page.locator(
      'div[class="input-element mini"] input >> nth=2'
    );
    this.fourthCornerRadiusInput = page.locator(
      'div[class="input-element mini"] input  >> nth=3'
    );

    //Design panel - Shadow section
    this.addShadowButton = page.locator(
      'div[class="element-set shadow-options"] div[class="add-page"] svg'
    );
    this.shadowActionsButton = page.locator(
      'div[class="element-set shadow-options"] svg[class="icon-actions"]'
    );
    this.shadowXInput = page.locator(
      'div[class="element-set shadow-options"] div[title="X"] input'
    );
    this.shadowYInput = page.locator(
      'div[class="element-set shadow-options"] div[title="Y"] input'
    );
    this.shadowBlurInput = page.locator('div[title="Blur"] input');
    this.shadowSpreadInput = page.locator('div[title="Spread"] input');
    this.shadowColorIcon = page.locator(
      'div[class="element-set shadow-options"] div[class="color-bullet-wrapper"]'
    );
    this.shadowOpacityInput = page.locator(
      'div[class="element-set shadow-options"] div[class="input-element percentail"] input'
    );
    this.shadowTypeSelector = page.locator(
      'div[class="element-set shadow-options"] select >> nth=1'
    );

    //Design panel - Blur section
    this.addBlurButton = page.locator(
      'div[class="element-set"] div:has-text("Blur") svg'
    );
    this.blurValueInput = page.locator(
      'div[class="row-flex input-row"] div[class="input-element pixels"] input'
    );

    //Design panel - Fill section
    this.fillColorIcon = page.locator(
      'div[title="Fill"] div[class="color-bullet-wrapper"]'
    );
    this.fillColorInput = page.locator(
      'div[title="Fill"] div[class="color-info"] input'
    );
    this.fillOpacityInput = page.locator(
      'div[title="Fill"] div[class="input-element percentail"] input'
    );
    this.addFillButton = page.locator(
      'div[class="element-set"] div:has-text("Fill") svg'
    );
    this.removeFillButton = page.locator(
      'div[title="Fill"] svg[class="icon-minus"]'
    );

    //Design panel - Grid section
    this.gridMainOptionSection = page.locator('div[class="grid-option-main"]');
    this.addGridButton = page.locator(
      'div[class="element-set"] div:has-text("Grid") svg'
    );
    this.removeGridButton = page.locator(
      'div[class="grid-option-main-actions"] svg[class="icon-minus"]'
    );
    this.gridTypeSelector = page.locator(
      'div[class="custom-select flex-grow"]'
    );
    this.gridTypeSelectorSquareOption = page.locator('span:has-text("Square")');
    this.gridTypeSelectorColumnsOption = page.locator(
      'span:has-text("Columns")'
    );
    this.gridTypeSelectorRowsOption = page.locator('span:has-text("Rows")');
    this.gridSizeInput = page.locator('div[class="grid-option"] input');
    this.gridActionsButton = page.locator(
      'div[class="grid-option"] svg[class="icon-actions"] >> visible=true'
    );
    this.gridOpacityInput = page.locator(
      'div[class="grid-option"] div[class="input-element percentail"] input'
    );
    this.useDefaultGridButton = page.locator('button:has-text("Use default")');
    this.setAsDefaultGridButton = page.locator(
      'button:has-text("Set as default")'
    );
    this.gridSizeInput = page.locator('div[class="grid-option"] input');
    this.gridWidthInput = page.locator(
      'div[class="row-flex input-row"] input >> nth=1'
    );

    //Design panel - Export section
    this.addExportButton = page.locator(
      'div[class="element-set exports-options"] svg'
    );
    this.removeExportButton = page.locator(
      'div[class="element-set exports-options"] svg[class="icon-minus"]'
    );
    this.exportElementButton = page.locator(
      'div[class="btn-icon-dark download-button "]'
    );

    //Design panel - Stroke section
    this.addStrokeButton = page.locator(
      'div[class="element-set"] div:has-text("Stroke") svg'
    );
    this.strokeColorBullet = page.locator(
      'div[title="Stroke color"] div[class="color-bullet is-not-library-color"]'
    );

    //Node panel
    this.firstNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=0'
    );
    this.secondNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=2'
    );
    this.thirdNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=3'
    );
    this.fourthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=4'
    );
    this.fifthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=5'
    );
    this.sixthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=6'
    );
    this.nodePanelAddNodeButton = page.locator('div[alt^="Add node"] >> nth=0');
    this.nodePanelDeleteNodeButton = page.locator(
      'div[alt^="Delete node"] >> nth=0'
    );
    this.nodePanelMergeNodesButton = page.locator(
      'div[alt^="Merge nodes"] >> nth=0'
    );
    this.nodePanelDrawNodesButton = page.locator(
      'div[alt="Draw nodes (P)"] >> nth=0'
    );
    this.nodePanelMoveNodesButton = page.locator(
      'div[alt="Move nodes (M)"] >> nth=0'
    );
    this.nodePanelJoinNodesButton = page.locator(
      'div[alt="Join nodes (J)"] >> nth=0'
    );
    this.nodePanelSeparateNodesButton = page.locator(
      'div[alt="Separate nodes (K)"] >> nth=0'
    );
    this.nodePanelToCornerButton = page.locator(
      'div[alt="To corner (X)"] >> nth=0'
    );
    this.nodePanelToCurveButton = page.locator(
      'div[alt="To curve (C)"] >> nth=0'
    );

    //Comments
    this.commentInput = page.locator("textarea >> nth=0");
    this.commentText = page.locator(
      'div[class="thread-content"] span[class="text"]'
    );
    this.commentCommentsPanelText = page.locator(
      'div[class="thread-groups"] span[class="text"]'
    );
    this.commentReplyText = page.locator(
      'div[class="thread-content"] span[class="text"]  >> nth=1'
    );
    this.commentReplyCommentsPanelText = page.locator(
      'div[class="thread-groups"] span:has-text("1 reply")'
    );
    this.postCommentButton = page.locator('input[value="Post"]');
    this.commentThreadIcon = page.locator(
      'div[class="thread-bubble "]  >> nth=1'
    );
    this.commentResolvedThreadIcon = page.locator(
      'div[class="thread-bubble resolved"]  >> nth=1'
    );
    this.commentReplyInput = page.locator('textarea[placeholder="Reply"]');
    this.commentOptionsButton = page.locator(
      'div[class="comments"] div[class="options-icon"] svg'
    );
    this.commentEditOptionMenuItem = page.locator(
      'ul[class="dropdown comment-options-dropdown"] li:has-text("Edit")'
    );
    this.commentDeleteOptionMenuItem = page.locator(
      'ul[class="dropdown comment-options-dropdown"] li:has-text("Delete thread")'
    );
    this.deleteThreadButton = page.locator(
      'input[value="Delete conversation"]'
    );
    this.resolveCommentCheckbox = page.locator(
      'div[class="options-resolve"] svg'
    );
    this.commentsPanelPlaceholderText = page.locator(
      'div[class="thread-groups-placeholder"]'
    );
    this.commentsAuthorSection = page.locator('div[class="author"]');

    //Main menu
    this.mainMenuButton = page.locator(
      'div[class="menu-section"] svg[class="icon-actions"]'
    );
    this.viewMainMenuItem = page.locator(
      'ul[class="menu"] span:has-text("View")'
    );
    this.viewMainMenuItem = page.locator(
      'ul[class="menu"] span:has-text("View")'
    );
    this.fileMainMenuItem = page.locator(
      'ul[class="menu"] span:has-text("File")'
    );
    this.showRulersMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show rulers")'
    );
    this.hideRulersMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Hide rulers")'
    );
    this.showBoardNamesMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show boards names")'
    );
    this.hideBoardNamesMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Hide board names")'
    );
    this.showPixelGridMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show pixel grid")'
    );
    this.hidePixelGridMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Hide pixel grid")'
    );
    this.showHideUIMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show/Hide UI")'
    );
    this.dowloadPenpotFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Download Penpot file (.penpot)")'
    );
    this.dowloadStandartFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Download standard file (.svg + .json)")'
    );
    this.addAsSharedLibraryFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Add as Shared Library")'
    );
    this.removeAsSharedLibraryFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Remove as Shared Library")'
    );

    //Zoom
    this.zoomPlusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("+")'
    );
    this.zoomMinusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("-")'
    );
    this.zoomResetButton = page.locator('button[class="reset-btn"]');
    this.zoomButton = page.locator('div[class="zoom-widget"]');
    this.zoomToFitAllMenuItem = page.locator('li:has-text("Zoom to fit all")');
    this.zoomSelectedMenuItem = page.locator('li:has-text("Zoom to selected")');
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');

    //Assets panel
    this.assetsTab = page.locator('div[data-id=":assets"]');
    this.assetsPanel = page.locator('div[class="assets-bar"]');
    this.librariesTab = page.locator('div[class="libraries-button"]');
    this.addSharedLibraryButton = page.locator('input[value="Add"]');
    this.removeSharedLibraryButton = page.locator('input[value="Remove"]');
    this.closeLibrariesPopUpButton = page.locator(
      'div[class="modal libraries-dialog"] svg[class="icon-close"]'
    );
    this.addAsSharedLibraryButton = page.locator(
      'input[value="Add as Shared Library"]'
    );
    this.removeAsSharedLibraryButton = page.locator(
      'input[value="Remove as Shared Library"]'
    );
    this.sharedLibraryBadge = page.locator('span:has-text("SHARED")');
    this.addPageButton = page.locator('div[class="add-page"] svg');
    this.firstPageListItem = page.locator(
      'ul[class="element-list pages-list"] div[class^="element-list-body"] >>nth=0'
    );
    this.secondPageListItem = page.locator(
      'ul[class="element-list pages-list"] div[class^="element-list-body"] >>nth=1'
    );
    this.thirdPageListItem = page.locator(
      'ul[class="element-list pages-list"] div[class^="element-list-body"] >>nth=1'
    );
    this.firstPageNameInput = page.locator(
      'ul[class="element-list pages-list"] div[class^="element-list-body"] input'
    );
    this.secondPageNameInput = page.locator(
      'ul[class="element-list pages-list"] div[class^="element-list-body"] input'
    );
    this.assetsPanelPagesSection = page.locator("#sitemap");
    this.renamePageMenuItem = page.locator(
      'li[class="context-menu-item "] a:has-text("Rename")'
    );
    this.duplicatePageMenuItem = page.locator(
      'li[class="context-menu-item "] a:has-text("Duplicate")'
    );
    this.deletePageMenuItem = page.locator(
      'li[class="context-menu-item "] a:has-text("Delete")'
    );
    this.collapseExpandPagesButton = page.locator(
      'div[class="collapse-pages"]'
    );
    this.pageTrashIcon = page.locator(
      'svg[class="icon-trash"] >> visible=true'
    );
    this.deletePageOkButton = page.locator('input[value="Ok"]');
    this.assetsTitleText = page.locator('div[class^="asset-title"]');
    this.assetsTypeSelector = page.locator('div[class="assets-bar"] select');
    this.fileLibraryGraphicsUploadImageSelector = page.locator(
      'div[class="libraries-wrapper"] input[accept="image/gif,image/png,image/svg+xml,image/webp,image/jpeg"]'
    );
    this.fileLibraryGraphicsUploadedImageLabel = page.locator(
      'div[class="grid-cell"]'
    );
    this.renameFileLibraryMenuItem = page.locator('li:has-text("Rename")');
    this.deleteFileLibraryMenuItem = page.locator('li:has-text("Delete")');
    this.editFileLibraryMenuItem = page.locator('li:has-text("Edit")');
    this.duplicateFileLibraryMenuItem = page.locator(
      'li:has-text("Duplicate")'
    );
    this.createGroupFileLibraryMenuItem = page.locator('li:has-text("Group")');
    this.renameGroupFileLibraryMenuItem = page.locator('li:has-text("Rename")');
    this.ungroupFileLibraryMenuItem = page.locator('li:has-text("Ungroup")');
    this.groupNameInput = page.locator("#asset-name");
    this.createGroupButton = page.locator('input[value="Create"]');
    this.renameGroupButton = page.locator('input[value="Rename"]');
    this.fileLibraryGroupTitle = page.locator('div[class="group-title "]');
    this.fileLibraryChangeViewButton = page.locator(
      'div[class="listing-option-btn"] svg'
    );
    this.addFileLibraryColorButton = page.locator(
      ".asset-section .icon-plus >>nth=1"
    );
    this.fileLibraryColorsColorBullet = page.locator(
      'div[class="color-bullet is-library-color"]'
    );
    this.fileLibraryColorsColorTitle = page.locator('div[class="name-block"]');
    this.fileLibraryColorsColorNameInput = page.locator(
      'input[class="element-name"]'
    );
    this.addFileLibraryTypographyButton = page.locator(
      'div[class="asset-section"] svg[class="icon-plus"] >>nth=2'
    );
    this.expandMinimizeFileLibraryTypographyButton = page.locator(
      'div[class="element-set-actions-button"] >> visible=true'
    );
    this.fileLibraryTypographyRecord = page.locator(
      'div[class^="element-set-options-group typography-entry"]'
    );
    this.fontSelector = page.locator('div[class="input-select font-option"]');
    this.fontSelectorSearchInput = page.locator(
      'div[class="font-selector-dropdown"] header input'
    );
    this.fontSizeSelector = page.locator(
      'div[class="editable-select input-option size-option"] span'
    );
    this.typographyNameInput = page.locator(
      'input[class="element-name adv-typography-name"]'
    );
    this.fontRecordOnTypographiesBottomPanel = page.locator(
      'div[class="typography-item"]'
    );
    this.fileLibraryGraphicsComponentLabel = page.locator(
      'div[class="grid-cell"]'
    );
    this.fileLibraryGraphicsSecondComponentLabel = page.locator(
      'div[class="grid-cell"] >>nth=1'
    );

    //Prototype panel
    this.prototypeTab = page.locator('div[data-id=":prototype"]');
    this.prototypeArrowConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-primary)"] >>nth=0'
    );
    this.prototypeArrowSecondConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-primary)"] >>nth=1'
    );
    this.prototypePanelFlowNameText = page.locator(
      'span[class="element-label flow-name"]'
    );
    this.prototypePanelFlowNameInput = page.locator(
      'input[class="element-name"]'
    );
    this.prototypePanelFirstFlowNameText = page.locator(
      'span[class="element-label flow-name"] >>nth=0'
    );
    this.prototypePanelSecondFlowNameText = page.locator(
      'span[class="element-label flow-name"] >>nth=1'
    );
    this.addInteractionButton = page.locator(
      'div:has-text("Interactions") svg[class="icon-plus"]'
    );
    this.removeSecondInteractionButton = page.locator(
      'div[class="element-set-actions-button"] svg[class="icon-minus"] >>nth=1'
    );
    this.firstInteractionRecord = page.locator(
      'div[class="interactions-summary"] >>nth=0'
    );
    this.secondInteractionRecord = page.locator(
      'div[class="interactions-summary"] >>nth=1'
    );
    this.interactionDestinationSelector = page.locator(
      'div[class="interactions-element"] select'
    );
    this.removeFlowButton = page.locator(
      'div[class="flow-element"] svg[class="icon-minus"]'
    );

    //Header
    this.savedChangesIcon = page.locator('div[class="saved"]');
    this.usersSection = page.locator('div[class="users-section"]');

    //History panel
    this.historyPanelButton = page.locator('button[class^="document-history"]');
    this.historyPanelActionRecord = page.locator(
      'div[class="history-entry-summary-text"]'
    );

    //Shortcuts panel
    this.shortcutsPanel = page.locator('div[class="shortcuts"]');

    //Colors panel
    this.colorsPanel = page.locator('div[class="color-palette "]');
  }

  async clickMoveButton() {
    await this.moveButton.click();
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
  }

  async clickCreatePathButton() {
    await this.createPathButton.click();
  }

  async clickViewportOnce() {
    await this.viewport.click();
  }

  async clickViewportTwice() {
    await this.viewport.click();
    await this.viewport.click();
  }

  async clickViewportByCoordinates(x, y) {
    await this.viewport.click({ position: { x: x, y: y } });
    await this.viewport.click({ position: { x: x, y: y } });
  }

  async waitForChangeIsSaved() {
    await expect(this.savedChangesIcon).toBeVisible();
  }

  async isCreatedLayerVisible() {
    await expect(this.createdLayer).toBeVisible();
  }

  async doubleClickCreatedBoardTitleOnCanvas() {
    await this.createdBoardTitle.dblclick();
  }

  async doubleClickCreatedLayerOnLayersPanel() {
    await this.createdLayerOnLayersPanelNameText.dblclick();
  }

  async renameCreatedLayer(newName) {
    await this.createdLayerOnLayersPanelNameInput.fill(newName);
    await this.clickMoveButton();
  }

  async isLayerNameDisplayed(name) {
    await expect(this.createdLayerOnLayersPanelNameText).toHaveText(name);
  }

  async isBoardNameDisplayed(name) {
    await expect(this.createdBoardTitle).toHaveText(name);
    await expect(this.createdLayerOnLayersPanelNameText).toHaveText(name);
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
    await expect(this.pencilBoxButton).toBeVisible();
  }

  async clickCanvasBackgroundColorIcon() {
    await this.canvasBackgroundColorIcon.click();
  }

  async clickAddShadowButton() {
    while (await this.shadowActionsButton.isHidden()) {
      await this.addShadowButton.click({ delay: 500 });
    }
  }

  async clickShadowActionsButton() {
    await this.shadowActionsButton.click();
  }

  async changeXForShadow(value) {
    await this.clearInput(this.shadowXInput);
    await this.shadowXInput.fill(value);
  }

  async changeYForShadow(value) {
    await this.clearInput(this.shadowYInput);
    await this.shadowYInput.fill(value);
  }

  async changeBlurForShadow(value) {
    await this.clearInput(this.shadowBlurInput);
    await this.shadowBlurInput.fill(value);
  }

  async changeSpreadForShadow(value) {
    await this.clearInput(this.shadowSpreadInput);
    await this.shadowSpreadInput.fill(value);
  }

  async changeOpacityForShadow(value) {
    await this.clearInput(this.shadowOpacityInput);
    await this.shadowOpacityInput.fill(value);
  }

  async clickShadowColorIcon() {
    await this.shadowColorIcon.click();
  }

  async selectTypeForShadow(type) {
    switch (type) {
      case "Drop shadow":
        await this.shadowTypeSelector.selectOption(":drop-shadow");
        break;
      case "Inner shadow":
        await this.shadowTypeSelector.selectOption(":inner-shadow");
        break;
    }
  }

  async clickAddBlurButton() {
    while (await this.blurValueInput.isHidden()) {
      await this.addBlurButton.click({ delay: 500 });
    }
  }

  async changeValueForBlur(value) {
    await this.clearInput(this.blurValueInput);
    await this.blurValueInput.fill(value);
  }

  async deleteLayerViaRightclick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.deleteLayerMenuItem.click();
  }

  async transformToPathViaRightclick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.transformToPathMenuItem.click();
  }

  async selectionToBoardViaRightclick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.selectionToBoardMenuItem.click();
  }

  async createComponentViaRightclick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.createComponentMenuItem.click();
  }

  async flipVerticalViaRightclick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.flipVerticalMenuItem.click();
  }

  async flipHorizontalViaRightclick() {
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

  async changeRotationForLayer(value) {
    await this.clearInput(this.layerRotationInput);
    await this.layerRotationInput.fill(value);
    await this.clickMoveButton();
  }

  async clickIndividualCornersRadiusButton() {
    await this.individualCornersRadiusButton.click();
  }

  async changeFirstCornerRadiusForLayer(value) {
    await this.firstCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeSecondCornerRadiusForLayer(value) {
    await this.secondCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeThirdCornerRadiusForLayer(value) {
    await this.thirdCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeFourthCornerRadiusForLayer(value) {
    await this.fourthCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async clickFillColorIcon() {
    await this.fillColorIcon.click();
  }

  async changeOpacityForFill(value) {
    await this.clearInput(this.fillOpacityInput);
    await this.fillOpacityInput.fill(value);
  }

  async openNodesPanelViaRightclick() {
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

  async clickCreateCommentButton() {
    await this.createCommentButton.click();
  }

  async enterCommentText(text) {
    await this.commentInput.fill(text);
  }

  async clickPostCommentButton() {
    await this.postCommentButton.click();
  }

  async clickCommentThreadIcon() {
    await this.commentThreadIcon.click();
  }

  async clickResolvedCommentThreadIcon() {
    await this.commentResolvedThreadIcon.click();
  }

  async enterReplyText(text) {
    await this.commentReplyInput.fill(text);
  }

  async clickCommentOptionsButton() {
    await this.commentOptionsButton.click();
  }

  async clickEditCommentOption() {
    await this.commentEditOptionMenuItem.click();
  }

  async clickDeleteCommentOption() {
    await this.commentDeleteOptionMenuItem.click();
  }

  async clearCommentInput() {
    await this.clearInput(this.commentInput);
  }

  async clickDeleteThreadButton() {
    await this.deleteThreadButton.click();
  }

  async clickResolveCommentCheckbox() {
    await this.resolveCommentCheckbox.click();
  }

  async isCommentDisplayedInPopUp(text) {
    await expect(this.commentText).toHaveText(text);
  }

  async isCommentDisplayedInCommentsPanel(text) {
    await expect(this.commentCommentsPanelText).toHaveText(text);
  }

  async isCommentReplyDisplayedInPopUp(text) {
    await expect(this.commentReplyText).toHaveText(text);
  }

  async isCommentReplyDisplayedInCommentsPanel() {
    await expect(this.commentReplyCommentsPanelText).toBeVisible();
  }

  async isCommentThreadIconDisplayed() {
    await expect(this.commentThreadIcon).toBeVisible();
  }

  async isCommentResolvedThreadIconDisplayed() {
    await expect(this.commentResolvedThreadIcon).toBeVisible();
  }

  async isCommentThreadIconNotDisplayed() {
    await expect(this.commentThreadIcon).not.toBeVisible();
  }

  async isCommentsPanelPlaceholderDisplayed(text) {
    await expect(this.commentsPanelPlaceholderText).toHaveText(text);
  }

  async isResolveCommentCheckboxSelected() {
    await expect(this.resolveCommentCheckbox).toHaveClass(
      "icon-checkbox-checked"
    );
  }

  async searchLayer(name) {
    await this.searchLayersIcon.click();
    await this.searchLayersInput.fill(name);
  }

  async isLayerSearched(name) {
    await expect(this.searchedLayerOnLayersPanelNameText).toHaveText(name);
  }

  async clickAddGridButton() {
    await this.addGridButton.click();
  }

  async clickRemoveGridButton() {
    await this.gridMainOptionSection.hover();
    await this.removeGridButton.click();
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

  async isFillHexCodeSet(value) {
    await expect(this.fillColorInput).toHaveValue(value);
  }

  async isFillOpacitySet(value) {
    await expect(this.fillOpacityInput).toHaveValue(value);
  }

  async clickAddFillButton() {
    await this.addFillButton.click();
  }

  async clickRemoveFillButton() {
    await this.removeFillButton.click();
  }

  async clickMainMenuButton() {
    await this.mainMenuButton.click();
  }

  async clickViewMainMenuItem() {
    await this.viewMainMenuItem.click();
  }

  async clickFileMainMenuItem() {
    await this.fileMainMenuItem.click();
  }

  async clickShowRulersMainMenuSubItem() {
    await this.showRulersMainMenuSubItem.click();
  }

  async clickHideRulersMainMenuSubItem() {
    await this.hideRulersMainMenuSubItem.click();
  }

  async pressHideShowRulersShortcut() {
    await this.page.keyboard.press("Control+Shift+R");
  }

  async pressHideShowRulersShortcutWebkit() {
    await this.page.keyboard.press("Meta+Shift+R");
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
    await this.zoomToFitAllMenuItem.click();
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

  async clickAssetsTab() {
    await this.assetsTab.click();
  }

  async switchToAssetsPanelViaShortcut() {
    await this.page.keyboard.press("Alt+I");
  }

  async isAssetsPanelDisplayed() {
    await expect(this.assetsPanel).toBeVisible();
  }

  async clickLayersTab() {
    await this.layersTab.click();
  }

  async switchToLayersPanelViaShortcut() {
    await this.page.keyboard.press("Alt+L");
  }

  async isLayersPanelDisplayed() {
    await expect(this.layersPanel).toBeVisible();
  }

  async clickAddAsSharedLibraryButton() {
    await this.addAsSharedLibraryButton.click();
  }

  async clickRemoveAsSharedLibraryButton() {
    await this.removeAsSharedLibraryButton.click();
  }

  async isSharedLibraryBadgeVisible() {
    await expect(this.sharedLibraryBadge).toBeVisible();
  }

  async isSharedLibraryBadgeNotVisible() {
    await expect(this.sharedLibraryBadge).not.toBeVisible();
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

  async renameFirstPageViaRightclick(newName) {
    await this.firstPageListItem.click({ button: "right" });
    await this.renamePageMenuItem.click();
    await this.clearInput(this.firstPageNameInput);
    await this.firstPageNameInput.fill(newName);
    await this.clickViewportTwice();
  }

  async renameSecondPageViaDoubleclick(newName) {
    await this.secondPageListItem.dblclick();
    await this.clearInput(this.secondPageNameInput);
    await this.secondPageNameInput.fill(newName);
    await this.clickViewportTwice();
  }

  async duplicatePageViaRightclick() {
    await this.firstPageListItem.click({ button: "right" });
    await this.duplicatePageMenuItem.click();
  }

  async clickFirstPageOnAssetsPanel() {
    await this.firstPageListItem.click();
    await expect(this.firstPageListItem).toHaveClass(
      "element-list-body selected"
    );
  }

  async clickSecondPageOnAssetsPanel() {
    await this.secondPageListItem.click();
    await expect(this.secondPageListItem).toHaveClass(
      "element-list-body selected"
    );
  }

  async clickCollapseExpandPagesButton() {
    await this.collapseExpandPagesButton.click();
  }

  async deleteSecondPageViaRightclick() {
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

  async dragAndDropPrototypeArrowConnector() {
    await this.prototypeArrowConnector.hover();
    await this.page.mouse.down();
    const box = await this.createdLayer.boundingBox();
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.up();
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
    await this.addInteractionButton.click();
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

  async selectInteractionDestination(boardName) {
    await this.interactionDestinationSelector.selectOption({
      label: boardName,
    });
  }

  async clickHistoryPanelButton() {
    await this.historyPanelButton.click();
  }

  async isActionDisplayedOnHistoryPanel(actionName) {
    await expect(this.historyPanelActionRecord).toHaveText(actionName);
  }

  async clickAddExportButton() {
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

  async selectTypeFromAllAssetsSelector(type) {
    switch (type) {
      case "All assets":
        await this.assetsTypeSelector.selectOption(":all");
        break;
      case "Components":
        await this.assetsTypeSelector.selectOption(":components");
        break;
      case "Graphics":
        await this.assetsTypeSelector.selectOption(":graphics");
        break;
      case "Colors":
        await this.assetsTypeSelector.selectOption(":colors");
        break;
      case "Typographies":
        await this.assetsTypeSelector.selectOption(":typographies");
        break;
    }
  }

  async isAssetsTitleDisplayed(title) {
    await expect(this.assetsTitleText).toHaveText(title);
  }

  async uploadImageToFileLibraryGraphics(filePath) {
    await this.fileLibraryGraphicsUploadImageSelector.setInputFiles(filePath);
  }

  async isImageUploadedToFileLibraryGraphics() {
    await expect(this.fileLibraryGraphicsUploadedImageLabel).toBeVisible();
  }

  async isImageNotUploadedToFileLibraryGraphics() {
    await expect(this.fileLibraryGraphicsUploadedImageLabel).not.toBeVisible();
  }

  async deleteFileLibraryGraphics() {
    await this.fileLibraryGraphicsUploadedImageLabel.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryGraphics(newGroupName) {
    await this.fileLibraryGraphicsUploadedImageLabel.click({ button: "right" });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async isFileLibraryGroupCreated(groupName) {
    await expect(this.fileLibraryGroupTitle).toHaveText(groupName);
  }

  async isFileLibraryGroupRemoved() {
    await expect(this.fileLibraryGroupTitle).not.toBeVisible();
  }

  async renameGroupFileLibrary(newGroupName) {
    await this.fileLibraryGroupTitle.click({ button: "right" });
    await this.renameGroupFileLibraryMenuItem.click();
    await this.clearInput(this.groupNameInput);
    await this.groupNameInput.fill(newGroupName);
    await this.renameGroupButton.click();
  }

  async ungroupFileLibrary() {
    await this.fileLibraryGroupTitle.click({ button: "right" });
    await this.ungroupFileLibraryMenuItem.click();
  }

  async clickFileLibraryChangeViewButton() {
    await this.fileLibraryChangeViewButton.click();
  }

  async clickAddFileLibraryColorButton() {
    await this.addFileLibraryColorButton.click();
  }

  async isColorAddedToFileLibraryColors(colorName) {
    await expect(this.fileLibraryColorsColorBullet).toBeVisible();
    await expect(this.fileLibraryColorsColorTitle).toHaveText(colorName);
  }

  async isColorNotAddedToFileLibraryColors() {
    await expect(this.fileLibraryColorsColorBullet).not.toBeVisible();
  }

  async editFileLibraryColor() {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryColor(newColorName) {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    await this.clearInput(this.fileLibraryColorsColorNameInput);
    await this.fileLibraryColorsColorNameInput.fill(newColorName);
  }

  async deleteFileLibraryColor() {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryColors(newGroupName) {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async clickFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({ delay: 500 });
  }

  async clickAndPressAltFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({
      delay: 500,
      modifiers: ["Alt"],
    });
  }

  async clickAddFileLibraryTypographyButton() {
    await this.addFileLibraryTypographyButton.click();
  }

  async minimizeFileLibraryTypography() {
    await this.expandMinimizeFileLibraryTypographyButton.click();
  }

  async expandFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.hover();
    await this.expandMinimizeFileLibraryTypographyButton.click();
  }

  async selectFont(fontName) {
    await this.fontSelector.click();
    await this.fontSelectorSearchInput.fill(fontName);
    await this.page
      .locator(
        `div[class="ReactVirtualized__Grid__innerScrollContainer"] div:has-text('${fontName}')`
      )
      .click();
  }

  async selectFontSize(value) {
    await this.fontSizeSelector.click();
    await this.page
      .locator(`ul[class="custom-select-dropdown"] li:has-text('${value}')`)
      .click();
  }

  async editFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryTypography(newName) {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    await this.clearInput(this.typographyNameInput);
    await this.typographyNameInput.fill(newName);
  }

  async deleteFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryTypographies(newGroupName) {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async clickFileLibraryTypographiesTypographyRecord() {
    await this.fileLibraryTypographyRecord.click();
  }

  async pressOpenTypographiesBottomPanelShortcut() {
    await this.page.keyboard.press("Alt+T");
  }

  async clickFontRecordOnTypographiesBottomPanel() {
    await this.fontRecordOnTypographiesBottomPanel.click();
  }

  async isComponentAddedToFileLibraryComponents() {
    await expect(this.fileLibraryGraphicsComponentLabel).toBeVisible();
  }

  async isSecondComponentAddedToFileLibraryComponents() {
    await expect(this.fileLibraryGraphicsSecondComponentLabel).toBeVisible();
  }

  async isComponentNotAddedToFileLibraryComponents() {
    await expect(this.fileLibraryGraphicsComponentLabel).not.toBeVisible();
  }

  async duplicateFileLibraryComponents() {
    await this.fileLibraryGraphicsComponentLabel.click({ button: "right" });
    await this.duplicateFileLibraryMenuItem.click();
  }

  async deleteFileLibraryComponents() {
    await this.fileLibraryGraphicsComponentLabel.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async clickLibrariesTab() {
    await this.librariesTab.click();
  }

  async clickAddSharedLibraryButton() {
    await this.addSharedLibraryButton.click();
  }

  async clickRemoveSharedLibraryButton() {
    await this.removeSharedLibraryButton.click();
  }

  async clickCloseLibrariesPopUpButton() {
    await this.closeLibrariesPopUpButton.click();
  }

  async expandFileLibraryOnAccessPanel(libraryName) {
    await this.page
      .locator(
        `div[class="tool-window-bar library-bar"] span:has-text('${libraryName}')`
      )
      .click();
  }

  async isFileLibraryOnAccessPanelNotDisplayed(libraryName) {
    await expect(
      this.page.locator(
        `div[class="tool-window-bar library-bar"] span:has-text('${libraryName}')`
      )
    ).not.toBeVisible();
  }

  async clickShortcutsPanelButton() {
    await this.shortcutsPanelButton.click();
  }

  async isShortcutsPanelDisplayed() {
    await expect(this.shortcutsPanel).toBeVisible();
  }

  async isShortcutsPanelNotDisplayed() {
    await expect(this.shortcutsPanel).not.toBeVisible();
  }

  async clickColorsPanelButton() {
    await this.colorsPanelButton.click();
  }

  async isColorsPanelDisplayed() {
    await expect(this.colorsPanel).toBeVisible();
  }

  async isColorsPanelNotDisplayed() {
    await expect(this.colorsPanel).not.toBeVisible();
  }

  async clickAddStrokeButton() {
    await this.addStrokeButton.click();
  }

  async clickStrokeColorBullet() {
    await this.strokeColorBullet.click();
  }
};
