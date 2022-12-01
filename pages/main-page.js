const { expect } = require("@playwright/test");
exports.MainPage = class MainPage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    this.page = page;
    this.moveButton = page.locator('button[alt="Move (V)"]');
    this.createBoardButton = page.locator('button[data-test="artboard-btn"]');
    this.createRectangleButton = page.locator('button[data-test="rect-btn"]');
    this.createEllipseButton = page.locator('button[data-test="ellipse-btn"]');
    this.createTextButton = page.locator('button[alt="Text (T)"]');
    this.uploadImageSelector = page.locator("#image-upload");
    this.createCurveButton = page.locator('button[data-test="curve-btn"]');
    this.createPathButton = page.locator('button[data-test="path-btn"]');
    this.createCommentButton = page.locator('button[alt="Comments (C)"]');
    this.createdLayer = page.locator('div *[id^="fills"] >> nth=0');
    this.createdBoardTitle = page.locator('g[class="frame-title"]');
    this.createdLayerOnLayersPanelNameInput = page.locator(
      'input[class="element-name"]'
    );
    this.createdLayerOnLayersPanelNameText = page.locator(
      'span[class="element-name"]'
    );
    this.textbox = page.locator(
      'div[role="textbox"] div[contenteditable="true"]'
    );
    this.viewport = page.locator('div[class="viewport"]');
    this.savedChangesIcon = page.locator('div[class="saved"]');
    this.pencilBoxButton = page.locator('div[class="main-icon"]');
    this.usersSection = page.locator('div[class="users-section"]');
    this.canvasBackgroundColorIcon = page.locator(
      'div[class="color-bullet-wrapper"]'
    );
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
    this.addBlurButton = page.locator(
      'div[class="element-set"] div:has-text("Blur") svg'
    );
    this.blurValueInput = page.locator(
      'div[class="row-flex input-row"] div[class="input-element pixels"] input'
    );
    this.deleteLayerMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Delete")'
    );
    this.transformToPathMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Transform to path")'
    );
    this.selectionToBoardMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Selection to board")'
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
    this.fillColorIcon = page.locator(
      'div[title="Fill"] div[class="color-bullet-wrapper"]'
    );
    this.fillColorInput = page.locator(
      'div[title="Fill"] div[class="color-info"] input'
    );
    this.fillOpacityInput = page.locator(
      'div[title="Fill"] div[class="input-element percentail"] input'
    );
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
    this.nodePanelAddNodeButton = page.locator(
      'div[alt="Add node (Shift++)"] >> nth=0'
    );
    this.nodePanelDeleteNodeButton = page.locator(
      'div[alt="Delete node (Del)"] >> nth=0'
    );
    this.nodePanelMergeNodesButton = page.locator(
      'div[alt="Merge nodes (Ctrl+J)"] >> nth=0'
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
    this.commentAvatars = page.locator('div[class="avatar"]');
    this.fullNameInCommentTexts = page.locator('div[class="fullname"]');
    this.timeAgoInCommentTexts = page.locator('div[class="timeago"]');
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
    this.searchLayersIcon = page.locator('svg[class="icon-search"]');
    this.searchLayersInput = page.locator('input[placeholder="Search layers"]');
    this.searchedLayerOnLayersPanelNameText = page.locator(
      'span[class="element-name"] >> nth=1'
    );
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
    this.addFillButton = page.locator(
      'div[class="element-set"] div:has-text("Fill") svg'
    );
    this.removeFillButton = page.locator(
      'div[title="Fill"] svg[class="icon-minus"]'
    );
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
    this.zoomPlusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("+")'
    );
    this.zoomMinusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("-")'
    );
    this.zoomButton = page.locator('div[class="zoom-widget"]');
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');
    this.assetsTab = page.locator('div[data-id=":assets"]');
    this.addAsSharedLibraryButton = page.locator(
      'input[value="Add as Shared Library"]'
    );
    this.removeAsSharedLibraryButton = page.locator(
      'input[value="Remove as Shared Library"]'
    );
    this.sharedLibraryBadge = page.locator('span:has-text("SHARED")');
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

  async uploadImage(filePath) {
    await this.uploadImageSelector.setInputFiles(filePath);
  }

  async clickCreateCurveButton() {
    await this.createCurveButton.click();
  }

  async clickCreatePathButton() {
    await this.createPathButton.click();
  }

  async clickViewport() {
    await this.viewport.click();
    await this.viewport.click();
  }

  async clickViewportByCoordinates(x, y) {
    await this.page.mouse.click(x, y);
  }

  async waitForChangeIsSaved() {
    await expect(this.savedChangesIcon).toBeVisible();
  }

  async isCreatedLayerVisible() {
    await expect(this.createdLayer).toBeVisible();
  }

  async checkHtmlOfCreatedLayer(expectedHTML) {
    expect(await this.createdLayer.innerHTML()).toEqual(expectedHTML);
  }

  async checkPartialHtmlOfCreatedLayer(expectedHTML) {
    expect(await this.createdLayer.innerHTML()).toContain(expectedHTML);
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
    await this.addShadowButton.click();
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

  async clearInput(input) {
    await input.click();
    let text = await input.inputValue();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
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
    await this.addBlurButton.click();
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
};
