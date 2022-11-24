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
    this.createdLayer = page.locator('div *[id^="fills"] >> nth=0');
    this.createdLayerTitle = page.locator('g[class="frame-title"]');
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
      'div[class="element-set"] input >> nth=12'
    );

    this.deleteLayerMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Delete")'
    );

    this.layerRotationInput = page.locator(
      'div[class="input-element degrees"] input'
    );

    this.singleCornerRadiusButton = page.locator('div[alt="Single corners"]');

    this.allCornersRadiusButton = page.locator('div[alt="All corners"]');

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

  async doubleClickCreatedLayerTitleOnCanvas() {
    await this.createdLayerTitle.dblclick();
  }

  async doubleClickCreatedLayerOnLayersPanel() {
    await this.createdLayerOnLayersPanelNameText.dblclick();
  }

  async renameCreatedLayer(newName) {
    await this.createdLayerOnLayersPanelNameInput.fill(newName);
    await this.clickMoveButton();
  }

  async isLayerNameDisplayed(name) {
    await expect(this.createdLayerTitle).toHaveText(name);
    await expect(this.createdLayerOnLayersPanelNameText).toHaveText(name);
  }

  async drawCurve(x1, y1, x2, y2) {
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

  async changeRotationForLayer(value) {
    await this.clearInput(this.layerRotationInput);
    await this.layerRotationInput.fill(value);
    await this.clickMoveButton();
  }

  async clickSingleCornerRadiusButton() {
    await this.singleCornerRadiusButton.click();
  }

  async clickAllCornersRadiusButton() {
    await this.allCornersRadiusButton.click();
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
};
