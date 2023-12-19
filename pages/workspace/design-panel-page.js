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
      'div[class*="fill__element-content"] input[class*="color-input"]',
    );
    this.fillOpacityInput = page.locator(
      'div[class*="fill__element-content"] div[class*="opacity-element-wrapper"] input',
    );
    this.addFillButton = page.locator(
      'button[class*="fill__add-fill"]',
    );
    this.removeFillButton = page.locator(
      'div[class*="fill__element-content"] svg[class="icon-remove-refactor"]',
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

    //Design panel - Flex Layout section
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
    this.removeLayoutButton = page.locator(
        'div[class="element-set-title"] button[class="remove-layout"]',
    );
    this.layoutSection = page.locator(
        'div[class*="layout_container__element-title"]:has-text("Layout")',
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

    //Design panel - Export section
    this.exportSection = page.locator(
        'div[class*="exports__element-title"]:has-text("Export")',
    );
    this.addExportButton = page.locator(
        'button[class*="exports__add-export"]',
    );
    this.removeExportButton = page.locator(
        'button[class*="exports__action-btn"] svg[class="icon-remove-refactor"]',
    );
    this.exportElementButton = page.locator(
        'button[class*="exports__export-btn"]',
    );

    //Design panel - Grid section
    this.gridSection = page.locator('div[class*=element-set]:has-text("Guides")');
    this.gridMainOptionSection = page.locator('div[class="grid-option-main"]');
    this.addGridButton = page.locator(
        'button[class*="grid__add-grid"]',
    );
    this.removeGridButton = page.locator(
        'div[class*="grid__actions"] svg[class="icon-remove-refactor"]',
    );
    this.hideGridButton = page.locator(
        'div[class*="grid__actions"] svg[class="icon-shown-refactor"]',
    );
    this.unhideGridButton = page.locator(
        'div[class*="grid__actions"] svg[class="icon-hide-refactor"]',
    );
    this.gridTypeField = page.locator(
        'div[class*="grid__option-row"] div[class*="type-select-wrapper"]',
    );
    this.gridTypeSelectorSquareOption = page.locator('span:has-text("Square")');
    this.gridTypeSelectorColumnsOption = page.locator(
        'span:has-text("Columns")',
    );
    this.gridTypeSelectorRowsOption = page.locator('span:has-text("Rows")');
    this.gridSizeInput = page.locator('div[title="Size"] input');
    this.gridColumnsRowsInput = page.locator('div[class*="grid__column-select"] input');
    this.gridActionsButton = page.locator(
        'button[class*="grid__show-options"]',
    );
    this.gridOpacityInput = page.locator(
        'div[class*="grid__advanced-row"] input[class*="opacity-input"]',
    );
    this.gridMoreOptionsButton = page.locator(
        'div[class*="grid__advanced-row"] button[class*="show-more-options"]'
    );
    this.useDefaultGridButton = page.locator('button:has-text("Use default")');
    this.gridWidthInput = page.locator(
        'div[title="Width"] input[class*="grid__numeric-input"]',
    );
    this.gridHeightInput = page.locator(
        'div[title="Height"] input[class*="grid__numeric-input"]',
    );
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

  async isLayoutSectionExists(condition = true) {
    if (condition === true) {
      await expect(this.layoutSection).toBeVisible();
    } else {
      await expect(this.layoutSection).not.toBeVisible();
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

  async clickAddGridButton() {
    await this.gridSection.waitFor();
    await this.addGridButton.click();
  }

  async clickRemoveGridButton() {
    await this.removeGridButton.click();
  }

  async clickHideGridButton() {
    await this.hideGridButton.click();
  }

  async clickUnhideGridButton() {
    await this.unhideGridButton.click();
  }

  async changeSizeForGrid(value) {
    await this.gridSizeInput.fill(value);
  }

  async clickGridActionsButton() {
    await this.gridActionsButton.click();
  }

  async changeOpacityForGrid(value) {
    await this.gridOpacityInput.fill(value);
  }

  async clickUseDefaultGridButton() {
    await this.gridMoreOptionsButton.click();
    await this.useDefaultGridButton.click();
  }

  async selectGridType(type) {
    await this.gridTypeField.click();
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
    await this.gridColumnsRowsInput.fill(value);
  }

  async changeWidthForGrid(value) {
    await this.gridWidthInput.fill(value);
  }

  async changeHeightForGrid(value) {
    await this.gridHeightInput.fill(value);
  }

};
