const { expect } = require("@playwright/test");
const { BasePage } = require("../base-page");

exports.DesignPanelPage = class DesignPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Design panel
    this.canvasBackgroundColorIcon = page.locator(
      'div[class*="page__element-set"] span[class*="color-bullet-wrapper"]',
    );
    this.layerRotationInput = page.locator('div[title="Rotation"] input');
    this.individualCornersRadiusButton = page.locator(
      'button[title="Independent corners"]',
    );
    this.allCornersRadiusButton = page.locator('button[title="All corners"]');
    this.generalCornerRadiusInput = page.locator('div[title="Radius"] input');
    this.topLeftCornerRadiusInput = page.locator('div[title="Top left"] input');
    this.topRightCornerRadiusInput = page.locator(
      'div[title="Top right"] input',
    );
    this.bottomLeftCornerRadiusInput = page.locator(
      'div[title="Bottom left"] input',
    );
    this.bottomRightCornerRadiusInput = page.locator(
      'div[title="Bottom right"] input',
    );
    this.sizeWidthInput = page.locator('div[title="Width"] input');
    this.sizeHeightInput = page.locator('div[title="Height"] input');

    //Design panel - Fill section
    this.fillColorIcon = page.locator(
      'div[class*="fill__element-set"] div[class*="color-bullet-wrapper"]',
    );
    this.fillColorInput = page.locator(
      'div[title="Fill"] div[class="color-info"] input',
    );
    this.fillOpacityInput = page.locator(
      'div[class*="opacity-element-wrapper"] input',
    );
    this.addFillButton = page.locator(
      'div[class="element-set"] div:has-text("Fill") svg',
    );
    this.removeFillButton = page.locator(
      'div[title="Fill"] svg[class="icon-minus"]',
    );

    //Design panel - Shadow section
    this.shadowSection = page.locator(
      'div[class*="shadow__element-title"]:has-text("Shadow")',
    );
    this.addShadowButton = page.locator('button[class*="shadow__add-shadow"]');
    this.shadowActionsButton = page.locator(
      'button[class*="shadow__more-options"]',
    );
    this.shadowXInput = page.locator(
      'div[class*="shadow-advanced-options"] div[title="X"] input',
    );
    this.shadowYInput = page.locator(
      'div[class*="shadow-advanced-options"] div[title="Y"] input',
    );
    this.shadowBlurInput = page.locator('div[title="Blur"] input');
    this.shadowSpreadInput = page.locator('div[title="Spread"] input');
    this.shadowColorIcon = page.locator(
      'div[class*="shadow-advanced-options"] span[class*="color-bullet-wrapper"]',
    );
    this.shadowOpacityInput = page.locator(
      'div[class*="shadow-advanced-options"] div[class*="color_row__opacity"] input',
    );
    this.shadowShowIcon = page.locator(
      'div[class*="shadow__actions"] svg[class="icon-shown-refactor"]',
    );
    this.shadowUnhideIcon = page.locator(
      'div[class*="shadow__actions"] svg[class="icon-hide-refactor"]',
    );
    this.shadowRemoveIcon = page.locator(
      'div[class*="shadow__actions"] svg[class="icon-remove-refactor"]',
    );
    this.shadowTypeField = page.locator('div[class*="shadow-type-select"]');

    // 'Flex element' section
    this.flexElementSection = page.locator(
      'div[class="element-set-content layout-item-menu"]',
    );
    this.flexElementAlignStartBtn = page.locator(
      'div.layout-item-menu button[alt="Align self start"]',
    );
    this.flexElementAlignCenterBtn = page.locator(
      'div.layout-item-menu button[alt="Align self center"]',
    );
    this.flexElementAlignEndBtn = page.locator(
      'div.layout-item-menu button[alt="Align self end"]',
    );
    this.flexElementMarginVertInput = page.locator(
      'div[class="margin-row"] div[alt="Vertical margin"] input',
    );
    this.flexElementMarginHorizontInput = page.locator(
      'div[class="margin-row"] div[alt="Horizontal margin"] input',
    );
    this.flexElementPositionAbsolute = page.locator(
      'div[class="layout-row"] button[alt="Absolute"]',
    );

    //Design panel - Blur section
    this.blurSection = page.locator(
      'div[class*="blur__element-title"]:has-text("Blur")',
    );
    this.addBlurButton = page.locator('button[class*="blur__add-blur"]');
    this.blurMoreOptions = page.locator('button[class*="blur__show-more"]');
    this.blurValueInput = page.locator("#blur-input-sidebar");
    this.blurHideIcon = page.locator(
      'div[class*="blur__actions"] svg[class="icon-shown-refactor"]',
    );
    this.blurUnhideIcon = page.locator(
      'div[class*="blur__actions"] svg[class="icon-hide-refactor"]',
    );
    this.blurRemoveIcon = page.locator(
      'div[class*="blur__actions"] svg[class="icon-remove-refactor"]',
    );

    //Design panel - Stroke section
    this.addStrokeButton = page.locator('button[class*="add-stroke"]');
    this.strokeSection = page.locator(
      'div[class*="stroke__element-title"]:has-text("Stroke")',
    );
    this.strokeColorBullet = page.locator(
      'div[class*="stroke-data"] div[class*="color_bullet_new__is-not-library-color"]',
    );
    this.strokeRemoveIcon = page.locator(
      'div[title="Stroke color"] .icon-minus',
    );
    this.strokeColorInput = page.locator(
      'div[class*="stroke-data"] input[class*="color-input"]',
    );
    this.strokeWidthInput = page.locator(
      'div[class*="stroke-data"] input[class*="width-input"]',
    );
    this.strokeOpacityInput = page.locator(
      'div[class*="stroke-data"] input[class*="opacity-input"]',
    );
    this.strokePositionSelect = page.locator(
      '//div[@title="Stroke width"]/parent::div//select[1]',
    );
    this.strokeTypeSelect = page.locator(
      '//div[@title="Stroke width"]/parent::div//select[2]',
    );

    //Design panel - Text section
    this.textUpperCaseIcon = page.locator("svg.icon-text-uppercase-refactor");
    this.textLowerCaseIcon = page.locator("svg.icon-text-lowercase-refactor");
    this.textTitleCaseIcon = page.locator("svg.icon-text-mixed-refactor");
    this.textMoreOptionsIcon = page.locator(
      'button[class*="text__more-options"]',
    );
    this.textVerticalOptionsBlock = page.locator(
      'div[class*="vertical-align-options"]',
    );
    this.textAlignTop = page.locator("svg.icon-text-top-refactor");
    this.textAlignMiddle = page.locator("svg.icon-text-middle-refactor");
    this.textAlignBottom = page.locator("svg.icon-text-bottom-refactor");
    this.textIconLTR = page.locator("svg.icon-text-ltr-refactor");
    this.textIconRTL = page.locator("svg.icon-text-rtl-refactor");
  }

  async waitFlexElementSectionExpanded() {
    await expect(this.flexElementSection).toBeVisible();
  }

  async changeFlexElementAlignment(alignment) {
    switch (alignment) {
      case "Start":
        await this.flexElementAlignStartBtn.click();
        break;
      case "Center":
        await this.flexElementAlignCenterBtn.click();
        break;
      case "End":
        await this.flexElementAlignEndBtn.click();
        break;
    }
  }

  async changeFlexElementVerticalMargin(value) {
    await this.flexElementMarginVertInput.fill(value);
    await this.clickOnEnter();
  }

  async changeFlexElementHorizontalMargin(value) {
    await this.flexElementMarginHorizontInput.fill(value);
    await this.clickOnEnter();
  }

  async setFlexElementPositionAbsolute() {
    await this.flexElementPositionAbsolute.click();
  }

  async clickAddStrokeButton() {
    await this.strokeSection.waitFor();
    await this.addStrokeButton.click();
  }

  async clickStrokeColorBullet() {
    await this.strokeColorBullet.click();
  }

  async removeStroke() {
    await this.strokeRemoveIcon.click();
  }

  async setStrokeColor(value) {
    await this.strokeColorInput.fill(value);
    await this.clickOnEnter();
  }

  async setStrokePosition(value) {
    switch (value) {
      case "Center":
        await this.strokePositionSelect.selectOption(":center");
        break;
      case "Inside":
        await this.strokePositionSelect.selectOption(":inner");
        break;
      case "Outside":
        await this.strokePositionSelect.selectOption(":outer");
        break;
    }
  }

  async setStrokeType(value) {
    if (await this.strokeTypeSelect.isHidden()) return;
    switch (value) {
      case "Solid":
        await this.strokeTypeSelect.selectOption(":solid");
        break;
      case "Dotted":
        await this.strokeTypeSelect.selectOption(":dotted");
        break;
      case "Dashed":
        await this.strokeTypeSelect.selectOption(":dashed");
        break;
      case "Mixed":
        await this.strokeTypeSelect.selectOption(":mixed");
        break;
    }
  }

  async setStrokeWidth(value) {
    await this.strokeWidthInput.fill(value);
    await this.clickOnEnter();
  }

  async setStrokeOpacity(value) {
    await this.strokeOpacityInput.fill(value);
    await this.clickOnEnter();
  }

  async changeStrokeSettings(color, opacity, width, position, type = "") {
    await this.setStrokeColor(color);
    await this.setStrokeOpacity(opacity);
    await this.setStrokeWidth(width);
    await this.setStrokePosition(position);
    await this.setStrokeType(type);
  }

  async clickFillColorIcon() {
    await this.fillColorIcon.click();
  }

  async changeOpacityForFill(value) {
    await this.fillOpacityInput.fill(value);
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

  async clickCanvasBackgroundColorIcon() {
    await this.canvasBackgroundColorIcon.click();
  }

  async changeRotationForLayer(value) {
    await this.layerRotationInput.fill(value);
    await this.clickOnEnter();
  }

  async clickIndividualCornersRadiusButton() {
    await this.individualCornersRadiusButton.click();
  }

  async changeIndependentCorners(topLeft, topRight, bottomLeft, bottomRight) {
    await this.changeTopLeftCornerRadiusForLayer(topLeft);
    await this.changeTopRightCornerRadiusForLayer(topRight);
    await this.changeBottomLeftCornerRadiusForLayer(bottomLeft);
    await this.changeBottomRightCornerRadiusForLayer(bottomRight);
  }

  async clickAllCornersRadiusButton() {
    await this.allCornersRadiusButton.click();
  }

  async changeGeneralCornerRadiusForLayer(value) {
    await this.generalCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeTopLeftCornerRadiusForLayer(value) {
    await this.topLeftCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeTopRightCornerRadiusForLayer(value) {
    await this.topRightCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeBottomLeftCornerRadiusForLayer(value) {
    await this.bottomLeftCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeBottomRightCornerRadiusForLayer(value) {
    await this.bottomRightCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeWidthForLayer(width) {
    await this.sizeWidthInput.fill(width);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeHeightForLayer(height) {
    await this.sizeHeightInput.fill(height);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeHeightAndWidthForLayer(height, width) {
    await this.changeWidthForLayer(width);
    await this.changeHeightForLayer(height);
  }

  async clickAddShadowButton() {
    await this.shadowSection.waitFor();
    await this.addShadowButton.click();
  }

  async clickShadowActionsButton() {
    await this.shadowActionsButton.click();
  }

  async changeShadowSettings(x, y, blur, spread, opacity) {
    await this.changeXForShadow(x);
    await this.changeYForShadow(y);
    await this.changeBlurForShadow(blur);
    await this.changeSpreadForShadow(spread);
    await this.changeOpacityForShadow(opacity);
  }

  async changeXForShadow(value) {
    await this.shadowXInput.fill(value);
  }

  async changeYForShadow(value) {
    await this.shadowYInput.fill(value);
  }

  async changeBlurForShadow(value) {
    await this.shadowBlurInput.fill(value);
  }

  async changeSpreadForShadow(value) {
    await this.shadowSpreadInput.fill(value);
  }

  async changeOpacityForShadow(value) {
    await this.shadowOpacityInput.fill(value);
  }

  async clickShadowColorIcon() {
    await this.shadowColorIcon.click();
  }

  async selectTypeForShadow(type) {
    await this.shadowTypeField.click();
    const typeOptionSel = this.page.locator(`li:has-text("${type}")`);
    await typeOptionSel.click();
  }

  async hideShadow() {
    await this.shadowShowIcon.click();
  }

  async unhideShadow() {
    await this.shadowUnhideIcon.click();
  }

  async removeShadow() {
    await this.shadowRemoveIcon.click();
  }

  async clickAddBlurButton() {
    await this.blurSection.waitFor();
    await this.addBlurButton.click({ delay: 500 });
  }

  async changeValueForBlur(value) {
    await this.blurMoreOptions.click();
    await this.blurValueInput.fill(value);
  }

  async hideBlur() {
    await this.blurHideIcon.click();
  }

  async unhideBlur() {
    await this.blurUnhideIcon.click();
  }

  async removeBlur() {
    await this.blurRemoveIcon.click();
  }

  async changeTextCase(value) {
    switch (value) {
      case "Upper":
        await this.textUpperCaseIcon.click();
        break;
      case "Lower":
        await this.textLowerCaseIcon.click();
        break;
      case "Title":
        await this.textTitleCaseIcon.click();
        break;
    }
  }

  async openTextMoreOptionsBlock() {
    if (!(await this.textVerticalOptionsBlock.isVisible())) {
      await this.textMoreOptionsIcon.click({ force: true });
    }
    await expect(this.textVerticalOptionsBlock).toBeVisible();
  }

  async changeTextAlignment(value) {
    await this.openTextMoreOptionsBlock();
    switch (value) {
      case "Top":
        await this.textAlignTop.click();
        break;
      case "Middle":
        await this.textAlignMiddle.click();
        break;
      case "Bottom":
        await this.textAlignBottom.click();
        break;
    }
  }

  async changeTextDirection(value) {
    await this.openTextMoreOptionsBlock();
    switch (value) {
      case "RTL":
        await this.textIconRTL.click();
        break;
      case "LTR":
        await this.textIconLTR.click();
        break;
    }
  }
};
